from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from applications.models import Application
from .models import Opportunity

User = get_user_model()


class OpportunityVisibilityAndDashboardTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", email="owner@opp.test", role="startup", password="pass12345")
        self.student = User.objects.create_user(username="student", email="student@opp.test", role="student", password="pass12345")
        self.inactive = Opportunity.objects.create(created_by=self.owner, title="Inactive", company_name="Company", description="Description", is_active=False)

    def test_inactive_opportunity_hidden_from_non_owner(self):
        self.client.force_authenticate(self.student)
        self.assertEqual(self.client.get(reverse("opportunity-detail", args=[self.inactive.id])).status_code, status.HTTP_404_NOT_FOUND)
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.get(reverse("opportunity-detail", args=[self.inactive.id])).status_code, status.HTTP_200_OK)

    def test_student_dashboard_application_count_is_correct(self):
        active = Opportunity.objects.create(created_by=self.owner, title="Active", company_name="Company", description="Description")
        Application.objects.create(applicant=self.student, opportunity=active)
        self.client.force_authenticate(self.student)
        response = self.client.get(reverse("dashboard-stats"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_applications"], 1)
