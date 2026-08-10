from django.conf import settings
from django.core.validators import URLValidator
from django.db import models

from profiles.models import Skill


http_https_validator = URLValidator(schemes=["http", "https"])


class LearningResource(models.Model):
    class Difficulty(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"

    class ResourceType(models.TextChoices):
        COURSE = "course", "Course"
        ARTICLE = "article", "Article"
        VIDEO = "video", "Video"
        DOCUMENTATION = "documentation", "Documentation"

    title = models.CharField(max_length=200)
    description = models.TextField()
    skill = models.ForeignKey(Skill, on_delete=models.PROTECT, related_name="learning_resources")
    difficulty = models.CharField(max_length=20, choices=Difficulty.choices)
    resource_type = models.CharField(max_length=20, choices=ResourceType.choices)
    resource_url = models.URLField(validators=[http_https_validator])
    estimated_duration = models.CharField(max_length=80, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["skill__name", "title"]

    def __str__(self):
        return self.title


class UserLearningProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="learning_progress")
    resource = models.ForeignKey(LearningResource, on_delete=models.CASCADE, related_name="user_progress")
    is_bookmarked = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "resource"], name="unique_user_learning_progress")
        ]

    def __str__(self):
        return f"{self.user} - {self.resource}"
