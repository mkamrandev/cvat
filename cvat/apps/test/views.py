from django.db.models import Count
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, renderer_classes
from rest_framework.renderers import JSONRenderer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from cvat.apps.engine.models import LabeledShape, Task


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@renderer_classes([JSONRenderer])
def annotation_counts(request, task_id: int):
    """Return the number of annotated shapes per label for one task.

    A shape reaches its task through job -> segment -> task, so one grouped
    query over LabeledShape is enough and no per-label query is issued.
    """
    if not Task.objects.filter(pk=task_id).exists():
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    rows = list(
        LabeledShape.objects.filter(job__segment__task_id=task_id)
        .values("label__name")
        .annotate(count=Count("id"))
        .order_by("-count", "label__name")
    )

    return Response(
        {
            "task_id": task_id,
            "total": sum(row["count"] for row in rows),
            "counts": [{"label": row["label__name"], "count": row["count"]} for row in rows],
        }
    )