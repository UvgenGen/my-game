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
The game is a **server-authoritative state machine**. State lives on `game.models.Game.state` (`STATE_CHOICES`: `SELECT_ACTIVE_USER → SELECT_QUESTION → SHOW_QUESTION → ANSWERING → SHOW_ANSWER → ...`). All transition logic is methods on the `Game` model (`set_active_player`, `show_question`, `set_responder`, `review_answer`, `show_answer`, `set_active_round`, etc.) — keep transitions there, not in the consumer.

`game/consumers.py::GameConsumer` is the WebSocket hub:
- `receive()` → `set_timer()` (kicks off countdowns) then `update_and_send()`.
- `update_and_send()` dispatches on the incoming message's `type` field to a permission-gated `_update_*` handler (each checks `is_creator` / `is_active_player` / current state before mutating), then **broadcasts the original message to the whole game group**. Each broadcast `type` has a matching handler method that forwards the event to clients.
- Server-side timers run as asyncio tasks: `question_countdown` (45s, ends by broadcasting `show_answer`) and `answer_countdown` (5s, transitions back to `SELECT_QUESTION`). DB access from async code goes through `database_sync_to_async`.

To add a new game action: add a `_update_<type>` handler + a matching broadcast method in `GameConsumer`, and (if it changes state) a transition method on `Game`.

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
- Game state mutations belong on the `Game` model and must `self.save()`; consumers only orchestrate and enforce permissions.
