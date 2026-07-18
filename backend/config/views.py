from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def health_check(request):
    """Return the current backend status."""

    return Response(
        {
            "status": "success",
            "message": "SkillBridge backend is running",
        }
    )