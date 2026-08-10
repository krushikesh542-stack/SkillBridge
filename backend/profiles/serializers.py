from rest_framework import serializers

from .models import MentorProfile, Skill, StartupProfile, StudentProfile


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]


class StudentProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)

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
            "role",
            "headline",
            "bio",
            "college",
            "degree",
            "graduation_year",
            "location",
            "whatsapp_number",
            "github_url",
            "linkedin_url",
            "portfolio_url",
            "skills",
            "skill_names",
            "profile_image",
            "available_for_work",
            "resume",
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


class MentorProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    skill_names = serializers.ListField(child=serializers.CharField(max_length=100), write_only=True, required=False)

    class Meta:
        model = MentorProfile
        fields = ["id", "email", "username", "role", "headline", "bio", "company", "job_title", "years_of_experience", "linkedin_url", "skills", "skill_names", "profile_image", "is_available", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def update(self, instance, validated_data):
        skill_names = validated_data.pop("skill_names", None)
        instance = super().update(instance, validated_data)
        if skill_names is not None:
            skills = []
            for name in skill_names:
                cleaned = name.strip()
                if cleaned:
                    skill, _ = Skill.objects.get_or_create(name__iexact=cleaned, defaults={"name": cleaned})
                    skills.append(skill)
            instance.skills.set(skills)
        return instance


class StartupProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)

    class Meta:
        model = StartupProfile
        fields = ["id", "email", "username", "role", "startup_name", "description", "industry", "location", "website_url", "linkedin_url", "stage", "team_size", "logo", "is_verified", "created_at", "updated_at"]
        read_only_fields = ["id", "is_verified", "created_at", "updated_at"]
