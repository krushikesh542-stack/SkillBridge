from django.contrib import admin

from .models import MentorProfile, Skill, StartupProfile, StudentProfile


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    search_fields = ("name",)


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "college",
        "location",
        "available_for_work",
    )

    search_fields = (
        "user__email",
        "college",
        "degree",
    )

    filter_horizontal = ("skills",)


@admin.register(StartupProfile)
class StartupProfileAdmin(admin.ModelAdmin):
    list_display = (
        "startup_name",
        "user",
        "industry",
        "stage",
        "is_verified",
    )

    search_fields = (
        "startup_name",
        "user__email",
        "industry",
    )

    list_filter = (
        "stage",
        "is_verified",
    )


@admin.register(MentorProfile)
class MentorProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "company",
        "job_title",
        "years_of_experience",
        "is_available",
    )

    search_fields = (
        "user__email",
        "company",
        "job_title",
    )

    filter_horizontal = ("skills",)