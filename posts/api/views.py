from django.contrib.auth.models import User
from posts.api.serializers import PostSerializer, UserSerializer
from posts.models import Post
from rest_framework import generics
from rest_framework.permissions import IsAdminUser, IsAuthenticatedOrReadOnly


class UserProfileList(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class PostList(generics.ListCreateAPIView):
    queryset = Post.objects.all().order_by('-publish_date')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

