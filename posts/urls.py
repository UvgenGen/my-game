from django.urls import path
from posts.api.views import UserProfileList, PostList


urlpatterns = [
    path('posts/', PostList.as_view()),
    path('users/', UserProfileList.as_view()),
]
