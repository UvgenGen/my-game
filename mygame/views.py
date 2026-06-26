from asgiref.sync import async_to_sync
from django.contrib.auth.decorators import login_required
from django_nextjs.render import render_nextjs_page


@login_required
def index(request):
    return async_to_sync(render_nextjs_page)(request, "base_next.html")
