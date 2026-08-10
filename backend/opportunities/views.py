# pyrefly: ignore [missing-import]
from django.db import models
from rest_framework import generics, permissions, filters
from rest_framework.exceptions import PermissionDenied
from .permissions import IsOwnerOrReadOnly

from .models import Opportunity
from .serializers import OpportunitySerializer


class OpportunityListCreateView(generics.ListCreateAPIView):
    queryset = Opportunity.objects.filter(is_active=True)
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'company_name', 'description', 'location', 'skills__name']

    def perform_create(self, serializer):
        # Only startup/recruiter users may publish opportunities
        if self.request.user.role != "startup":
            raise PermissionDenied(
                "Only startup/recruiter accounts may publish opportunities."
            )
        serializer.save(created_by=self.request.user)

class MyOpportunityListView(generics.ListAPIView):
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Opportunity.objects.filter(
            created_by=self.request.user
        ).order_by("-created_at")


class OpportunityDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Opportunity.objects.filter(
            models.Q(is_active=True) | models.Q(created_by=self.request.user)
        )

    
