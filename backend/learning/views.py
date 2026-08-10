from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from profiles.models import Skill
from profiles.serializers import SkillSerializer
from .models import LearningResource, UserLearningProgress
from .serializers import LearningProgressUpdateSerializer, LearningResourceSerializer


class LearningResourceListView(generics.ListAPIView):
    serializer_class = LearningResourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = LearningResource.objects.filter(is_active=True).select_related("skill")
        params = self.request.query_params
        search = params.get("search", "").strip()
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(description__icontains=search) | Q(skill__name__icontains=search))
        if params.get("skill"):
            try:
                skill_id = int(params["skill"])
            except (TypeError, ValueError):
                raise serializers.ValidationError({"skill": "Skill must be a numeric ID."})
            queryset = queryset.filter(skill_id=skill_id)
        if params.get("difficulty"):
            queryset = queryset.filter(difficulty=params["difficulty"])
        if params.get("resource_type"):
            queryset = queryset.filter(resource_type=params["resource_type"])
        if params.get("state") == "saved":
            queryset = queryset.filter(user_progress__user=self.request.user, user_progress__is_bookmarked=True)
        elif params.get("state") == "completed":
            queryset = queryset.filter(user_progress__user=self.request.user, user_progress__is_completed=True)
        return queryset.distinct()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        progress = UserLearningProgress.objects.filter(user=self.request.user, resource__in=self.get_queryset())
        context["progress_by_resource"] = {item.resource_id: item for item in progress}
        return context


class LearningProgressUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        resource = get_object_or_404(LearningResource.objects.select_related("skill"), pk=pk, is_active=True)
        serializer = LearningProgressUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            progress, _ = UserLearningProgress.objects.select_for_update().get_or_create(user=request.user, resource=resource)
            data = serializer.validated_data
            if "is_bookmarked" in data:
                progress.is_bookmarked = data["is_bookmarked"]
            if "is_completed" in data:
                progress.is_completed = data["is_completed"]
                progress.completed_at = timezone.now() if data["is_completed"] else None
            progress.save()
        context = {"request": request, "progress_by_resource": {resource.id: progress}}
        return Response(LearningResourceSerializer(resource, context=context).data)


class LearningSkillListView(generics.ListAPIView):
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Skill.objects.filter(learning_resources__is_active=True).distinct().order_by("name")
