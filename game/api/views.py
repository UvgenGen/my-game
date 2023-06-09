from rest_framework import generics
from game.models import Game
from game.api.serializers import GameSerializer

class GameAPIView(generics.ListCreateAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)