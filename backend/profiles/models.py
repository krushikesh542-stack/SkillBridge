from django.conf import settings
from django.db import models


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )

    headline = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    college = models.CharField(max_length=200, blank=True)
    degree = models.CharField(max_length=150, blank=True)
    graduation_year = models.PositiveIntegerField(null=True, blank=True)
    location = models.CharField(max_length=150, blank=True)

    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)

    skills = models.ManyToManyField(
        Skill,
        related_name="students",
        blank=True,
    )

    profile_image = models.ImageField(
        upload_to="student_profiles/",
        blank=True,
        null=True,
    )

    available_for_work = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Student: {self.user.email}"


class StartupProfile(models.Model):
    class Stage(models.TextChoices):
        IDEA = "idea", "Idea Stage"
        PRE_SEED = "pre_seed", "Pre-Seed"
        SEED = "seed", "Seed"
        SERIES_A = "series_a", "Series A"
        GROWTH = "growth", "Growth Stage"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="startup_profile",
    )

    startup_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    industry = models.CharField(max_length=150, blank=True)
    location = models.CharField(max_length=150, blank=True)

    website_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)

    stage = models.CharField(
        max_length=30,
        choices=Stage.choices,
        default=Stage.IDEA,
    )

    team_size = models.PositiveIntegerField(default=1)

    logo = models.ImageField(
        upload_to="startup_logos/",
        blank=True,
        null=True,
    )

    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.startup_name


class MentorProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="mentor_profile",
    )

    headline = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    company = models.CharField(max_length=200, blank=True)
    job_title = models.CharField(max_length=150, blank=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    linkedin_url = models.URLField(blank=True)

    skills = models.ManyToManyField(
        Skill,
        related_name="mentors",
        blank=True,
    )

    profile_image = models.ImageField(
        upload_to="mentor_profiles/",
        blank=True,
        null=True,
    )

    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Mentor: {self.user.email}"