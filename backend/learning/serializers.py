from rest_framework import serializers

from profiles.serializers import SkillSerializer

from .models import LearningResource


class LearningResourceSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    is_bookmarked = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()
    completed_at = serializers.SerializerMethodField()

    class Meta:
        model = LearningResource
        fields = [
            "id", "title", "description", "skill", "difficulty",
            "resource_type", "resource_url", "estimated_duration",
            "is_bookmarked", "is_completed", "completed_at",
        ]

    def _progress(self, obj):
        return self.context.get("progress_by_resource", {}).get(obj.id)

    def get_is_bookmarked(self, obj):
        progress = self._progress(obj)
        return progress.is_bookmarked if progress else False

    def get_is_completed(self, obj):
        progress = self._progress(obj)
        return progress.is_completed if progress else False

    def get_completed_at(self, obj):
        progress = self._progress(obj)
        return progress.completed_at if progress and progress.is_completed else None


class LearningProgressUpdateSerializer(serializers.Serializer):
    is_bookmarked = serializers.BooleanField(required=False)
    is_completed = serializers.BooleanField(required=False)

    def validate(self, attrs):
        allowed = {"is_bookmarked", "is_completed"}
        unknown = set(self.initial_data) - allowed
        if unknown:
            raise serializers.ValidationError({key: "This field is not allowed." for key in unknown})
        if not attrs:
            raise serializers.ValidationError("Provide is_bookmarked or is_completed.")
        return attrs
