from rest_framework import serializers

from game.models import Game


class WriteGameListSerializer(serializers.ModelSerializer):
    creator = serializers.PrimaryKeyRelatedField(read_only=True, default=serializers.CurrentUserDefault())

    class Meta:
        model = Game
        fields = ['id', 'title', 'password', 'max_player_count', 'data', 'creator', 'players']


class ReadGameListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'title', 'max_player_count', 'creator', 'players']
