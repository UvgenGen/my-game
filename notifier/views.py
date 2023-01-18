from django_nextjs.render import render_nextjs_page_sync
from django.contrib.auth.decorators import login_required
from django.conf import settings


@login_required
def index(request):
    context = {}
    return render_nextjs_page_sync(request, "base.html", context=context)
