from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Q


class Connection(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    user_one = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="connections_as_user_one")
    user_two = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="connections_as_user_two")
    initiated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="initiated_connections")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(fields=["user_one", "user_two"], name="unique_connection_pair"),
            models.CheckConstraint(condition=Q(user_one__lt=F("user_two")), name="connection_pair_canonical_and_not_self"),
            models.CheckConstraint(condition=Q(initiated_by=F("user_one")) | Q(initiated_by=F("user_two")), name="connection_initiator_is_participant"),
        ]

    @staticmethod
    def canonical_pair(first_user, second_user):
        if not first_user.pk or not second_user.pk:
            raise ValidationError("Both users must be saved.")
        if first_user.pk == second_user.pk:
            raise ValidationError("You cannot connect with yourself.")
        return (first_user, second_user) if first_user.pk < second_user.pk else (second_user, first_user)

    def clean(self):
        super().clean()
        if self.user_one_id and self.user_two_id and self.user_one_id >= self.user_two_id:
            raise ValidationError("Connection participants must be stored in canonical order.")
        if self.initiated_by_id and self.initiated_by_id not in {self.user_one_id, self.user_two_id}:
            raise ValidationError("The initiator must be a connection participant.")

    def save(self, *args, **kwargs):
        if self.user_one_id and self.user_two_id and self.user_one_id > self.user_two_id:
            self.user_one_id, self.user_two_id = self.user_two_id, self.user_one_id
        self.full_clean()
        return super().save(*args, **kwargs)

    def other_user(self, user):
        return self.user_two if self.user_one_id == user.id else self.user_one

    def recipient(self):
        return self.user_two if self.initiated_by_id == self.user_one_id else self.user_one

    def __str__(self):
        return f"{self.user_one} / {self.user_two} ({self.status})"
