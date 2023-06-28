from channels.routing import ProtocolTypeRouter, URLRouter
# import app.routing
from django.urls import re_path
from game.consumers import TextRoomConsumer


websocket_urlpatterns = [
    re_path(r'^ws/(?P<room_name>[^/]+)/$', TextRoomConsumer.as_asgi()),
]
