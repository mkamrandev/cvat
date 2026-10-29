from django.urls import path

from . import views

urlpatterns = [
    path(
        "test/tasks/<int:task_id>/annotation-counts",
        views.annotation_counts,
        name="annotation-counts",
    ),
]