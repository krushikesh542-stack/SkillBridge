from rest_framework import serializers

from .models import Connection


def _media_url(request, field):
    if not field:
        return None
    try:
        url = field.url
    except ValueError:
        return None
    return request.build_absolute_uri(url) if request else url


def serialize_person(user, request=None):
    data = {
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "headline": "",
        "organization": "",
        "location": "",
        "skills": [],
        "profile_image": None,
    }

    if user.role == "student" and hasattr(user, "student_profile"):
        profile = user.student_profile
        data.update(
            headline=profile.headline,
            college=profile.college,
            organization=profile.college,
            location=profile.location,
            skills=[skill.name for skill in profile.skills.all()],
            profile_image=_media_url(request, profile.profile_image),
        )
    elif user.role == "mentor" and hasattr(user, "mentor_profile"):
        profile = user.mentor_profile
        data.update(
            headline=profile.headline,
            company=profile.company,
            organization=profile.company,
            job_title=profile.job_title,
            skills=[skill.name for skill in profile.skills.all()],
            profile_image=_media_url(request, profile.profile_image),
        )
    elif user.role == "startup" and hasattr(user, "startup_profile"):
        profile = user.startup_profile
        data.update(
            startup_name=profile.startup_name,
            headline=profile.industry,
            organization=profile.startup_name,
            industry=profile.industry,
            location=profile.location,
            profile_image=_media_url(request, profile.logo),
        )

    return data


class SendConnectionRequestSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(min_value=1)


class ConnectionStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[Connection.Status.ACCEPTED, Connection.Status.REJECTED])
