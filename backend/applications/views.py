from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError

from .models import Application
from .serializers import ApplicationSerializer


class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(applicant=self.request.user)

    def perform_create(self, serializer):
        opportunity = serializer.validated_data["opportunity"]

        already_applied = Application.objects.filter(
            applicant=self.request.user,
            opportunity=opportunity,
        ).exists()

        if already_applied:
            raise ValidationError(
                {"detail": "You have already applied for this opportunity."}
            )

        serializer.save(applicant=self.request.user)