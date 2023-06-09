from django.urls import path
from user_profile.api.views import UserProfileList


urlpatterns = [
    path('api/', UserProfileList.as_view()),
]
