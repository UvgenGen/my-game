import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import Game


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name
        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        # Receive message from WebSocket
        data_json = json.loads(text_data)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            data_json
        )

    def send_message(self, event):
        # Receive message from room group
        message = event['message']
        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'message': message,
        }))


class GameConsumer(WebsocketConsumer):
    def connect(self):
        if self.scope["user"].is_anonymous:
            # Reject the connection if the user is not authenticated
            self.close()

        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game = Game.objects.get(id=self.game_id)
        self.game_group_name = 'game_%s' % self.game_id
        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.game_group_name,
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.game_group_name,
            self.channel_name
        )

    def update_and_send(self, data):
        update_type = data.get('type')
        user = self.scope["user"]
        if update_type == 'show_question':
            if not(
                (self.game.is_creator(user.id) or self.game.is_active_player(user.id))
                and self.game.state in ['SELECT_QUESTION']
            ):
                return
            question_data = {
                'round_id': data['round_id'],
                'question_id': data['question_id'],
                'theme_id': data['theme_id'],
            }
            self.game.show_question(question_data)
        elif update_type == 'pause':
            pass
        elif update_type == 'set_active_player':
            if not (self.game.is_creator(user.id) and self.game.state in ['SELECT_ACTIVE_USER']):
                return
            self.game.set_active_player(data['user_id'])
        elif update_type == 'answering':
            if not (self.game.is_player(user.id) and self.game.state in ['SHOW_QUESTION']):
                return
            self.game.set_responder(user.id)
        elif update_type == 'show_answer':
            pass
        elif update_type == 'review_answer':
            if not (self.game.is_creator(user.id) and self.game.state in ['ANSWERING']):
                return
            self.game.review_answer(data['is_correct'], data['price'])
        elif update_type == 'join_player':
            self.join_player(data)
        elif update_type == 'update_round':
            if not self.game.is_creator(user.id):
                return
            self.game.set_active_round(data.get('round_id', 0))

        async_to_sync(self.channel_layer.group_send)(
            self.game_group_name,
            data
        )

    def receive(self, text_data):
        # Receive event data from WebSocket
        data_json = json.loads(text_data)
        self.update_and_send(data_json)

    def show_question(self, event):
        self.send(text_data=json.dumps(event))

    def pause(self, event):
        self.send(text_data=json.dumps(event))

    def set_active_player(self, event):
        self.send(text_data=json.dumps(event))

    def answering(self, event):
        self.send(text_data=json.dumps(event))

    def show_answer(self, event):
        self.send(text_data=json.dumps(event))

    def review_answer(self, event):
        self.send(text_data=json.dumps(event))

    def join_player(self, event):
        self.send(text_data=json.dumps(event))

    def update_round(self, event):
        self.send(text_data=json.dumps(event))
