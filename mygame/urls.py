"""
mygame URL Configuration
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path

from .views import index

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('django_nextjs.urls')),
    path('', include('registration.urls')),
    path('', index, name='index'),

    re_path(r'^game/', include('game.urls')),
    path('chat/', include('chat.urls')),
    path('profiles/', include('user_profile.urls')),

    path('api-auth/', include('rest_framework.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
