from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from django.db import models
from django.conf import settings
import re

def validate_resume_size(value):
    max_mb = 5
    if value.size > max_mb * 1024 * 1024:
        raise ValidationError(f"Resume file size must not exceed {max_mb} MB.")


def validate_whatsapp_number(value):
    if not value:
        return
    if not re.fullmatch(r"\+?[0-9\s().-]+", value):
        raise ValidationError("Enter a valid phone number using digits, +, spaces, parentheses, or hyphens.")
    digit_count = sum(character.isdigit() for character in value)
    if digit_count < 7 or digit_count > 15:
        raise ValidationError("Enter a phone number containing between 7 and 15 digits.")


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
    whatsapp_number = models.CharField(
        max_length=32,
        blank=True,
        validators=[validate_whatsapp_number],
    )

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

    resume = models.FileField(
        upload_to="student_resumes/",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf']), validate_resume_size],
        help_text="Upload your resume in PDF format (max 5 MB).",
    )

    available_for_work = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



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
