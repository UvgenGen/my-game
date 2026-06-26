from channels.db import database_sync_to_async
from channels.testing import WebsocketCommunicator
from django.contrib.auth.models import AnonymousUser, User
from django.test import TransactionTestCase, override_settings

from game.consumers import GameConsumer
from game.models import Game, Player

# GameConsumer.connect() calls channel_layer.group_add on accepted connections;
# use the in-memory layer so tests don't need Redis.
IN_MEMORY = {"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}}


@override_settings(CHANNEL_LAYERS=IN_MEMORY)
class GameConsumerConnectTests(TransactionTestCase):
    @database_sync_to_async
    def _make_game(self):
        creator = User.objects.create_user("creator", password="pw")
        member_user = User.objects.create_user("member", password="pw")
        outsider = User.objects.create_user("outsider", password="pw")
        game = Game.objects.create(
            title="G", password="p", max_player_count=5,
            creator=creator, state="SELECT_ACTIVE_USER",
        )
        player = Player.objects.create(user=member_user)
        game.players.add(player)
        return game.id, creator, member_user, outsider

    async def _connect(self, user, game_id):
        communicator = WebsocketCommunicator(
            GameConsumer.as_asgi(), f"/ws/game/{game_id}/"
        )
        communicator.scope["user"] = user
        communicator.scope["url_route"] = {"kwargs": {"game_id": str(game_id)}}
        connected, _ = await communicator.connect()
        if connected:
            await communicator.disconnect()
        return connected

    async def test_member_can_connect(self):
        game_id, _creator, member_user, _outsider = await self._make_game()
        self.assertTrue(await self._connect(member_user, game_id))

    async def test_creator_can_connect(self):
        game_id, creator, _member, _outsider = await self._make_game()
        self.assertTrue(await self._connect(creator, game_id))

    async def test_anonymous_is_rejected(self):
        game_id, *_ = await self._make_game()
        self.assertFalse(await self._connect(AnonymousUser(), game_id))

    async def test_non_member_is_rejected(self):
        game_id, _creator, _member, outsider = await self._make_game()
        self.assertFalse(await self._connect(outsider, game_id))


class GameConsumerEventTests(TransactionTestCase):
    @database_sync_to_async
    def _make_game(self):
        from game import engine
        creator = User.objects.create_user("c2", password="pw")
        member_user = User.objects.create_user("m2", password="pw")
        game = Game.objects.create(
            title="G", password="p", max_player_count=5, creator=creator,
            state=engine.SELECT_ACTIVE_USER, active_round=0,
            data=[{"name": "R1", "themes": [{"name": "T1", "questions": [
                {"price": "100", "answer": "A", "completed": False,
                 "question_content": [], "answer_content": []}]}]}],
        )
        player = Player.objects.create(user=member_user)
        game.players.add(player)
        return game.id, creator, member_user

    @database_sync_to_async
    def _state(self, game_id):
        return Game.objects.get(id=game_id).state

    async def _open(self, user, game_id):
        communicator = WebsocketCommunicator(GameConsumer.as_asgi(), f"/ws/game/{game_id}/")
        communicator.scope["user"] = user
        communicator.scope["url_route"] = {"kwargs": {"game_id": str(game_id)}}
        connected, _ = await communicator.connect()
        assert connected
        return communicator

    @override_settings(CHANNEL_LAYERS=IN_MEMORY)
    async def test_accepted_event_broadcasts_and_changes_state(self):
        game_id, creator, member_user = await self._make_game()
        comm = await self._open(creator, game_id)
        await comm.send_json_to({"type": "set_active_player", "user_id": member_user.id})
        reply = await comm.receive_json_from()
        self.assertEqual(reply["type"], "set_active_player")
        self.assertEqual(await self._state(game_id), "SELECT_QUESTION")
        await comm.disconnect()

    @override_settings(CHANNEL_LAYERS=IN_MEMORY)
    async def test_rejected_event_does_not_change_state(self):
        game_id, creator, member_user = await self._make_game()
        comm = await self._open(member_user, game_id)  # non-creator
        await comm.send_json_to({"type": "set_active_player", "user_id": member_user.id})
        # rejected -> no broadcast; assert state unchanged
        self.assertTrue(await comm.receive_nothing(timeout=0.3))
        self.assertEqual(await self._state(game_id), "SELECT_ACTIVE_USER")
        await comm.disconnect()

    @database_sync_to_async
    def _make_answering_game(self):
        from game import engine
        creator = User.objects.create_user("c4", password="pw")
        member_user = User.objects.create_user("m4", password="pw")
        game = Game.objects.create(
            title="G", password="p", max_player_count=5, creator=creator,
            state=engine.ANSWERING, active_round=0,
            data=[{"name": "R1", "themes": [{"name": "T1", "questions": [
                {"price": "100", "answer": "A", "completed": False,
                 "question_content": [], "answer_content": []}]}]}],
        )
        player = Player.objects.create(user=member_user, is_responder=True)
        game.players.add(player)
        return game.id, creator, player.id

    @database_sync_to_async
    def _score(self, player_id):
        return Player.objects.get(id=player_id).score

    @override_settings(CHANNEL_LAYERS=IN_MEMORY)
    async def test_correct_review_reveals_answer_and_starts_countdown(self):
        # Regression: a correct review_answer transitions straight to SHOW_ANSWER.
        # The consumer must still emit a show_answer reveal broadcast (the frontend
        # does not refetch on review_answer) and start the answer countdown.
        game_id, creator, player_id = await self._make_answering_game()
        comm = await self._open(creator, game_id)
        await comm.send_json_to({"type": "review_answer", "is_correct": True, "price": "100"})
        first = await comm.receive_json_from()
        self.assertEqual(first["type"], "review_answer")
        second = await comm.receive_json_from()
        self.assertEqual(second["type"], "show_answer")  # reveal broadcast (the fix)
        third = await comm.receive_json_from()
        self.assertEqual(third["type"], "answer_time_left")  # answer countdown started
        self.assertEqual(await self._state(game_id), "SHOW_ANSWER")
        self.assertEqual(await self._score(player_id), 100)
        await comm.disconnect()
