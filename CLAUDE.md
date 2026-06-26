# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A real-time, multiplayer Jeopardy-style quiz game (modeled on the SIGame `.siq` pack format). A Django + Channels backend drives a WebSocket-based game state machine; a Next.js frontend renders the board and is served through the Django ASGI process via the `django-nextjs` proxy.

## Running & common commands

Everything runs through Docker Compose, wrapped by the `Makefile`. There is no host-based dev setup.

- `make build` — build images
- `make up` / `make down` / `make clean` (clean also drops volumes)
- `make backend-logs` / `make frontend-logs`
- `make backend-shell` — shell into the Django container
- `make backend-restart` / `make frontend-restart`

Services (see `docker-compose.yml`): `mygame` (Django/Daphne on :8000), `frontend-app-mygame` (Next.js dev on :3000), `mysql` (5.7 on :3306), `redis` (:6379).

Inside the backend container (`make backend-shell`), use Django management commands directly:
- `python manage.py migrate`
- `python manage.py test` (or `python manage.py test game` for one app, `python manage.py test game.tests.SomeTest` for one test). Note: test files are currently empty stubs.

Copy `.env_example` to `.env` before first run. `manage.py` defaults to `mygame.settings.development`, but `docker-compose.yml` passes `--settings=mygame.settings.development` explicitly.

No linter or formatter is configured. The frontend has no test setup.

## Settings layout

`mygame/settings/common.py` is the base and reads everything from env vars (`os.environ.get`). `mygame/settings/development.py` imports `*` from common and **hardcodes** the MySQL, Redis channel layer, and Next.js proxy config for the Docker network (hostnames `mysql`, `redis`, `frontend-app-mygame`). The hardcoded development values override the env-driven ones, so changing `.env` alone won't affect a dev run.

Gotcha: `mygame/asgi.py` sets `DJANGO_SETTINGS_MODULE` to `mygame.settings.common` (not development). The compose command overrides this with `--settings` only for `runserver`; be aware the two entry points can diverge.

## Architecture

### Backend apps (Django)
- `game` — core game logic, the WebSocket consumer, and the game REST API. This is where almost all real work lives.
- `chat` — simple message model + a chat WebSocket consumer.
- `registration` — server-rendered login/register (Django templates).
- `user_profile` — user profile + a `/profiles/api/user_id` endpoint the frontend uses to identify the current user.
- `mygame` — project config (settings, urls, asgi/wsgi, routing) and shared templates/static.

### Real-time game flow (the heart of the system)
The game is a **server-authoritative state machine**, structured in three layers so the decision logic is pure and unit-testable in isolation:

1. **`game/engine.py` — pure decision logic (no Django, no I/O).** `decide(state, event, ctx) -> Transition(next_state, effects) | Rejected(reason)`. Rules are keyed by `event`; each rule's guard is a predicate over `(state, roles, payload)`. Effects are small declarative value objects (`ResetPlayers`, `SetActivePlayer`, `SetResponder`, `ScoreResponder`, `SetActiveQuestion`, `SetActiveRound`, `SetScore`, …) describing *what* changes, not *how*. This file is the heart of the logic and has thorough table-driven unit tests (`game/tests/test_engine.py`, no DB).
2. **`game/services.py` — the only ORM layer.** `apply_event(game_id, user_id, event, payload) -> ApplyResult` loads the `Game` with `select_for_update()` inside a transaction (reads fresh state + serializes concurrent events — this is the correctness fix for the old per-connection stale cache), computes the actor's roles, calls `engine.decide`, and on accept applies the returned effects to the DB via `_apply_effect` and saves. On `Rejected` it mutates nothing.
3. **`game/consumers.py::GameConsumer` — thin transport.** `receive()` maps the incoming message `type` to an engine event, calls `services.apply_event`, and **broadcasts to the game group only when the result is accepted**. Each broadcast `type` has a matching handler method that forwards the event to clients. Server-side countdowns are modeled as engine events (`EV_QUESTION_TIMEOUT`, `EV_ANSWER_TIMEOUT`); a single tracked timer task per kind is cancelled before a new one starts. The answer countdown / `show_answer` reveal is keyed on the *resulting* state (`SHOW_ANSWER`), so a correct `review_answer` (which transitions straight to `SHOW_ANSWER`) still reveals the answer and starts the 5s auto-advance. DB access from async code goes through `database_sync_to_async`.

State values live in `Game.STATE_CHOICES` (`SELECT_ACTIVE_USER → SELECT_QUESTION → SHOW_QUESTION → ANSWERING → SHOW_ANSWER → ...`); `engine.py` mirrors them as constants. The `Game` model holds data + read-only role/query helpers (`is_creator`, `is_player`, `is_active_player`, `is_player_can_answer`, `is_all_players_answered`) — **no mutation methods**.

To add a new game action: add an event constant + a rule (guard, target, effects) in `engine.py`, interpret any new effect in `services._apply_effect`, add the `type` to `_CLIENT_EVENTS` and a broadcast forwarder method in `GameConsumer`, and cover it with engine unit tests. Mutations belong in the engine (decision) + service (effect application), never in the consumer or as model methods.

### Frontend ↔ backend contract
`frontend-app-mygame/context/GameContext.js` is the single source of truth on the client. It opens one WebSocket (`/ws/game/<id>/`) and, for most incoming messages, **re-fetches full game state over REST** (`GET /game/api/<id>`) rather than applying deltas — only timer messages (`question_time_left`, `answer_time_left`) update local state directly. So the WebSocket largely acts as a "something changed, re-pull" signal. Players are identified via `GET /profiles/api/user_id`.

### Game content ingestion
Games are created by uploading a SIGame `.siq` zip (`POST /game/api/`). `game/api/utils.py`:
- `parse_content_xml_from_zip` parses `content.xml` into the nested `rounds → themes → questions` JSON stored in `Game.data` (a `JSONField`).
- `parse_and_save_files_from_zip` extracts `Video/`, `Audio/`, `Images/` to `MEDIA_ROOT/<game_id>/...`.

### Routing
- HTTP/WebSocket protocol routing: `mygame/asgi.py` (`ProtocolTypeRouter`). Non-`_next` HTTP falls through to Django; `_next/*` is proxied to the Next.js server. WebSockets are wrapped in `AuthMiddlewareStack` (so `scope["user"]` is available in consumers).
- WebSocket URLs: `mygame/routing.py`.
- HTTP URLs: `mygame/urls.py` → per-app `urls.py`. REST endpoints live under each app's `api/urls.py`. Swagger UI at `/swagger/`.

## Conventions
- **Do not commit documentation** — and **especially never commit design specs or implementation plans** (e.g. anything under `docs/superpowers/specs/` or `docs/superpowers/plans/`). Write and update docs, specs, and plans in the working tree, but always leave them uncommitted; they are not part of the repo history.
- REST code for an app lives in `<app>/api/` (`views.py`, `serializers.py`, `urls.py`); keep it separate from the server-rendered views in `<app>/views.py`.
- Game state transitions are decided in the pure `game/engine.py` and applied to the DB in `game/services.py` (see "Real-time game flow"). Keep decision logic pure (no ORM in `engine.py`), keep all persistence in `services.py`, and keep `consumers.py` thin (transport only). The `Game` model carries data + read-only helpers, not mutation methods.
