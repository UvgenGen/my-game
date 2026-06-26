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
