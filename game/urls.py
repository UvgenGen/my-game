from django.urls import include, path, re_path

from game.views import create_game, game, game_list, join_game

urlpatterns = [
    re_path(r'(?P<game_id>\d+)$', game, name='game'),
    re_path(r'join/(?P<game_id>\d+)$', join_game, name='join-game'),
    path('create', create_game, name='create-game'),
    path('list', game_list, name='game-list'),

    path('api/', include(('game.api.urls', 'game'))),
]
