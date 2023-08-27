from django.urls import path, include


urlpatterns = [
    path('api/', include(('user_profile.api.urls', 'game'))),
]
