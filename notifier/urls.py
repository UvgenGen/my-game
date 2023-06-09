"""
notifier URL Configuration
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from .views import index


urlpatterns = [
    path('admin/', admin.site.urls),
    path("", include("django_nextjs.urls")),
    path("", include('registration.urls')),
    path("", index, name="index"),

    path('api-auth/', include('rest_framework.urls')),
    path('api/', include('posts.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
