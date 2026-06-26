import asyncio
import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from game import engine, services
from .models import Game


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Receive message from WebSocket
        data_json = json.loads(text_data)
        await self.channel_layer.group_send(
            self.room_group_name,
            data_json
        )

    async def send_message(self, event):
        # Receive message from room group
        message = event['message']
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
        }))


# incoming message types that map to engine events (timeouts are internal)
_CLIENT_EVENTS = {
    engine.EV_SET_ACTIVE_PLAYER, engine.EV_SHOW_QUESTION, engine.EV_ANSWERING,
    engine.EV_SHOW_ANSWER, engine.EV_REVIEW_ANSWER, engine.EV_UPDATE_ROUND,
    engine.EV_UPDATE_SCORE, engine.EV_JOIN_PLAYER,
}

QUESTION_SECONDS = 45
ANSWER_SECONDS = 5


class GameConsumer(AsyncWebsocketConsumer):
    """Thin WebSocket transport for a game.

    Incoming messages are mapped to engine events and handed to
    ``services.apply_event``; accepted events are broadcast to the game group.
    All decision and persistence logic lives in ``game.engine`` and
    ``game.services`` — this class only authenticates, broadcasts, and runs the
    server-side countdown timers.
    """

    async def connect(self):
        """Accept only authenticated members (creator or joined player)."""
        user = self.scope["user"]
        if user.is_anonymous:
            await self.close()
            return
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        try:
            self.game = await self.get_game(self.game_id)
        except Game.DoesNotExist:
            await self.close()
            return
        if not await self.is_member(user):
            await self.close()
            return
        self.game_group_name = "game_%s" % self.game_id
        self._timers = {}
        await self.channel_layer.group_add(self.game_group_name, self.channel_name)
        await self.accept()

    @database_sync_to_async
    def is_member(self, user):
        return self.game.is_creator(user.id) or self.game.is_player(user.id)

    @database_sync_to_async
    def get_game(self, game_id):
        return Game.objects.get(id=game_id)

    async def disconnect(self, close_code):
        """Cancel any running timers and leave the group (guards early rejects)."""
        for task in getattr(self, "_timers", {}).values():
            if task and not task.done():
                task.cancel()
        if hasattr(self, "game_group_name"):
            await self.channel_layer.group_discard(self.game_group_name, self.channel_name)

    async def receive(self, text_data):
        """Map the message to an engine event, apply it, and broadcast on accept."""
        data = json.loads(text_data)
        msg_type = data.get("type")
        if msg_type not in _CLIENT_EVENTS:
            return
        result = await database_sync_to_async(services.apply_event)(
            self.game_id, self.scope["user"].id, msg_type, data
        )
        if not result.accepted:
            return
        await self.channel_layer.group_send(self.game_group_name, data)
        await self._manage_timers(msg_type, result.state)

    async def _manage_timers(self, msg_type, state):
        """Start countdowns / reveal the answer based on the resulting state."""
        # Question countdown starts only when a question is freshly shown — not
        # when an incorrect review returns to SHOW_QUESTION (that countdown is
        # already running and must keep its remaining time).
        if msg_type == engine.EV_SHOW_QUESTION:
            self._restart_timer("question", self._question_countdown())
        # Any accepted event that lands the game in SHOW_ANSWER must reveal the
        # answer to clients and start the answer countdown. A correct review_answer
        # transitions straight to SHOW_ANSWER, and the frontend does not refetch on
        # the review_answer message, so emit an explicit show_answer broadcast for
        # it (the explicit show_answer event already broadcast itself above).
        if state == engine.SHOW_ANSWER:
            if msg_type != engine.EV_SHOW_ANSWER:
                await self.channel_layer.group_send(
                    self.game_group_name, {"type": "show_answer"}
                )
            self._restart_timer("answer", self._answer_countdown())

    def _restart_timer(self, name, coro):
        """Cancel the existing timer task of this kind (if any) and start a new one."""
        existing = self._timers.get(name)
        if existing and not existing.done():
            existing.cancel()
        self._timers[name] = asyncio.create_task(coro)

    async def _dispatch_timeout(self, event):
        """Run a timeout event through the service; broadcast on accept."""
        result = await database_sync_to_async(services.apply_event)(
            self.game_id, self.scope["user"].id, event, {}
        )
        return result.accepted

    async def _question_countdown(self):
        """Tick the question clock; on expiry (or all answered) reveal the answer."""
        time_left = QUESTION_SECONDS
        while time_left > 0:
            game = await self.get_game(self.game_id)
            if game.state not in (engine.SHOW_QUESTION, engine.ANSWERING):
                return
            if await database_sync_to_async(game.is_all_players_answered)():
                break
            if game.state == engine.SHOW_QUESTION:
                time_left -= 1
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {"type": "question_time_left", "time_left": time_left},
                )
            await asyncio.sleep(1)
        if await self._dispatch_timeout(engine.EV_QUESTION_TIMEOUT):
            await self.channel_layer.group_send(self.game_group_name, {"type": "show_answer"})
            self._restart_timer("answer", self._answer_countdown())

    async def _answer_countdown(self):
        """Tick the answer-reveal clock; on expiry advance to question selection."""
        time_left = ANSWER_SECONDS
        while time_left > 0:
            time_left -= 1
            await self.channel_layer.group_send(
                self.game_group_name,
                {"type": "answer_time_left", "time_left": time_left},
            )
            await asyncio.sleep(1)
        if await self._dispatch_timeout(engine.EV_ANSWER_TIMEOUT):
            await self.channel_layer.group_send(self.game_group_name, {"type": "answer_time_up"})

    # --- group-event -> socket forwarders (transport only) ---
    async def question_time_left(self, event):
        await self.send(text_data=json.dumps(event))

    async def answer_time_left(self, event):
        await self.send(text_data=json.dumps(event))

    async def answer_time_up(self, event):
        await self.send(text_data=json.dumps(event))

    async def show_question(self, event):
        await self.send(text_data=json.dumps(event))

    async def set_active_player(self, event):
        await self.send(text_data=json.dumps(event))

    async def answering(self, event):
        await self.send(text_data=json.dumps(event))

    async def show_answer(self, event):
        await self.send(text_data=json.dumps(event))

    async def review_answer(self, event):
        await self.send(text_data=json.dumps(event))

    async def join_player(self, event):
        await self.send(text_data=json.dumps(event))

    async def update_round(self, event):
        await self.send(text_data=json.dumps(event))

    async def update_score(self, event):
        await self.send(text_data=json.dumps(event))

    async def pause(self, event):
        await self.send(text_data=json.dumps(event))
