from django.urls import path
from posts.api.views import PostList


urlpatterns = [
    path('api/', PostList.as_view()),
]
