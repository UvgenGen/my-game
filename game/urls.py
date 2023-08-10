from django.urls import path, re_path

from game.api.views import GameAPIView
from game.views import create_game, game, game_list

urlpatterns = [
    re_path(r'(?P<id>\d+)', game, name='game'),
    path('create', create_game, name='create-game'),
    path('list', game_list, name='game-list'),

    path('api/', GameAPIView.as_view(), name='game-list-create'),
]
