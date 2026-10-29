# Objectives

One measurable objective, set before the work and measured at the end.

## Environment for every number below

| Item | Value |
| --- | --- |
| CVAT commit SHA | `a81ed252dce15b805d5a544116cf98005e42f257` |
| CPU | AMD EPYC 7763 64-Core Processor, 4 vCPU allocated |
| RAM | 15 GiB |
| OS | Ubuntu 24.04.5 LTS |
| Host | GitHub Codespaces container, local Docker stack |
| Sample data | COCO 2017 val, first 300 images, 2168 annotations across 77 classes |

## MO-1

| Field | Entry |
| --- | --- |
| What is measured | Wall-clock time for one authenticated GET request to the per-class count endpoint for the sample task, from the request leaving curl to the full response body being received. |
| How | `curl -w '%{time_total}\n' -o /dev/null -s -b <session cookie> <endpoint URL>`, run from inside the Codespace against the local stack. One warm-up request first, discarded. Then five runs. |
| Target | Median of 5 runs at or below 300 ms. |
| Conditions | Local Docker stack, the sample task described above, no annotation jobs open in a browser, nothing else running on the machine. |
| Not included | The first request after the container starts. Browser render time. Tasks other than the sample task. |

### Why 300 ms

The sample task holds 2168 annotations, so the aggregate itself is trivial: one grouped
query over that many rows costs a few milliseconds. The budget is therefore dominated by
Django request handling, the permission check against CVAT's policy engine and
serialisation, not by the data.

300 ms is set as a ceiling that a correct implementation clears comfortably while the
realistic failure mode does not. That failure mode here is not slow SQL, it is N+1
queries: fetching the task's labels and then issuing one count per label, or walking
jobs and shapes in Python. On this dataset that means dozens of round trips to Postgres,
which shows up immediately in the median.

Stated plainly: this is a small dataset. A target met at 2168 annotations says nothing
about 2 million, and I have not measured that.

### Result

FILL IN AFTER MEASURING.

### Result

Measured at 11:30 PKT on the environment described above. The login request and a
discarded warm-up request were issued first; the warm-up returned 200 in 0.041651s.

Raw output, five runs, pasted exactly as printed:

run 1 0.037911s
run 2 0.036986s
run 3 0.038422s
run 4 0.038582s
run 5 0.036559s


| Metric | Value |
| --- | --- |
| Run 1 | 37.911 ms |
| Run 2 | 36.986 ms |
| Run 3 | 38.422 ms |
| Run 4 | 38.582 ms |
| Run 5 | 36.559 ms |
| Median | 37.911 ms |
| Spread (min to max) | 36.559 ms to 38.582 ms, a range of 2.0 ms |
| Target met | YES, by a factor of about 8 |

### What this does and does not show

The target was cleared comfortably, which says the endpoint is not doing per-label
work. I had set 300 ms to catch N+1 queries rather than to be difficult, and on
this dataset that is what it catches.

Being honest about it: 300 ms was a conservative ceiling. A median of 38 ms with a
2 ms spread tells me the request cost is dominated by fixed overhead, not by the
data, which is what I expected from 2168 annotations. I would rather report that
plainly than present an easy target as a close result.

The stronger evidence is the SQL itself, which shows one grouped statement rather
than one statement per label:

If the target was missed, the reason goes here rather than being quietly adjusted.

SELECT "engine_label"."name" AS "label__name", COUNT("engine_labeledshape"."id") AS "count" FROM "engine_labeledshape" INNER JOIN "engine_job" ON ("engine_labeledshape"."job_id" = "engine_job"."id") INNER JOIN "engine_segment" ON ("engine_job"."segment_id" = "engine_segment"."id") INNER JOIN "engine_label" ON ("engine_labeledshape"."label_id" = "engine_label"."id") WHERE "engine_segment"."task_id" = 1 GROUP BY 1 ORDER BY 2 DESC


What this does not show: behaviour at scale. I have not measured a task with
hundreds of thousands of annotations, and nothing here predicts it.

FILL IN.
