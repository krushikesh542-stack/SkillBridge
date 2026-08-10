from django.urls import path

from .views import ConnectionListView, ConnectionRequestListCreateView, ConnectionRequestUpdateView, DiscoveryView

urlpatterns = [
    path("discover/", DiscoveryView.as_view(), name="connection-discover"),
    path("requests/", ConnectionRequestListCreateView.as_view(), name="connection-requests"),
    path("requests/<int:pk>/", ConnectionRequestUpdateView.as_view(), name="connection-request-update"),
    path("", ConnectionListView.as_view(), name="connection-list"),
]
