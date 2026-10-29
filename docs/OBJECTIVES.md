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

Measured twice, because the endpoint changed between the two runs.

**First measurement, 11:30 PKT.** The endpoint issued a single grouped query.
A login request and a discarded warm-up came first; the warm-up returned 200 in
0.041651s.

run 1 0.037911s
run 2 0.036986s
run 3 0.038422s
run 4 0.038582s
run 5 0.036559s


Median 37.911 ms, spread 36.559 ms to 38.582 ms, a range of 2.0 ms.

**Second measurement, 11:45 PKT.** Item 7 added a breakdown by shape type, so the
endpoint now issues two grouped queries rather than one. I re-measured rather than
report a number taken from a version of the code that no longer exists.

run 1 0.060156s
run 2 0.038612s
run 3 0.037051s
run 4 0.051611s
run 5 0.036765s


| Metric | Value |
| --- | --- |
| Median | 38.612 ms |
| Spread (min to max) | 36.765 ms to 60.156 ms, a range of 23.4 ms |
| Target (300 ms) | Met |

### What this does and does not show

The target was cleared by roughly a factor of eight. I set 300 ms to catch N+1
queries rather than to be hard to reach, and on this dataset that is what it
catches: an implementation issuing one count per label would not be near this.

Two honest observations rather than one clean claim:

300 ms was a conservative ceiling. A median of 38 ms says the request cost is
dominated by fixed overhead, not by the data, which is what I expected from 2168
annotations. I would rather say that than present an easy target as a close result.

The second measurement is slower in the tail than the first, not in the median.
The median moved by 0.7 ms while the range grew from 2.0 ms to 23.4 ms. One extra
grouped query does not explain a 23 ms outlier on its own; with five runs on a
shared cloud container I cannot separate my change from the machine, and I am not
going to claim I can.

The stronger evidence is the SQL, which is one grouped statement per question
asked, not one per label:

SELECT “engine_label”.”name” AS “label__name”, COUNT(“engine_labeledshape”.”id”) AS “count”
FROM “engine_labeledshape”
INNER JOIN “engine_job” ON (“engine_labeledshape”.”job_id” = “engine_job”.”id”)
INNER JOIN “engine_segment” ON (“engine_job”.”segment_id” = “engine_segment”.”id”)
INNER JOIN “engine_label” ON (“engine_labeledshape”.”label_id” = “engine_label”.”id”)
WHERE “engine_segment”.”task_id” = 1 GROUP BY 1 ORDER BY 2 DESC


What this does not show: behaviour at scale. I have not measured a task with
hundreds of thousands of annotations, and nothing here predicts it.
