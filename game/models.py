from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.auth.models import User


class Game(models.Model):
    title = models.CharField(max_length=25)
    password = models.CharField(max_length=15)
    data = models.JSONField(default=dict)
    max_player_count = models.IntegerField(
        validators=[
            MaxValueValidator(100),
            MinValueValidator(1)
        ]
    )
    players = models.ManyToManyField(User, related_name='players', blank=True)
    creator = models.ForeignKey(User, related_name='creator', on_delete=models.CASCADE)
    created_at = models.TimeField(auto_now_add=True)
