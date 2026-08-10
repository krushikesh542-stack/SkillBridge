from django.contrib import admin
from .models import LearningResource, UserLearningProgress


@admin.register(LearningResource)
class LearningResourceAdmin(admin.ModelAdmin):
    list_display = ("title", "skill", "difficulty", "resource_type", "is_active", "updated_at")
    list_filter = ("is_active", "difficulty", "resource_type", "skill")
    search_fields = ("title", "description", "skill__name")
    list_editable = ("is_active",)
    ordering = ("skill__name", "title")


@admin.register(UserLearningProgress)
class UserLearningProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "resource", "is_bookmarked", "is_completed", "completed_at", "updated_at")
    list_filter = ("is_bookmarked", "is_completed", "resource__skill")
    search_fields = ("user__username", "user__email", "resource__title")
    readonly_fields = ("created_at", "updated_at", "completed_at")
