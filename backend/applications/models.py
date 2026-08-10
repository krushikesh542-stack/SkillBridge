from django.conf import settings
from django.db import models

from opportunities.models import Opportunity
from profiles.models import validate_resume_size, validate_whatsapp_number
from django.core.validators import FileExtensionValidator


class Application(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("reviewing", "Reviewing"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]

    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications",
    )

    opportunity = models.ForeignKey(
        Opportunity,
        on_delete=models.CASCADE,
        related_name="applications",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    contact_email = models.EmailField(blank=True)
    whatsapp_number = models.CharField(max_length=32, blank=True, validators=[validate_whatsapp_number])
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    resume_snapshot = models.FileField(
        upload_to="application_resumes/",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["pdf"]), validate_resume_size],
    )

    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-applied_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["applicant", "opportunity"],
                name="unique_application_per_opportunity",
            )
        ]

    def __str__(self):
        return f"{self.applicant} - {self.opportunity}"
