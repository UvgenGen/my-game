"""ORM-facing service: load the Game fresh, run the pure engine, apply effects."""
from dataclasses import dataclass

from django.db import transaction

from game import engine
from game.models import Game


@dataclass
class ApplyResult:
    """Outcome of :func:`apply_event`: whether it was accepted and the resulting state."""

    accepted: bool
    state: str
    reason: str = None


def _roles_for(game, user_id):
    """Return ``(roles, player)`` for ``user_id`` in ``game``.

    ``roles`` is the set of engine role constants the user holds (creator,
    player, active player, responder); ``player`` is their ``Player`` row or
    ``None`` if they are not a member.
    """
    roles = set()
    if game.creator_id == user_id:
        roles.add(engine.CREATOR)
    player = game.players.filter(user__id=user_id).first()
    if player is not None:
        roles.add(engine.PLAYER)
        if player.is_active:
            roles.add(engine.ACTIVE_PLAYER)
        if player.is_responder:
            roles.add(engine.RESPONDER)
    return roles, player


def _apply_effect(game, effect):
    """Apply a single declarative engine effect to ``game`` and its players.

    Player effects persist immediately via queryset updates; effects on the
    ``game`` row itself (active question/round) are persisted by the caller's
    ``game.save()`` after all effects run.
    """
    players = game.players
    if isinstance(effect, engine.ResetPlayers):
        players.update(is_active=False, is_responder=False, answered=False)
    elif isinstance(effect, engine.ClearResponders):
        players.update(is_responder=False)
    elif isinstance(effect, engine.ClearAnswered):
        players.update(answered=False)
    elif isinstance(effect, engine.SetActivePlayer):
        players.filter(user__id=effect.user_id).update(is_active=True)
    elif isinstance(effect, engine.SetResponder):
        players.update(is_responder=False)
        players.filter(user__id=effect.user_id).update(is_responder=True)
    elif isinstance(effect, engine.ScoreResponder):
        responder = players.filter(is_responder=True).first()
        if responder is not None:
            responder.score += effect.delta
            responder.save()
    elif isinstance(effect, engine.PromoteResponderToActive):
        players.filter(is_responder=True).update(is_active=True, is_responder=False)
    elif isinstance(effect, engine.MarkResponderAnswered):
        players.filter(is_responder=True).update(answered=True, is_responder=False)
    elif isinstance(effect, engine.SetActiveQuestion):
        qd = effect.question_data
        game.active_question = qd
        question = (
            game.data[qd["round_id"]]["themes"][qd["theme_id"]]["questions"][qd["question_id"]]
        )
        question["completed"] = True
    elif isinstance(effect, engine.SetActiveRound):
        game.active_round = effect.round_id
    elif isinstance(effect, engine.SetScore):
        players.filter(id=effect.player_id).update(score=effect.score)
    else:
        raise ValueError(f"unknown effect: {effect!r}")


def apply_event(game_id, user_id, event, payload):
    """Run one game event through the engine and persist the result.

    Loads the game under ``select_for_update`` (fresh state + serialized
    against concurrent events), asks :func:`engine.decide`, and on acceptance
    applies the effects and saves. On rejection nothing is written. Returns an
    :class:`ApplyResult`.
    """
    with transaction.atomic():
        try:
            game = Game.objects.select_for_update().get(id=game_id)
        except Game.DoesNotExist:
            return ApplyResult(accepted=False, state="", reason="game not found")
        roles, player = _roles_for(game, user_id)
        ctx = engine.Context(
            roles=frozenset(roles),
            user_id=user_id,
            payload=payload or {},
            can_answer=(player is not None and not player.answered),
            has_responder=game.players.filter(is_responder=True).exists(),
        )
        result = engine.decide(game.state, event, ctx)
        if isinstance(result, engine.Rejected):
            return ApplyResult(accepted=False, state=game.state, reason=result.reason)
        for effect in result.effects:
            _apply_effect(game, effect)
        game.state = result.next_state
        game.save()
        return ApplyResult(accepted=True, state=game.state)
