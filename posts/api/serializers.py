from posts.models import Post, UserProfile
from rest_framework import serializers


class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = UserProfile
        fields = ['id', 'profile_image', 'user']


class PostSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    class Meta:
        model = Post
        fields = ['id', 'message', 'user', 'publish_date']