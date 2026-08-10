from django.urls import path
from .dashboard_views import DashboardStatsView

from .views import (
    MyOpportunityListView,
    OpportunityDetailView,
    OpportunityListCreateView,
)


urlpatterns = [
    path("", OpportunityListCreateView.as_view(), name="opportunity-list-create"),
    path("my/", MyOpportunityListView.as_view(), name="my-opportunities"),
    path("<int:pk>/", OpportunityDetailView.as_view(), name="opportunity-detail"),
    path("dashboard/stats/",DashboardStatsView.as_view(),name="dashboard-stats",
),
]