from rest_framework import generics, permissions

from .models import StudentProfile
from .serializers import StudentProfileSerializer


class MyStudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = StudentProfile.objects.get_or_create(
            user=self.request.user
        )

        return profile