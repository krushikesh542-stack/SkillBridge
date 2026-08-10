from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Connection

User = get_user_model()


class ConnectionAPITests(APITestCase):
    def setUp(self):
        self.sender = User.objects.create_user(username="sender", email="sender@example.com", role="student", password="pass12345")
        self.recipient = User.objects.create_user(username="recipient", email="recipient@example.com", role="mentor", password="pass12345")
        self.client.force_authenticate(self.sender)

    def send_request(self):
        return self.client.post(reverse("connection-requests"), {"user_id": self.recipient.id}, format="json")

    def test_self_request_is_blocked(self):
        response = self.client.post(reverse("connection-requests"), {"user_id": self.sender.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Connection.objects.count(), 0)

    def test_duplicate_pair_is_blocked(self):
        self.assertEqual(self.send_request().status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.send_request().status_code, status.HTTP_400_BAD_REQUEST)
        self.client.force_authenticate(self.recipient)
        response = self.client.post(reverse("connection-requests"), {"user_id": self.sender.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Connection.objects.count(), 1)

    def test_recipient_can_accept(self):
        connection_id = self.send_request().data["id"]
        self.client.force_authenticate(self.recipient)
        response = self.client.patch(reverse("connection-request-update", args=[connection_id]), {"status": "accepted"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Connection.objects.get(pk=connection_id).status, Connection.Status.ACCEPTED)

    def test_sender_cannot_accept_own_request(self):
        connection_id = self.send_request().data["id"]
        response = self.client.patch(reverse("connection-request-update", args=[connection_id]), {"status": "accepted"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Connection.objects.get(pk=connection_id).status, Connection.Status.PENDING)

    def test_accepted_relationship_appears_in_connections(self):
        connection_id = self.send_request().data["id"]
        self.client.force_authenticate(self.recipient)
        self.client.patch(reverse("connection-request-update", args=[connection_id]), {"status": "accepted"}, format="json")
        response = self.client.get(reverse("connection-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["person"]["id"], self.sender.id)
