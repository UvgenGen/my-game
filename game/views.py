from django_nextjs.render import render_nextjs_page_sync
from django.contrib.auth.decorators import login_required


@login_required
def index(request):
    return render_nextjs_page_sync(request, "base_next.html")


@login_required
def game(request, id):
    context = {'id': id}
    return render_nextjs_page_sync(request, "base_next.html", context=context)


@login_required
def create_game(request):
    return render_nextjs_page_sync(request, "base_next.html")
