from rest_framework import generics, permissions

from .models import MentorProfile, StartupProfile, StudentProfile
from .serializers import MentorProfileSerializer, StartupProfileSerializer, StudentProfileSerializer


class MyStudentProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        if user.role == "mentor":
            profile, _ = MentorProfile.objects.get_or_create(user=user)
        elif user.role == "startup":
            profile, _ = StartupProfile.objects.get_or_create(user=user, defaults={"startup_name": user.username})
        else:
            profile, _ = StudentProfile.objects.get_or_create(user=user)
        return profile

    def get_serializer_class(self):
        if self.request.user.role == "mentor":
            return MentorProfileSerializer
        if self.request.user.role == "startup":
            return StartupProfileSerializer
        return StudentProfileSerializer
