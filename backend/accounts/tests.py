from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class HealthCheckTests(APITestCase):
    def test_health_endpoint_is_public(self):
        response = self.client.get(reverse("health-check"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "success")


class RegistrationTests(APITestCase):
    url = reverse("register")

    def payload(self, **overrides):
        data = {
            "first_name": "Asha",
            "last_name": "Patel",
            "username": "asha",
            "email": "asha@example.com",
            "role": "student",
            "password": "StrongPass!482",
            "confirm_password": "StrongPass!482",
        }
        data.update(overrides)
        return data

    def test_student_registration(self):
        response = self.client.post(self.url, self.payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.get(email="asha@example.com").role, "student")

    def test_mentor_registration(self):
        response = self.client.post(self.url, self.payload(username="mentor", email="mentor@example.com", role="mentor"), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.get(email="mentor@example.com").role, "mentor")

    def test_startup_registration(self):
        response = self.client.post(self.url, self.payload(username="startup", email="startup@example.com", role="startup"), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.get(email="startup@example.com").role, "startup")

    def test_duplicate_email_is_rejected(self):
        User.objects.create_user(username="existing", email="asha@example.com", role="student", password="StrongPass!482")
        response = self.client.post(self.url, self.payload(username="different"), format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_duplicate_username_is_rejected(self):
        User.objects.create_user(username="asha", email="existing@example.com", role="student", password="StrongPass!482")
        response = self.client.post(self.url, self.payload(email="different@example.com"), format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)

    def test_invalid_role_is_rejected(self):
        response = self.client.post(self.url, self.payload(role="admin"), format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("role", response.data)

    def test_password_is_hashed(self):
        raw_password = self.payload()["password"]
        response = self.client.post(self.url, self.payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="asha@example.com")
        self.assertNotEqual(user.password, raw_password)
        self.assertTrue(user.check_password(raw_password))

    def test_privileged_flags_cannot_elevate_user(self):
        response = self.client.post(self.url, self.payload(is_staff=True, is_superuser=True), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="asha@example.com")
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
