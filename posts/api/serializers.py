from posts.models import Post
from django.contrib.auth.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'profile_image_url', 'username']

    def get_profile_image_url(self, user):
        profile_image_url=''
        if hasattr(user, 'userprofile'):
            profile_image_url = user.userprofile.profile_image.url
        return profile_image_url


class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    publish_date = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'message', 'user', 'publish_date']

    def get_publish_date(self, post):
        publish_date = post.publish_date
        return publish_date.strftime("%d.%m.%Y, %H:%M")
