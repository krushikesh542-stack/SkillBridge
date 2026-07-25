from rest_framework import serializers

from profiles.models import Skill
from profiles.serializers import SkillSerializer

from .models import Opportunity


class OpportunitySerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(
        source="created_by.email",
        read_only=True,
    )

    skills = SkillSerializer(many=True, read_only=True)

    skill_names = serializers.ListField(
        child=serializers.CharField(max_length=100),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Opportunity
        fields = [
            "id",
            "created_by_email",
            "title",
            "company_name",
            "description",
            "location",
            "opportunity_type",
            "work_mode",
            "experience_level",
            "skills",
            "skill_names",
            "stipend",
            "application_deadline",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_by_email",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        skill_names = validated_data.pop("skill_names", [])
        opportunity = Opportunity.objects.create(**validated_data)

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

        opportunity.skills.set(skills)

        return opportunity

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