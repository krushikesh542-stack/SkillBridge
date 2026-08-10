from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q
from django.core.files.base import ContentFile
from django.http import FileResponse
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError
from pathlib import Path
from uuid import uuid4

from opportunities.models import Opportunity

from .models import Application
from .serializers import (
    ApplicationSerializer,
    ApplicationStatusSerializer,
    RecruiterApplicantSerializer,
)

class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            applicant=self.request.user
        ).order_by("-applied_at")

    @transaction.atomic
    def perform_create(self, serializer):
        opportunity = serializer.validated_data["opportunity"]

        if self.request.user.role != "student":
            raise PermissionDenied("Only student accounts may apply for opportunities.")
        if opportunity.created_by_id == self.request.user.id:
            raise ValidationError({"detail": "You cannot apply to your own opportunity."})
        if not opportunity.is_active:
            raise ValidationError({"detail": "This opportunity is no longer active."})
        if opportunity.application_deadline and opportunity.application_deadline < timezone.localdate():
            raise ValidationError({"detail": "The application deadline has passed."})

        already_applied = Application.objects.filter(
            applicant=self.request.user,
            opportunity=opportunity,
        ).exists()

        if already_applied:
            raise ValidationError(
                {
                    "detail": (
                        "You have already applied for this opportunity."
                    )
                }
            )

        use_profile_resume = serializer.validated_data.pop("use_profile_resume", False)
        application = serializer.save(applicant=self.request.user)

        if use_profile_resume:
            profile = getattr(self.request.user, "student_profile", None)
            if profile and profile.resume:
                profile.resume.open("rb")
                try:
                    resume_bytes = profile.resume.read()
                finally:
                    profile.resume.close()
                suffix = Path(profile.resume.name).suffix.lower() or ".pdf"
                filename = f"application_{application.pk}_{uuid4().hex}{suffix}"
                application.resume_snapshot.save(filename, ContentFile(resume_bytes), save=True)


class OpportunityApplicantsListView(generics.ListAPIView):
    serializer_class = RecruiterApplicantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        opportunity_id = self.kwargs["opportunity_id"]
        opportunity = get_object_or_404(Opportunity, pk=opportunity_id)
        if opportunity.created_by_id != self.request.user.id:
            raise PermissionDenied("Only the opportunity creator may view applicants.")
        return Application.objects.filter(
            opportunity=opportunity,
        ).select_related(
            "applicant", "applicant__student_profile",
        ).prefetch_related(
            "applicant__student_profile__skills",
        ).order_by("-applied_at")

class ApplicationStatusUpdateView(generics.UpdateAPIView):
    serializer_class = ApplicationStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["patch"]

    def get_queryset(self):
        return Application.objects.filter(
            opportunity__created_by=self.request.user
        )


class ApplicationResumeDownloadView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        application = get_object_or_404(
            Application.objects.filter(
                Q(applicant=request.user) | Q(opportunity__created_by=request.user)
            ),
            pk=pk,
        )
        if not application.resume_snapshot:
            raise ValidationError({"detail": "No resume was submitted with this application."})
        filename = Path(application.resume_snapshot.name).name
        return FileResponse(
            application.resume_snapshot.open("rb"),
            as_attachment=True,
            filename=filename,
            content_type="application/pdf",
        )
