from posts.models import Post, UserProfile
from rest_framework import serializers


class UserProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'profile_image_url', 'user']

    def get_profile_image_url(self, user_profile):
        profile_image_url = user_profile.profile_image.url
        return profile_image_url


class PostSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer()
    publish_date = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'message', 'user', 'publish_date']

    def get_publish_date(self, post):
        publish_date = post.publish_date
        return publish_date.strftime("%d.%m.%Y, %H:%M")
