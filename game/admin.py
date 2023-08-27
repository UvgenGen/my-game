from django.contrib import admin
from .models import Player, Game


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('user', 'score', 'is_responder', 'is_active')
    list_filter = ('is_responder', 'is_active')
    search_fields = ('user__username', 'user__first_name', 'user__last_name')


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('title', 'max_player_count', 'creator', 'created_at', 'active_round', 'state')
    list_filter = ('max_player_count', 'creator', 'created_at', 'state')
    search_fields = ('title', 'creator__username', 'creator__first_name', 'creator__last_name')
