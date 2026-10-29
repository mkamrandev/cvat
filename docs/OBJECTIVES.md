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

Raw output, five runs, pasted exactly as printed:

```
(paste here)
```

| Metric | Value |
| --- | --- |
| Run 1 | |
| Run 2 | |
| Run 3 | |
| Run 4 | |
| Run 5 | |
| Median | |
| Spread (min to max) | |
| Target met | YES / NO |

If the target was missed, the reason goes here rather than being quietly adjusted.

FILL IN.
