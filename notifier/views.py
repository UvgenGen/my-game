from django_nextjs.render import render_nextjs_page_sync
from django.contrib.auth.decorators import login_required


@login_required
def index(request):
    return render_nextjs_page_sync(request, "base_next.html")
