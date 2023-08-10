from django.contrib.auth.decorators import login_required
from django_nextjs.render import render_nextjs_page_sync


@login_required
def index(request):
    return render_nextjs_page_sync(request, "base_next.html")
