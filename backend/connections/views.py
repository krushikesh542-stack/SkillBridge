from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Connection
from .serializers import ConnectionStatusSerializer, SendConnectionRequestSerializer, serialize_person

User = get_user_model()


def user_queryset():
    return User.objects.filter(is_active=True).select_related(
        "student_profile", "mentor_profile", "startup_profile"
    ).prefetch_related("student_profile__skills", "mentor_profile__skills")


class DiscoveryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        users = user_queryset().exclude(pk=request.user.pk)
        search = request.query_params.get("search", "").strip()
        if search:
            users = users.filter(
                Q(username__icontains=search) | Q(first_name__icontains=search) |
                Q(last_name__icontains=search) | Q(student_profile__headline__icontains=search) |
                Q(student_profile__college__icontains=search) | Q(student_profile__skills__name__icontains=search) |
                Q(mentor_profile__headline__icontains=search) | Q(mentor_profile__company__icontains=search) |
                Q(mentor_profile__job_title__icontains=search) | Q(mentor_profile__skills__name__icontains=search) |
                Q(startup_profile__startup_name__icontains=search) | Q(startup_profile__industry__icontains=search)
            ).distinct()
        relationships = Connection.objects.filter(Q(user_one=request.user) | Q(user_two=request.user)).select_related("user_one", "user_two", "initiated_by")
        by_user = {item.other_user(request.user).id: item for item in relationships}
        results = []
        for user in users.order_by("first_name", "username"):
            person = serialize_person(user, request)
            relationship = by_user.get(user.id)
            state = "none"
            if relationship:
                if relationship.status == Connection.Status.ACCEPTED:
                    state = "connected"
                elif relationship.status == Connection.Status.REJECTED:
                    state = "retry"
                elif relationship.initiated_by_id == request.user.id:
                    state = "pending"
                else:
                    state = "request_received"
            person.update(relationship_state=state, connection_id=relationship.id if relationship else None)
            results.append(person)
        return Response(results)


class ConnectionRequestListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pending = Connection.objects.filter(status=Connection.Status.PENDING).filter(
            (Q(user_one=request.user) | Q(user_two=request.user)) & ~Q(initiated_by=request.user)
        ).select_related("user_one", "user_two", "initiated_by")
        return Response([{"id": item.id, "status": item.status, "created_at": item.created_at, "person": serialize_person(item.initiated_by, request)} for item in pending])

    def post(self, request):
        serializer = SendConnectionRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        target_id = serializer.validated_data["user_id"]
        if target_id == request.user.id:
            return Response({"detail": "You cannot connect with yourself."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            target = User.objects.get(pk=target_id, is_active=True)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        user_one, user_two = Connection.canonical_pair(request.user, target)
        with transaction.atomic():
            existing = Connection.objects.select_for_update().filter(user_one=user_one, user_two=user_two).first()
            if existing:
                if existing.status == Connection.Status.REJECTED:
                    existing.initiated_by = request.user
                    existing.status = Connection.Status.PENDING
                    existing.responded_at = None
                    existing.save(update_fields=["initiated_by", "status", "responded_at", "updated_at"])
                    return Response({"id": existing.id, "status": existing.status})
                message = "You are already connected." if existing.status == Connection.Status.ACCEPTED else "A connection request already exists."
                return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)
            try:
                connection = Connection.objects.create(user_one=user_one, user_two=user_two, initiated_by=request.user)
            except IntegrityError:
                return Response({"detail": "A connection request already exists."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"id": connection.id, "status": connection.status}, status=status.HTTP_201_CREATED)


class ConnectionRequestUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        serializer = ConnectionStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            try:
                connection = Connection.objects.select_for_update().get(pk=pk)
            except Connection.DoesNotExist:
                return Response({"detail": "Connection request not found."}, status=status.HTTP_404_NOT_FOUND)
            if request.user.id not in {connection.user_one_id, connection.user_two_id}:
                return Response({"detail": "You do not have permission to update this request."}, status=status.HTTP_403_FORBIDDEN)
            if connection.initiated_by_id == request.user.id:
                return Response({"detail": "Only the request recipient may respond."}, status=status.HTTP_403_FORBIDDEN)
            if connection.status != Connection.Status.PENDING:
                return Response({"detail": "Only pending requests may be updated."}, status=status.HTTP_400_BAD_REQUEST)
            connection.status = serializer.validated_data["status"]
            connection.responded_at = timezone.now()
            connection.save(update_fields=["status", "responded_at", "updated_at"])
        return Response({"id": connection.id, "status": connection.status})


class ConnectionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = Connection.objects.filter(status=Connection.Status.ACCEPTED).filter(
            Q(user_one=request.user) | Q(user_two=request.user)
        ).select_related("user_one", "user_two", "user_one__student_profile", "user_two__student_profile", "user_one__mentor_profile", "user_two__mentor_profile", "user_one__startup_profile", "user_two__startup_profile").prefetch_related("user_one__student_profile__skills", "user_two__student_profile__skills", "user_one__mentor_profile__skills", "user_two__mentor_profile__skills")
        return Response([{"id": item.id, "connected_at": item.responded_at or item.updated_at, "person": serialize_person(item.other_user(request.user), request)} for item in items])
