from rest_framework import serializers

from game.models import Game, Player


class WriteGameListSerializer(serializers.ModelSerializer):
    creator = serializers.PrimaryKeyRelatedField(read_only=True, default=serializers.CurrentUserDefault())

    class Meta:
        model = Game
        fields = ['id', 'title', 'password', 'max_player_count', 'data', 'creator', 'players']


class ReadGameListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'title', 'max_player_count', 'creator', 'players']



class PlayerSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    user_id = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = '__all__'

    def get_username(self, obj):
        return obj.user.username

    def get_user_id(self, obj):
        return obj.user.id

    def get_profile_image(self, obj):
        profile_image_url = '/static/images/default_porfile.png'
        if hasattr(obj.user, 'profile'):
            profile_image_url = obj.user.profile.profile_image.url
        return profile_image_url


class GameDetailSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True)

    class Meta:
        model = Game
        exclude = ['password']