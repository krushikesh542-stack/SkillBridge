from rest_framework import serializers

from .models import Skill, StudentProfile


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]


class StudentProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    skills = SkillSerializer(many=True, read_only=True)
    skill_names = serializers.ListField(
        child=serializers.CharField(max_length=100),
        write_only=True,
        required=False,
    )

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "email",
            "username",
            "headline",
            "bio",
            "college",
            "degree",
            "graduation_year",
            "location",
            "github_url",
            "linkedin_url",
            "portfolio_url",
            "skills",
            "skill_names",
            "profile_image",
            "available_for_work",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def update(self, instance, validated_data):
        skill_names = validated_data.pop("skill_names", None)

        instance = super().update(instance, validated_data)

        if skill_names is not None:
            skills = []

            for name in skill_names:
                cleaned_name = name.strip()

                if not cleaned_name:
                    continue

                skill, _ = Skill.objects.get_or_create(
                    name__iexact=cleaned_name,
                    defaults={"name": cleaned_name},
                )

                skills.append(skill)

            instance.skills.set(skills)

        return instance