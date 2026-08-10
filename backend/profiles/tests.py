from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import MentorProfile, StartupProfile, StudentProfile

User = get_user_model()


class RoleProfileTests(APITestCase):
    def test_correct_role_profile_is_returned(self):
        cases = [("student", StudentProfile), ("mentor", MentorProfile), ("startup", StartupProfile)]
        for index, (role, model) in enumerate(cases):
            user = User.objects.create_user(username=f"user{index}", email=f"user{index}@profile.test", role=role, password="pass12345")
            self.client.force_authenticate(user)
            response = self.client.get(reverse("my-student-profile"))
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data["role"], role)
            self.assertTrue(model.objects.filter(user=user).exists())

    def test_student_whatsapp_number_saves(self):
        user = User.objects.create_user(username="phone", email="phone@profile.test", role="student", password="pass12345")
        self.client.force_authenticate(user)
        response = self.client.patch(reverse("my-student-profile"), {"whatsapp_number": "+91 (98765) 43210"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["whatsapp_number"], "+91 (98765) 43210")
        self.assertEqual(StudentProfile.objects.get(user=user).whatsapp_number, "+91 (98765) 43210")

    def test_student_whatsapp_number_rejects_invalid_values(self):
        user = User.objects.create_user(username="badphone", email="badphone@profile.test", role="student", password="pass12345")
        self.client.force_authenticate(user)
        response = self.client.patch(reverse("my-student-profile"), {"whatsapp_number": "call-me"}, format="json")
        self.assertEqual(response.status_code, 400)
