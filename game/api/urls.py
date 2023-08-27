from django.urls import path, re_path

from .views import GameAPIView, JoinGameAPIView, GameDetailView

urlpatterns = [
    path('', GameAPIView.as_view(), name='create'),
    re_path(r'(?P<pk>\d+)$', GameDetailView.as_view(), name='detail'),
    re_path(r'join/(?P<game_id>\d+)$', JoinGameAPIView.as_view(), name='join'),
]
