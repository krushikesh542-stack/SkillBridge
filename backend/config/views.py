from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Return the current backend status."""

    return Response(
        {
            "status": "success",
            "message": "SkillBridge backend is running",
        }
    )
