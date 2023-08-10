from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from game.api.serializers import GameSerializer
from game.models import Game


class GameAPIView(generics.ListCreateAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class JoinGameAPIView(APIView):
    queryset = Game.objects.all()

    def put(self, request, game_id):
        password = request.data.get('password', '')
        user = request.user  # Assuming you have authentication set up

        try:
            game = Game.objects.get(pk=game_id, password=password)
        except Game.DoesNotExist:
            return Response({"error": "Game not found or password incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        if user in game.players.all():
            return Response({"message": "User added to the game."}, status=status.HTTP_200_OK)

        game.players.add(user)
        game.save()
        return Response({"message": "User added to the game."}, status=status.HTTP_200_OK)
