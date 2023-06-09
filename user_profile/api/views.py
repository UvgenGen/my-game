from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import IsAdminUser

from user_profile.api.serializers import UserSerializer


class UserProfileList(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
