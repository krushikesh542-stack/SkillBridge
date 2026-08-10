from django.urls import path

from .views import LearningProgressUpdateView, LearningResourceListView, LearningSkillListView

urlpatterns = [
    path("resources/", LearningResourceListView.as_view(), name="learning-resource-list"),
    path("resources/<int:pk>/progress/", LearningProgressUpdateView.as_view(), name="learning-progress-update"),
    path("skills/", LearningSkillListView.as_view(), name="learning-skill-list"),
]
