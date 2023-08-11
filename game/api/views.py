from rest_framework import authentication, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from game.api.serializers import WriteGameListSerializer, ReadGameListSerializer
from game.models import Game, Player

from .utils import parse_content_xml_from_zip


class GameAPIView(generics.ListCreateAPIView):
    queryset = Game.objects.all()

    def get_permissions(self):
        if self.request.method == 'POST':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ReadGameListSerializer
        else:
            return WriteGameListSerializer

    def perform_create(self, serializer):
        data = parse_content_xml_from_zip(self.request.data.get('file'))
        serializer.save(creator=self.request.user, data=data)


class JoinGameAPIView(APIView):
    queryset = Game.objects.all()
    authentication_classes = [authentication.SessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, game_id):
        try:
            game = Game.objects.get(pk=game_id)
        except Game.DoesNotExist:
            return Response({"error": "Game not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReadGameListSerializer(game)
        return Response(serializer.data)

    def put(self, request, game_id):
        password = request.data.get('password', '')
        user = request.user

        try:
            game = Game.objects.get(pk=game_id, password=password)
        except Game.DoesNotExist:
            return Response({"error": "Game not found or password incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        if user in game.players.all().values_list('user', flat=True) or user == game.creator:
            return Response({"message": "User user already in the game."}, status=status.HTTP_200_OK)

        player = Player(user=user)
        player.save()
        game.players.add(player)
        game.save()
        return Response({"message": "User added to the game."}, status=status.HTTP_200_OK)
