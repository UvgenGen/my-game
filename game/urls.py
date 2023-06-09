from django.urls import include, path, re_path
from .views import index, game, create_game


urlpatterns = [
    re_path(r'(?P<id>\d+)', game, name='game'),
    path('create', create_game, name='create-game'),
]
