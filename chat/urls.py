from django.urls import path

from chat.api.views import PostList

urlpatterns = [
    path('api/', PostList.as_view()),
]
