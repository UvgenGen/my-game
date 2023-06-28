from django.contrib.auth.models import User
from django.db import models


class Post(models.Model):
    message = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    publish_date = models.DateTimeField(auto_now_add=True)

