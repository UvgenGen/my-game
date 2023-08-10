from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from django_nextjs.render import render_nextjs_page_sync

from .models import Game


@login_required
def index(request):
    return render_nextjs_page_sync(request, "base_next.html")


@login_required
def game(request, game_id):
    game = get_object_or_404(Game, id=game_id)
    if request.user in game.players.all():
        return render_nextjs_page_sync(request, "base_next.html")
    return redirect(reverse('join-game', kwargs={'game_id': game_id}))


@login_required
def create_game(request):
    return render_nextjs_page_sync(request, "base_next.html")


@login_required
def game_list(request):
    return render_nextjs_page_sync(request, "base_next.html")


@login_required
def join_game(request, game_id):
    return render_nextjs_page_sync(request, "base_next.html")
