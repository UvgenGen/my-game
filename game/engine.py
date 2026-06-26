"""Pure game state machine: the decision layer of the game.

This module has no Django, channels, or I/O dependencies so it can be unit
tested in isolation. The single entry point is :func:`decide`, which maps a
``(state, event, ctx)`` triple to either a :class:`Transition` (the next state
plus declarative effects for the service layer to apply) or a
:class:`Rejected` (the event is not allowed; nothing should change).

Rules are keyed by event; each rule's guard is a predicate over the current
state, the actor's roles, and the event payload carried on the
:class:`Context`. The ``game.services`` layer computes the context from the
database and interprets the returned effects against the ORM.
"""
from dataclasses import dataclass, field

# --- States (must equal Game.STATE_CHOICES values) ---
SELECT_ACTIVE_USER = "SELECT_ACTIVE_USER"
SELECT_QUESTION = "SELECT_QUESTION"
SHOW_QUESTION = "SHOW_QUESTION"
ANSWERING = "ANSWERING"
SHOW_ANSWER = "SHOW_ANSWER"
CAT_IN_A_BAG = "CAT_IN_A_BAG"
RATE_QUESTION = "RATE_QUESTION"
FINAL = "FINAL"

# --- Events (values equal the frontend message `type` strings) ---
EV_SET_ACTIVE_PLAYER = "set_active_player"
EV_SHOW_QUESTION = "show_question"
EV_ANSWERING = "answering"
EV_SHOW_ANSWER = "show_answer"
EV_REVIEW_ANSWER = "review_answer"
EV_UPDATE_ROUND = "update_round"
EV_UPDATE_SCORE = "update_score"
EV_JOIN_PLAYER = "join_player"
EV_QUESTION_TIMEOUT = "question_timeout"
EV_ANSWER_TIMEOUT = "answer_timeout"

# --- Roles ---
CREATOR = "creator"
ACTIVE_PLAYER = "active_player"
RESPONDER = "responder"
PLAYER = "player"


@dataclass
class Context:
    """Everything a rule needs to decide, computed fresh by the service.

    ``roles`` is the set of role constants the acting user holds for this game,
    ``user_id`` is the authenticated actor, ``payload`` is the raw client
    message, and the booleans are precomputed facts about the players the rules
    branch on.
    """

    roles: frozenset = frozenset()
    user_id: int = 0
    payload: dict = field(default_factory=dict)
    can_answer: bool = False
    has_responder: bool = False


# --- Effects (declarative; interpreted by game.services._apply_effect) ---
@dataclass(frozen=True)
class ResetPlayers:
    """Clear ``is_active``, ``is_responder`` and ``answered`` on all players."""


@dataclass(frozen=True)
class ClearResponders:
    """Clear ``is_responder`` on all players."""


@dataclass(frozen=True)
class ClearAnswered:
    """Clear ``answered`` on all players."""


@dataclass(frozen=True)
class SetActivePlayer:
    """Mark the player with ``user_id`` as the active player."""

    user_id: int


@dataclass(frozen=True)
class SetResponder:
    """Make the player with ``user_id`` the sole responder (clears others)."""

    user_id: int


@dataclass(frozen=True)
class ScoreResponder:
    """Add ``delta`` (may be negative) to the current responder's score."""

    delta: int


@dataclass(frozen=True)
class PromoteResponderToActive:
    """The responder answered correctly: make them active, clear responder."""


@dataclass(frozen=True)
class MarkResponderAnswered:
    """The responder answered wrong: mark answered, clear responder."""


@dataclass(frozen=True)
class SetActiveQuestion:
    """Set the active question and mark that question completed in the board."""

    question_data: dict


@dataclass(frozen=True)
class SetActiveRound:
    """Set the active round index."""

    round_id: int


@dataclass(frozen=True)
class SetScore:
    """Set an exact score on the player identified by ``player_id``."""

    player_id: int
    score: int


# --- Results ---
@dataclass(frozen=True)
class Transition:
    """An accepted event: move to ``next_state`` and apply ``effects`` in order."""

    next_state: str
    effects: tuple = ()


@dataclass(frozen=True)
class Rejected:
    """The event is not allowed in the current state/role; change nothing."""

    reason: str


# --- Rule handlers: (state, ctx) -> Transition | Rejected ---
def _set_active_player(state, ctx):
    """Creator picks who plays next; only valid while selecting the active user."""
    if CREATOR not in ctx.roles:
        return Rejected("not creator")
    if state != SELECT_ACTIVE_USER:
        return Rejected("set_active_player only from SELECT_ACTIVE_USER")
    return Transition(SELECT_QUESTION,
                      (ResetPlayers(), SetActivePlayer(ctx.payload["user_id"])))


