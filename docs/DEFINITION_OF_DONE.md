# Definition of Done

Written before the work started. Each line is ticked at the end only with a number,
a file reference or a link beside it. A tick with no evidence counts as unticked.

## The floor, items 1 to 4

- [ ] **Endpoint returns per-class counts for a task, read from the database.**
      Evidence: file and line of the query, plus the response body for the sample task.
      →

- [ ] **Counts verified against a known number.**
      Evidence: the count the endpoint reports for one class, next to the same count
      taken independently from the imported COCO file.
      →

- [ ] **A page in the web interface calls the endpoint.**
      Evidence: file and line of the page, and the route it is reached at.
      →

- [ ] **The counts render as a graph.**
      Evidence: screenshot or the timestamp in the recording where it is shown.
      →

- [ ] **Empty state handled: a task with no annotations shows a clear message, not a blank page or a crash.**
      Evidence: how it was reproduced, and what is shown.
      →

- [ ] **Error state handled: a failed request shows a visible error and the page stays usable.**
      Evidence: how the failure was forced, and what is shown.
      →

## Beyond the floor

- [ ] **Anonymous request to the endpoint is refused.**
      Evidence: status code returned.
      →

- [ ] **A logged-in user with no access to the task is refused.**
      Evidence: status code returned, and how the second user was created.
      →

- [ ] **MO-1 measured, five runs, raw output saved in OBJECTIVES.md.**
      Evidence: median and spread.
      →

- [ ] **MO-1 target met, or missed with the reason written down.**
      →

## Discipline

- [ ] **Plan committed before any code.**
      Evidence: first commit hash on `dev-test01`.
      →

- [ ] **Work committed in steps, each message saying what changed and why.**
      Evidence: `git log --oneline` output.
      →

- [ ] **No dead code, no commented-out blocks, no stray files in the diff.**
      Evidence: `git diff --stat` against the branch point.
      →

- [ ] **Everything I did not finish is listed below.**
      →

## Not finished

Filled in at the end. Declared, not hidden.

-
