from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_image = models.ImageField()


class Post(models.Model):
    message = models.TextField()
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    publish_date = models.DateTimeField(auto_now_add=True)

