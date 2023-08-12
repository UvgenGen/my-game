from django.urls import re_path

from game.consumers import ChatConsumer, GameConsumer

websocket_urlpatterns = [
    re_path(r'^ws/(?P<room_name>[^/]+)/$', ChatConsumer.as_asgi()),
    re_path(r'^ws/game/(?P<game_id>[^/]+)/$', GameConsumer.as_asgi()),
]

