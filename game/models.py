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
        ('SELECT_ACTIVE_USER', 'Selecting Active User'),
        ('SELECT_QUESTION', 'Selecting Question'),
        ('SHOW_QUESTION', 'Showing Question'),
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
    active_question = models.JSONField(default=dict)
    is_paused = models.BooleanField(default=False)
    state = models.CharField(max_length=50, choices=STATE_CHOICES)

    def set_active_player(self, user_id):
        self.players.update(is_active=False)
        player = self.players.get(user__id=user_id)
        player.is_active = True
        player.save()
        self.state = 'SELECT_QUESTION'
        self.save()

    def set_responder(self, user_id):
        self.players.update(is_responder=False)
        player = self.players.get(user__id=user_id)
        player.is_responder = True
        player.save()
        self.state = 'ANSWERING'
        self.save()

    def set_active_round(self, active_round):
        self.players.update(is_active=False)
        self.active_round = int(active_round)
        self.state = 'SELECT_ACTIVE_USER'
        self.save()

    def show_answer(self):
        self.players.update(is_responder=False)
        self.state = 'SHOW_ANSWER'
        self.save()

    def show_question(self, question_data):
        self.players.update(is_responder=False)
        self.state = 'SHOW_QUESTION'
        self.active_question = question_data
        self.save()

    def review_answer(self, is_correct, price):
        try:
            player = self.players.get(is_responder=True)
            if is_correct:
                player.score += int(price)
                self.state = 'SHOW_ANSWER'
            else:
                player.score -= int(price)
                self.state = 'SHOW_QUESTION'
            self.players.update(is_responder=False)
            player.save()
            self.save()
        except Player.DoesNotExist:
            self.state = 'SHOW_QUESTION'
            self.save()
            pass

    def is_player(self, user_id):
        return self.players.filter(user__id=user_id).exists()

    def is_active_player(self, user_id):
        return self.is_player(user_id) and self.players.get(user__id=user_id).is_active

    def is_creator(self, user_id):
        return self.creator.id == user_id
