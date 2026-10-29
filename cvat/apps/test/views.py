# Copyright (C) 2026 CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from django.db.models import Count
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, renderer_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response

from cvat.apps.engine.models import LabeledShape, ShapeType, Task
from cvat.apps.engine.permissions import TaskPermission

SHAPE_TYPES = frozenset(value for value, _ in ShapeType.choices())


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

    An optional shape_type query parameter narrows the counts to one kind of
    shape. The response also reports the breakdown by shape type, because a task
    imported from COCO holds more shapes than the source file holds annotations
    and that difference is only visible once the shapes are split by type.
    """
    task = Task.objects.filter(pk=task_id).first()
    if task is None:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    if not TaskPermission.create_scope_view(request, task).check_access().allow:
        return Response(
            {"detail": "You do not have permission to view this task."},
            status=status.HTTP_403_FORBIDDEN,
        )

    shape_type = request.query_params.get("shape_type")
    if shape_type is not None and shape_type not in SHAPE_TYPES:
        return Response(
            {"detail": f"Unknown shape type '{shape_type}'.", "allowed": sorted(SHAPE_TYPES)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    shapes = LabeledShape.objects.filter(job__segment__task_id=task_id)
    if shape_type is not None:
        shapes = shapes.filter(type=shape_type)

    rows = list(
        shapes.values("label__name").annotate(count=Count("id")).order_by("-count", "label__name")
    )
    by_shape_type = list(
        shapes.values("type").annotate(count=Count("id")).order_by("-count", "type")
    )

    return Response(
        {
            "task_id": task_id,
            "shape_type": shape_type,
            "total": sum(row["count"] for row in rows),
            "by_shape_type": [
                {"type": row["type"], "count": row["count"]} for row in by_shape_type
            ],
            "counts": [{"label": row["label__name"], "count": row["count"]} for row in rows],
        }
    )