from rest_framework import serializers

from game.models import Game

class GameSerializer(serializers.ModelSerializer):
    creator = serializers.PrimaryKeyRelatedField(read_only=True, default=serializers.CurrentUserDefault())

    class Meta:
        model = Game
        fields = ['title', 'password', 'max_player_count', 'data', 'creator']
