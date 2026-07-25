from django.conf import settings
from django.db import models

from profiles.models import Skill


class Opportunity(models.Model):
    class OpportunityType(models.TextChoices):
        INTERNSHIP = "internship", "Internship"
        JOB = "job", "Job"
        PROJECT = "project", "Project"
        FREELANCE = "freelance", "Freelance"

    class WorkMode(models.TextChoices):
        REMOTE = "remote", "Remote"
        ONSITE = "onsite", "On-site"
        HYBRID = "hybrid", "Hybrid"

    class ExperienceLevel(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_opportunities",
    )

    title = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=150, blank=True)

    opportunity_type = models.CharField(
        max_length=20,
        choices=OpportunityType.choices,
        default=OpportunityType.INTERNSHIP,
    )

    work_mode = models.CharField(
        max_length=20,
        choices=WorkMode.choices,
        default=WorkMode.REMOTE,
    )

    experience_level = models.CharField(
        max_length=20,
        choices=ExperienceLevel.choices,
        default=ExperienceLevel.BEGINNER,
    )

    skills = models.ManyToManyField(
        Skill,
        related_name="opportunities",
        blank=True,
    )

    stipend = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Monthly stipend or salary amount",
    )

    application_deadline = models.DateField(
        null=True,
        blank=True,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title