def _show_question(state, ctx):
    """Reveal a question; allowed to the creator/active player or in SELECT_QUESTION."""
    if not (CREATOR in ctx.roles or ACTIVE_PLAYER in ctx.roles or state == SELECT_QUESTION):
        return Rejected("not permitted to show question")
    qd = {
        "round_id": ctx.payload["round_id"],
        "theme_id": ctx.payload["theme_id"],
        "question_id": ctx.payload["question_id"],
    }
    return Transition(SHOW_QUESTION, (ClearResponders(), SetActiveQuestion(qd)))


def _answering(state, ctx):
    """A player buzzes in to answer the shown question."""
    if state != SHOW_QUESTION:
        return Rejected("answering only from SHOW_QUESTION")
    if not ctx.can_answer:
        return Rejected("player cannot answer")
    return Transition(ANSWERING, (SetResponder(ctx.user_id),))


def _review_answer(state, ctx):
    """Creator judges the responder; correct -> SHOW_ANSWER, wrong -> SHOW_QUESTION."""
    if CREATOR not in ctx.roles:
        return Rejected("not creator")
    if state != ANSWERING:
        return Rejected("review only from ANSWERING")
    if not ctx.has_responder:
        return Rejected("no responder")
    price = int(ctx.payload["price"])
    if ctx.payload["is_correct"]:
        return Transition(SHOW_ANSWER, (ScoreResponder(price), PromoteResponderToActive()))
    return Transition(SHOW_QUESTION, (ScoreResponder(-price), MarkResponderAnswered()))


def _show_answer(state, ctx):
    """Reveal the answer; any participant may trigger it from an active question."""
    if not (PLAYER in ctx.roles or CREATOR in ctx.roles):
        return Rejected("not a participant")
    if state not in (SHOW_QUESTION, ANSWERING):
        return Rejected("show_answer only from SHOW_QUESTION/ANSWERING")
    return Transition(SHOW_ANSWER, (ClearResponders(), ClearAnswered()))


def _update_round(state, ctx):
    """Creator switches the active round, resetting players to selection."""
    if CREATOR not in ctx.roles:
        return Rejected("not creator")
    return Transition(SELECT_ACTIVE_USER,
                      (ResetPlayers(), SetActiveRound(int(ctx.payload.get("round_id", 0)))))


def _update_score(state, ctx):
    """Creator manually overrides a player's score; the state is unchanged."""
    if CREATOR not in ctx.roles:
        return Rejected("not creator")
    return Transition(state, (SetScore(ctx.payload["player_id"], ctx.payload["score"]),))


def _join_player(state, ctx):
    """A client joined; broadcast only, no state change or effects."""
    return Transition(state, ())


def _question_timeout(state, ctx):
    """The question timer expired (or all answered): reveal the answer."""
    if state not in (SHOW_QUESTION, ANSWERING):
        return Rejected("no active question")
    return Transition(SHOW_ANSWER, (ClearResponders(), ClearAnswered()))


def _answer_timeout(state, ctx):
    """The answer-reveal timer expired: return to question selection."""
    if state != SHOW_ANSWER:
        return Rejected("answer_timeout only from SHOW_ANSWER")
    return Transition(SELECT_QUESTION, ())


_RULES = {
    EV_SET_ACTIVE_PLAYER: _set_active_player,
    EV_SHOW_QUESTION: _show_question,
    EV_ANSWERING: _answering,
    EV_REVIEW_ANSWER: _review_answer,
    EV_SHOW_ANSWER: _show_answer,
    EV_UPDATE_ROUND: _update_round,
    EV_UPDATE_SCORE: _update_score,
    EV_JOIN_PLAYER: _join_player,
    EV_QUESTION_TIMEOUT: _question_timeout,
    EV_ANSWER_TIMEOUT: _answer_timeout,
}


def decide(state, event, ctx):
    """Decide the outcome of ``event`` fired in ``state`` by the actor in ``ctx``.

    Returns a :class:`Transition` when the event's rule accepts it, or a
    :class:`Rejected` for an unknown event or a guard that fails. This function
    is pure: it never touches the database.
    """
    handler = _RULES.get(event)
    if handler is None:
        return Rejected(f"unknown event: {event}")
    return handler(state, ctx)
