# Plan

Annotation Analytics — per-class annotation counts in CVAT.
Author: Muhammad Kamran

## Environment

| Item | Value |
| --- | --- |
| CVAT commit SHA | `a81ed252dce15b805d5a544116cf98005e42f257` |
| Branch | `dev-test01` |
| Machine | GitHub Codespaces, 4 vCPU, 15 GiB RAM |
| CPU model | AMD EPYC 7763 64-Core Processor, 4 vCPU allocated |
| OS | Ubuntu 24.04.5 LTS |
| Stack | `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build` |
| Sample data | COCO 2017 validation set, first 300 images, 2168 annotations across 77 classes, imported as COCO 1.0 |

## What I am building

CVAT stores annotations but does not report how many exist per label. I am adding
a read-only endpoint that returns those counts for a task, and a page in the web
interface that renders them as a chart.

## Order of work and time budget

Total budget 8 hours. Setup (image build, dataset import) was completed before the
clock started and is not included below.

| Time | Work |
| --- | --- |
| 0:00 – 0:20 | Commit these three documents before any code. |
| 0:20 – 1:20 | Orientation. Find where CVAT stores a drawn shape and its label, and how a task reaches those rows. Record file and line references as I go, for the recording. |
| 1:20 – 3:20 | Item 1. New Django app `test`. Endpoint returning per-class counts for a task, read from the database with a grouped query rather than in Python. |
| 3:20 – 4:50 | Items 2 and 3. A page in the UI that calls the endpoint and renders the counts as a bar chart. |
| 4:50 – 5:30 | Item 4. Empty state when the task has no annotations, and a visible error state when the request fails. |
| 5:30 – 6:15 | Item 5. Reuse CVAT's existing authentication and task permissions. Demonstrate a rejected anonymous request and a rejected unauthorised user. |
| 6:15 – 7:00 | Item 6. Measure the objective in OBJECTIVES.md, five runs, raw output saved. |
| 7:00 – 7:30 | Tick DEFINITION_OF_DONE.md with evidence. Write down everything not reached. |
| 7:30 – 8:00 | Record the Loom, open the pull request into `main` on my own fork, reply. |

## Decided before starting: what I am not attempting

I am declaring these now rather than discovering them at hour seven.

- **Item 8, live updates over WebSocket.** CVAT's existing event channels would need
  study I cannot fund out of this budget, and a half-working socket is worse than none.
- **Item 9, recovery after a dropped connection.** Depends on item 8.
- **Item 7, a filter or grouping beyond the plain count.** Attempted only if items 1 to 6
  are finished and verified with time left.
- **Item 10, the decision record.** Written below only if I reach it.

Items 1 to 4 are the floor. I will not start anything further until those four work and
are ticked with evidence.

## Deviations from this plan

Recorded here as they happen, with the reason.

- (none yet)

## Decision record

Filled in only if item 10 is reached.

- Approach taken:
- Approach rejected:
- What rejecting it cost:
