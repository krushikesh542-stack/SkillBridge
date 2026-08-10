from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from profiles.models import Skill
from .models import LearningResource, UserLearningProgress

User = get_user_model()


class LearningAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="learner", email="learner@example.com", role="student", password="pass12345")
        self.other_user = User.objects.create_user(username="other", email="other@example.com", role="student", password="pass12345")
        self.skill = Skill.objects.create(name="Python")
        self.resource = LearningResource.objects.create(title="Learn Python", description="A practical introduction.", skill=self.skill, difficulty="beginner", resource_type="course", resource_url="https://example.com/python")
        self.client.force_authenticate(self.user)

    def progress_url(self, resource=None):
        return reverse("learning-progress-update", args=[(resource or self.resource).id])

    def test_progress_always_belongs_to_request_user(self):
        response = self.client.patch(self.progress_url(), {"is_bookmarked": True, "user": self.other_user.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(UserLearningProgress.objects.exists())
        self.client.patch(self.progress_url(), {"is_bookmarked": True}, format="json")
        self.assertEqual(UserLearningProgress.objects.get().user, self.user)

    def test_bookmark_works(self):
        response = self.client.patch(self.progress_url(), {"is_bookmarked": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_bookmarked"])

    def test_completion_sets_completed_at(self):
        response = self.client.patch(self.progress_url(), {"is_completed": True}, format="json")
        self.assertTrue(response.data["is_completed"])
        self.assertIsNotNone(UserLearningProgress.objects.get().completed_at)

    def test_marking_incomplete_clears_completed_at(self):
        self.client.patch(self.progress_url(), {"is_completed": True}, format="json")
        response = self.client.patch(self.progress_url(), {"is_completed": False}, format="json")
        self.assertFalse(response.data["is_completed"])
        self.assertIsNone(UserLearningProgress.objects.get().completed_at)

    def test_duplicate_user_resource_progress_is_prevented(self):
        UserLearningProgress.objects.create(user=self.user, resource=self.resource)
        with self.assertRaises(IntegrityError), transaction.atomic():
            UserLearningProgress.objects.create(user=self.user, resource=self.resource)

    def test_saved_state_filtering(self):
        UserLearningProgress.objects.create(user=self.user, resource=self.resource, is_bookmarked=True)
        response = self.client.get(reverse("learning-resource-list"), {"state": "saved"})
        self.assertEqual([item["id"] for item in response.data], [self.resource.id])

    def test_completed_state_filtering(self):
        UserLearningProgress.objects.create(user=self.user, resource=self.resource, is_completed=True)
        response = self.client.get(reverse("learning-resource-list"), {"state": "completed"})
        self.assertEqual([item["id"] for item in response.data], [self.resource.id])

    def test_inactive_resources_are_excluded_and_cannot_be_updated(self):
        self.resource.is_active = False
        self.resource.save()
        self.assertEqual(self.client.get(reverse("learning-resource-list")).data, [])
        response = self.client.patch(self.progress_url(), {"is_bookmarked": True}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_invalid_skill_filter_returns_400(self):
        response = self.client.get(reverse("learning-resource-list"), {"skill": "not-a-number"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
