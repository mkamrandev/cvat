# Definition of Done

Written before the work started. Each line is ticked at the end only with a number,
a file reference or a link beside it. A tick with no evidence counts as unticked.

Base commit for every file reference below: `a81ed252dce15b805d5a544116cf98005e42f257`,
branch `dev-test01`.

## The floor, items 1 to 4

- [x] **Endpoint returns per-class counts for a task, read from the database.**
      → `cvat/apps/test/views.py` line 53 builds the queryset; the grouped count is
      applied on line 56. Reached at `GET /api/test/tasks/<id>/annotation-counts`.
      For task 1 the response is `total: 2401` across 77 labels, largest entry
      `person: 771`.

- [x] **Counts verified against a known number.**
      → The source file `instances_subset.json` holds 2168 COCO annotations. Expanding
      multi-part segmentations gives 2378 polygon parts, and the 23 `iscrowd`
      annotations become masks, so 2401 shapes are expected. The endpoint reports
      exactly 2401, split as `polygon: 2378` and `mask: 23`. Both halves match
      independently, not only the total.

- [x] **A page in the web interface calls the endpoint.**
      → `cvat-ui/src/components/annotation-counts/annotation-counts-page.tsx`.
      Registered at `cvat-ui/src/components/cvat-app.tsx` line 85 (import) and
      line 572 (route). Reached at `/tasks/:tid/annotation-counts`.

- [x] **The counts render as a graph.**
      → Horizontal bar chart, `annotation-counts-page.tsx` line 117, using
      `react-chartjs-2` and `chart.js`, both already dependencies of `cvat-ui`.
      No charting library was added.

- [x] **Empty state handled: a task with no annotations shows a clear message, not a
      blank page or a crash.**
      → `annotation-counts-page.tsx` line 97. Reproduced by creating task 2 with the
      same 300 images and the same labels but no annotation import. The page shows
      "Nothing to show for task 2 with the current filter."

- [x] **Error state handled: a failed request shows a visible error and the page stays
      usable.**
      → `annotation-counts-page.tsx` line 89. Reproduced two ways: `/tasks/999/annotation-counts`,
      where the task does not exist, and signing in as the user `outsider` and opening
      task 1. Both render "Could not load annotation counts" with the status text and a
      working "Try again" button. The first time this appeared was unplanned: the
      endpoint answered 406 because CVAT's default renderer rejected an
      `Accept: application/json` request, and the page handled it correctly.

## Beyond the floor

- [x] **Anonymous request to the endpoint is refused.**
      → `401`. Checked with
      `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/test/tasks/1/annotation-counts`.

- [x] **A logged-in user with no access to the task is refused.**
      → `403`. Second user `outsider` created through `manage.py shell` with
      `is_staff=False` and `is_superuser=False`. The decision is made by CVAT's own
      `TaskPermission.create_scope_view(...).check_access()`, `views.py` line 40, not
      by a check written for this endpoint.

- [x] **A filter or grouping beyond the plain count.**
      → Optional `shape_type` query parameter, `views.py` line 46, plus a
      `by_shape_type` breakdown in the response. Exposed in the page as a dropdown.
      `?shape_type=polygon` returns 2378, `?shape_type=mask` returns 23, and an
      unknown value returns `400` with the allowed values listed.

- [x] **MO-1 measured, 5 runs, raw output saved.**
      → `docs/OBJECTIVES.md`. Measured twice, because the endpoint gained a second
      grouped query when the shape type breakdown was added. Second measurement:
      median 38.612 ms, range 36.765 ms to 60.156 ms.

- [x] **MO-1 target met, or missed with the reason written down.**
      → Met. 38.612 ms against a 300 ms ceiling. `OBJECTIVES.md` also records that the
      target was conservative and what the measurement does not show.

## Discipline

- [x] **Plan committed before any code.**
      → First commit on the branch: `04634d46e`, "docs: add plan, objectives and
      definition of done before starting implementation". The first code commit,
      `8e8efb9cd`, comes after it.

- [x] **Work committed in steps, each message saying what changed and why.**
      → Ten commits, oldest first:
      `04634d46e` plan and documents,
      `11b7dc8fe` reduced working window recorded,
      `8e8efb9cd` counting endpoint,
      `7f196a6d5` page and chart,
      `e87997991` task access check,
      `8cc86bc3c` first MO-1 measurement,
      `af2a2bcb1` shape type filter and breakdown,
      `da65160d0` MO-1 re-measured,
      `cff2cf408` filter in the page,
      `434847d6b` decision record.

- [x] **No dead code, no commented-out blocks, no stray files in the diff.**
      → `git diff --stat a81ed252d..HEAD` touches only `docs/`, `cvat/apps/test/`,
      `cvat/settings/base.py` (one line), `cvat/urls.py` (one line) and the two
      `cvat-ui` files. The COCO data, the helper scripts used to build the sample
      subset and the downloaded images were kept outside the repository and are not
      in the diff.

- [x] **Everything I did not finish is listed below.**
      → See the next section.

## Not finished

Declared, not hidden.

- **Item 8, live updates over WebSocket.** Not attempted. Declared in the Plan before
  starting rather than discovered late. CVAT has no annotation-change channel that
  could simply be subscribed to, so this would have meant adding Django Channels, a
  consumer, a Redis layer and a client socket. On the working window I had, a
  half-working socket would have been worse than none.

- **Item 9, recovery after a dropped connection.** Depends on item 8, so also not
  attempted.

- **`LabeledTrack` is not counted.** The endpoint aggregates `LabeledShape` only. A
  task annotated with tracks, which is normal for video, would report counts of zero
  from this endpoint even though it plainly holds annotations. This does not show on
  an image task imported from COCO, which is exactly why it would be easy to ship
  without noticing. The reasoning and the cost are in the decision record in
  `docs/PLAN.md`.

- **MO-1 was measured on a small task.** 2168 annotations is not a scale test.
  Nothing measured here predicts behaviour on a task with hundreds of thousands of
  annotations, and `OBJECTIVES.md` says so rather than implying otherwise.

- **The working window was about five hours, not eight.** Acknowledged at 09:45 with a
  commitment from 15:00. This is recorded in the Plan, along with the compressed
  schedule that followed from it.