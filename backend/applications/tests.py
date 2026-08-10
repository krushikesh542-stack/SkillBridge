from datetime import timedelta
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from opportunities.models import Opportunity
from profiles.models import StudentProfile
from .models import Application

User = get_user_model()


class ApplicationPermissionTests(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.media_directory = tempfile.TemporaryDirectory()
        cls.media_override = override_settings(MEDIA_ROOT=cls.media_directory.name)
        cls.media_override.enable()

    @classmethod
    def tearDownClass(cls):
        cls.media_override.disable()
        cls.media_directory.cleanup()
        super().tearDownClass()

    def setUp(self):
        self.student = User.objects.create_user(username="student", email="student@app.test", first_name="Student", last_name="One", role="student", password="pass12345")
        self.owner = User.objects.create_user(username="owner", email="owner@app.test", role="startup", password="pass12345")
        self.other = User.objects.create_user(username="other", email="other@app.test", role="startup", password="pass12345")
        self.opportunity = Opportunity.objects.create(created_by=self.owner, title="Role", company_name="Company", description="Description")
        self.payload = {
            "opportunity": self.opportunity.id,
            "contact_email": "confirmed@app.test",
            "whatsapp_number": "+91 98765 43210",
            "linkedin_url": "https://linkedin.com/in/student",
            "github_url": "https://github.com/student",
            "use_profile_resume": False,
        }

    def apply_as(self, user, opportunity=None, **overrides):
        self.client.force_authenticate(user)
        payload = {**self.payload, **overrides}
        payload["opportunity"] = (opportunity or self.opportunity).id
        return self.client.post(reverse("application-list-create"), payload, format="json")

    def test_application_stores_contact_snapshot_and_request_user(self):
        response = self.apply_as(self.student, applicant=self.other.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        application = Application.objects.get()
        self.assertEqual(application.applicant, self.student)
        self.assertEqual(application.contact_email, "confirmed@app.test")
        self.assertEqual(application.whatsapp_number, "+91 98765 43210")
        self.assertEqual(application.linkedin_url, "https://linkedin.com/in/student")
        self.assertEqual(application.github_url, "https://github.com/student")

    def test_contact_email_is_required(self):
        self.assertEqual(self.apply_as(self.student, contact_email="").status_code, status.HTTP_400_BAD_REQUEST)

    def test_whatsapp_number_is_required(self):
        self.assertEqual(self.apply_as(self.student, whatsapp_number="").status_code, status.HTTP_400_BAD_REQUEST)

    def test_profile_resume_is_copied_and_survives_profile_replacement(self):
        profile = StudentProfile.objects.create(user=self.student)
        profile.resume.save("original.pdf", SimpleUploadedFile("original.pdf", b"original pdf", content_type="application/pdf"))
        response = self.apply_as(self.student, use_profile_resume=True)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        application = Application.objects.get()
        snapshot_name = application.resume_snapshot.name
        with application.resume_snapshot.open("rb") as snapshot:
            self.assertEqual(snapshot.read(), b"original pdf")
        profile.resume.save("replacement.pdf", SimpleUploadedFile("replacement.pdf", b"replacement pdf", content_type="application/pdf"))
        application.refresh_from_db()
        self.assertEqual(application.resume_snapshot.name, snapshot_name)
        with application.resume_snapshot.open("rb") as snapshot:
            self.assertEqual(snapshot.read(), b"original pdf")

    def test_owner_can_view_applicant_profile_and_contact(self):
        profile = StudentProfile.objects.create(user=self.student, headline="Developer", college="College", degree="BSc", whatsapp_number="+91 98765 43210")
        self.apply_as(self.student)
        self.client.force_authenticate(self.owner)
        response = self.client.get(reverse("opportunity-applicants", args=[self.opportunity.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["contact_email"], "confirmed@app.test")
        self.assertEqual(response.data[0]["applicant_profile"]["headline"], profile.headline)
        self.assertEqual(response.data[0]["applicant_profile"]["first_name"], "Student")
        self.assertNotIn("opportunity_details", response.data[0])

    def test_non_owner_cannot_view_applicants(self):
        self.apply_as(self.student)
        self.client.force_authenticate(self.other)
        response = self.client.get(reverse("opportunity-applicants", args=[self.opportunity.id]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_resume_access_is_limited_to_applicant_and_owner(self):
        profile = StudentProfile.objects.create(user=self.student)
        profile.resume.save("resume.pdf", SimpleUploadedFile("resume.pdf", b"resume pdf", content_type="application/pdf"))
        self.apply_as(self.student, use_profile_resume=True)
        application = Application.objects.get()
        url = reverse("application-resume", args=[application.id])
        self.client.force_authenticate(self.student)
        applicant_response = self.client.get(url)
        self.assertEqual(applicant_response.status_code, status.HTTP_200_OK)
        applicant_response.close()
        self.client.force_authenticate(self.owner)
        owner_response = self.client.get(url)
        self.assertEqual(owner_response.status_code, status.HTTP_200_OK)
        owner_response.close()
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(url).status_code, status.HTTP_404_NOT_FOUND)

    def test_connections_discovery_does_not_expose_contact_information(self):
        StudentProfile.objects.create(user=self.student, whatsapp_number="+91 98765 43210", linkedin_url="https://linkedin.com/in/student")
        self.client.force_authenticate(self.owner)
        response = self.client.get(reverse("connection-discover"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        student = next(item for item in response.data if item["id"] == self.student.id)
        for field in ("email", "whatsapp_number", "linkedin_url", "github_url", "portfolio_url", "resume"):
            self.assertNotIn(field, student)

    def test_duplicate_applications_remain_blocked(self):
        self.assertEqual(self.apply_as(self.student).status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.apply_as(self.student).status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_student_cannot_apply(self):
        self.assertEqual(self.apply_as(self.other).status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_apply_to_own_opportunity(self):
        own = Opportunity.objects.create(created_by=self.student, title="Own", company_name="Mine", description="Description")
        self.assertEqual(self.apply_as(self.student, own).status_code, status.HTTP_400_BAD_REQUEST)

    def test_inactive_opportunity_application_is_rejected(self):
        self.opportunity.is_active = False
        self.opportunity.save()
        self.assertEqual(self.apply_as(self.student).status_code, status.HTTP_400_BAD_REQUEST)

    def test_expired_opportunity_application_is_rejected(self):
        self.opportunity.application_deadline = timezone.localdate() - timedelta(days=1)
        self.opportunity.save()
        self.assertEqual(self.apply_as(self.student).status_code, status.HTTP_400_BAD_REQUEST)
