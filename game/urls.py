from django.urls import path, re_path
from game.views import game, create_game
from game.api.views import GameAPIView


urlpatterns = [
    re_path(r'(?P<id>\d+)', game, name='game'),
    path('create', create_game, name='create-game'),

    path('api/', GameAPIView.as_view(), name='game-list-create'),
]
