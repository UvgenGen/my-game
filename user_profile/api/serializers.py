from django.contrib.auth.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'profile_image_url', 'username']

    def get_profile_image_url(self, user):
        profile_image_url = ''
        if hasattr(user, 'profile'):
            profile_image_url = user.profile.profile_image.url
        return profile_image_url
