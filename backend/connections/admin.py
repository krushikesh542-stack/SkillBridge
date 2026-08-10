from django.contrib import admin

from .models import Connection


@admin.register(Connection)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ("user_one", "user_two", "initiated_by", "status", "updated_at")
    list_filter = ("status",)
    search_fields = ("user_one__username", "user_two__username")
