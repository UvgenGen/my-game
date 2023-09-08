import asyncio
import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

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


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            # Reject the connection if the user is not authenticated
            await self.close()

        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game = await self.get_game(self.game_id)
        self.game_group_name = 'game_%s' % self.game_id
        # Join room group
        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.game_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Receive event data from WebSocket
        data_json = json.loads(text_data)
        await self.set_timer(data_json)
        await self.update_and_send(data_json)

    @database_sync_to_async
    def get_game(self, game_id):
        return Game.objects.get(id=game_id)

    async def update_and_send(self, data):
        update_type = data.get('type')
        user = self.scope["user"]

        update_functions = {
            'show_question': self._update_show_question,
            'set_active_player': self._update_set_active_player,
            'answering': self._update_answering,
            'show_answer': self._update_show_answer,
            'review_answer': self._update_review_answer,
            'join_player': self._update_join_player,
            'update_round': self._update_update_round,
            'update_score': self._update_update_score,
        }

        update_function = update_functions.get(update_type)
        if update_function:
            await update_function(data, user)

        await self.channel_layer.group_send(
            self.game_group_name,
            data
        )

    @database_sync_to_async
    def _update_show_question(self, data, user):
        if (
            self.game.is_creator(user.id)
            or self.game.is_active_player(user.id)
            or self.game.state in ['SELECT_QUESTION']
            ):
            question_data = {
                'round_id': data['round_id'],
                'question_id': data['question_id'],
                'theme_id': data['theme_id'],
            }
            self.game.show_question(question_data)

    @database_sync_to_async
    def _update_set_active_player(self, data, user):
        if (
            self.game.is_creator(user.id)
            and self.game.state in ['SELECT_ACTIVE_USER']
            ):
            self.game.set_active_player(data['user_id'])

    async def _update_answering(self, data, user):
        can_answer = await database_sync_to_async(self.game.is_player_can_answer)(user.id)
        if (
            can_answer
            and self.game.state in ['SHOW_QUESTION']
            ):
            await database_sync_to_async(self.game.set_responder)(user.id)

    @database_sync_to_async
    def _update_show_answer(self, data, user):
        if (
            self.game.is_player(user.id)
            and self.game.state in ['SHOW_QUESTION', 'ANSWERING']
            ):
            self.game.show_answer()

    @database_sync_to_async
    def _update_review_answer(self, data, user):
        if (
            self.game.is_creator(user.id)
            and self.game.state in ['ANSWERING']
            ):
            self.game.review_answer(data['is_correct'], data['price'])

    @database_sync_to_async
    def _update_join_player(self, data, user):
        self.join_player(data)

    @database_sync_to_async
    def _update_update_round(self, data, user):
        if self.game.is_creator(user.id):
            self.game.set_active_round(data.get('round_id', 0))

    @database_sync_to_async
    def _update_update_score(self, data, user):
        if self.game.is_creator(user.id):
            self.game.update_player_score(data.get('player_id'), data.get('score'))

    @database_sync_to_async
    def update_game_state(self, state):
        self.game.update_state(state)

    async def set_timer(self, data):
        update_type = data.get('type')
        if update_type == 'show_question':
            self.question_countdown_task = asyncio.create_task(self.question_countdown())
        if update_type == 'show_answer':
            self.answer_countdown_task = asyncio.create_task(self.answer_countdown())

    async def answer_countdown(self):
        time_left = 5  # Initial time left in seconds
        while time_left > 0:
            time_left -= 1
            # Send time left to clients
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    'type': 'answer_time_left',
                    'time_left': time_left
                }
            )
            await asyncio.sleep(1)  # Wait for 1 second

        # After the countdown finishes, send an event to notify clients that the time is up
        await self.update_game_state('SELECT_QUESTION')
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                'type': 'answer_time_up',
            }
        )

    async def question_countdown(self):
        time_left = 45  # Initial time left in seconds
        while time_left > 0:
            game = await self.get_game(self.game_id)
            if game.state not in ['SHOW_QUESTION', 'ANSWERING']:
                return
            if game.state == 'SHOW_QUESTION':
                # Send time left to clients
                time_left -= 1
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'question_time_left',
                        'time_left': time_left
                    }
                )
            await asyncio.sleep(1)  # Wait for 1 second

        # After the countdown finishes, send an event to notify clients that the time is up
        data = {
            'type': 'show_answer',
        }
        await self.update_and_send(data)
        self.answer_countdown_task = asyncio.create_task(self.answer_countdown())

    async def question_time_left(self, event):
        await self.send(text_data=json.dumps(event))

    async def answer_time_left(self, event):
        await self.send(text_data=json.dumps(event))

    async def answer_time_up(self, event):
        await self.send(text_data=json.dumps(event))

    async def show_question(self, event):
        await self.send(text_data=json.dumps(event))

    async def pause(self, event):
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
