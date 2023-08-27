from django.urls import path
from .views import UserProfileList, UserProfileView


urlpatterns = [
    path('', UserProfileList.as_view()),
    path('user_id', UserProfileView.as_view()),
]
