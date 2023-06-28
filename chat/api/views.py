from django.contrib.auth.models import User
from chat.api.serializers import MessageSerializer, UserSerializer
from chat.models import Message
from rest_framework import generics
from rest_framework.permissions import IsAdminUser, IsAuthenticatedOrReadOnly


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
        game = int(self.request.query_params.get('room'))
        print(game)
        print(type(game))
        if game is not None:
            queryset = queryset.filter(game=game)
        return queryset


    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

