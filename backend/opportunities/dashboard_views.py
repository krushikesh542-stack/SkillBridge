from django.db.models import Count

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Opportunity
from applications.models import Application


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == "student":
            applications = Application.objects.filter(applicant=request.user)
            return Response({
                "total_opportunities": 0,
                "total_applications": applications.count(),
                "accepted": applications.filter(status="accepted").count(),
                "pending": applications.filter(status="pending").count(),
                "reviewing": applications.filter(status="reviewing").count(),
                "rejected": applications.filter(status="rejected").count(),
            })
        if request.user.role == "mentor":
            return Response({"total_opportunities": 0, "total_applications": 0, "accepted": 0, "pending": 0, "reviewing": 0, "rejected": 0})

        opportunities = Opportunity.objects.filter(
            created_by=request.user
        )

        applications = Application.objects.filter(
            opportunity__created_by=request.user
        )

        return Response(
            {
                "total_opportunities": opportunities.count(),
                "total_applications": applications.count(),
                "accepted": applications.filter(
                    status="accepted"
                ).count(),
                "pending": applications.filter(
                    status="pending"
                ).count(),
                "reviewing": applications.filter(
                    status="reviewing"
                ).count(),
                "rejected": applications.filter(
                    status="rejected"
                ).count(),
            }
        )
