from django.contrib.auth.models import User
from django.db import models

from game.models import Game


class Message(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    message = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    publish_date = models.DateTimeField(auto_now_add=True)

