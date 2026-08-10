from django.urls import path

from .views import (
    ApplicationListCreateView,
    ApplicationStatusUpdateView,
    ApplicationResumeDownloadView,
    OpportunityApplicantsListView,
)


urlpatterns = [
    path(
        "",
        ApplicationListCreateView.as_view(),
        name="application-list-create",
    ),

    path(
        "opportunity/<int:opportunity_id>/",
        OpportunityApplicantsListView.as_view(),
        name="opportunity-applicants",
    ),
    
    path(
    "<int:pk>/status/",
    ApplicationStatusUpdateView.as_view(),
    name="application-status-update",
),
    path(
        "<int:pk>/resume/",
        ApplicationResumeDownloadView.as_view(),
        name="application-resume",
    ),
]
