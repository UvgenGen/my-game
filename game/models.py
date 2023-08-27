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
        ('SELECTING_ACTIVE_USER', 'Selecting Active User'),
        ('SELECTING_QUESTION', 'Selecting Question'),
        ('SHOWING_QUESTION', 'Showing Question'),
        ('CAT_IN_A_BAG', 'Cat in a Bag'),
        ('RATE_QUESTION', 'Rate Question'),
        ('ANSWERING', 'Answering'),
        ('SHOW_ANSWER', 'Show Answer'),
        ('FINAL', 'Final'),
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
    players = models.ManyToManyField(Player, related_name='games', blank=True)
    creator = models.ForeignKey(User, related_name='games_created', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    active_round = models.IntegerField(default=0)
    is_paused = models.BooleanField(default=False)
    state = models.CharField(max_length=50, choices=STATE_CHOICES)
