from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import IsAdminUser, IsAuthenticatedOrReadOnly

from chat.api.serializers import MessageSerializer, UserSerializer
from chat.models import Message


class UserProfileList(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class PostList(generics.ListCreateAPIView):
    queryset = Message.objects.all().order_by('-publish_date')
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        Optionally restricts the returned purchases to a given user,
        by filtering against a `username` query parameter in the URL.
        """
        queryset = Message.objects.all()
        game = int(self.request.query_params.get('game'))
        if game is not None:
            queryset = queryset.filter(game=game).order_by('-publish_date')
        return queryset


    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

