from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Player(models.Model):
    user = models.ForeignKey(User, related_name='player', on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    is_responder = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)


class Game(models.Model):
    STATE_CHOICES = [
        ('selecting_active_user', 'selecting active user'),
        ('selecting_question', 'selecting question'),
        ('showing_question', 'showing question'),
        ('cat_in_a_bag', 'cat in a bag'),
        ('rate_question', 'rate question'),
        ('answering', 'answering'),
    ]

    title = models.CharField(max_length=25)
    password = models.CharField(max_length=15)
    data = models.JSONField(default=list)
    max_player_count = models.IntegerField(
        validators=[
            MaxValueValidator(10),
            MinValueValidator(1)
        ]
    )
    players = models.ManyToManyField(Player, related_name='game', blank=True)
    creator = models.ForeignKey(User, related_name='game', on_delete=models.CASCADE)
    created_at = models.TimeField(auto_now_add=True)
    active_round = models.IntegerField(default=0)
    is_paused = models.BooleanField(default=False)
    state = models.CharField(max_length=50, choices=STATE_CHOICES)
