# Copyright (C) 2026 CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from django.db.models import Count
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, renderer_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from cvat.apps.engine.models import LabeledShape, Task
from cvat.apps.engine.permissions import TaskPermission


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@renderer_classes([JSONRenderer])
def annotation_counts(request, task_id: int):
    """Return the number of annotated shapes per label for one task.

    A shape reaches its task through job -> segment -> task, so one grouped query
    over LabeledShape is enough and no query is issued per label.

    Access is decided by CVAT's own TaskPermission rather than by a check written
    here, so this endpoint stays consistent with the rest of the API if the task
    visibility rules change.
    """
    task = Task.objects.filter(pk=task_id).first()
    if task is None:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    if not TaskPermission.create_scope_view(request, task).check_access().allow:
        return Response(
            {"detail": "You do not have permission to view this task."},
            status=status.HTTP_403_FORBIDDEN,
        )

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