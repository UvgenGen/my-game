from django.contrib.auth.decorators import login_required
from django_nextjs.render import render_nextjs_page_sync


@login_required
def index(request):
    return render_nextjs_page_sync(request, "base_next.html")


@login_required
def game(request, id):
    return render_nextjs_page_sync(request, "base_next.html")


@login_required
def create_game(request):
    return render_nextjs_page_sync(request, "base_next.html")

@login_required
def game_list(request):
    return render_nextjs_page_sync(request, "base_next.html")
