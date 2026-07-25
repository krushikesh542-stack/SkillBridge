from django.contrib import admin
from django.urls import include, path

from config.views import health_check


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    path("api/auth/", include("accounts.urls")),
    path("api/profiles/", include("profiles.urls")),
    path("api/opportunities/", include("opportunities.urls")),
    path("api/applications/", include("applications.urls")),
]