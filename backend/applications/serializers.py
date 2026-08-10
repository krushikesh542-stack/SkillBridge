from django.urls import reverse
from rest_framework import serializers

from opportunities.serializers import OpportunitySerializer
from profiles.serializers import SkillSerializer

from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    opportunity_details = OpportunitySerializer(source="opportunity", read_only=True)
    use_profile_resume = serializers.BooleanField(write_only=True, required=False, default=False)
    has_resume = serializers.SerializerMethodField()
    resume_download_url = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            "id", "status", "applied_at", "applicant", "opportunity",
            "opportunity_details", "contact_email", "whatsapp_number",
            "linkedin_url", "github_url", "use_profile_resume", "has_resume",
            "resume_download_url",
        ]
        read_only_fields = [
            "id", "applicant", "status", "applied_at", "opportunity_details",
            "has_resume", "resume_download_url",
        ]
        extra_kwargs = {
            "contact_email": {"required": True, "allow_blank": False},
            "whatsapp_number": {"required": True, "allow_blank": False},
            "linkedin_url": {"required": False, "allow_blank": True},
            "github_url": {"required": False, "allow_blank": True},
        }

    def get_has_resume(self, obj):
        return bool(obj.resume_snapshot)

    def get_resume_download_url(self, obj):
        if not obj.resume_snapshot:
            return None
        request = self.context.get("request")
        path = reverse("application-resume", args=[obj.pk])
        return request.build_absolute_uri(path) if request else path


class RecruiterApplicantProfileSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    headline = serializers.CharField(read_only=True)
    bio = serializers.CharField(read_only=True)
    college = serializers.CharField(read_only=True)
    degree = serializers.CharField(read_only=True)
    graduation_year = serializers.IntegerField(read_only=True, allow_null=True)
    location = serializers.CharField(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    portfolio_url = serializers.URLField(read_only=True)
    profile_image = serializers.ImageField(read_only=True, allow_null=True)


class RecruiterApplicantSerializer(ApplicationSerializer):
    applicant_profile = serializers.SerializerMethodField()

    class Meta(ApplicationSerializer.Meta):
        fields = [
            "id", "status", "applied_at", "contact_email", "whatsapp_number",
            "linkedin_url", "github_url", "has_resume", "resume_download_url",
            "applicant_profile",
        ]
        read_only_fields = fields

    def get_applicant_profile(self, obj):
        profile = getattr(obj.applicant, "student_profile", None)
        if profile is not None:
            return RecruiterApplicantProfileSerializer(profile, context=self.context).data
        return {
            "user_id": obj.applicant_id,
            "username": obj.applicant.username,
            "first_name": obj.applicant.first_name,
            "last_name": obj.applicant.last_name,
            "headline": "", "bio": "", "college": "", "degree": "",
            "graduation_year": None, "location": "", "skills": [],
            "portfolio_url": "", "profile_image": None,
        }


class ApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["status"]
