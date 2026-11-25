# Reconciliation log — 2026

Entries moved from the "Other changes" section of the [active backlog](../BACKLOG.md), newest first. Dated evidence, not current status.

## 2026-11-25

**Reconciliation, 2026-11-25 (main `b62a29b`).** PRs #30, #31 and #32 merged with green PR CI and green main runs after merge: B-007 closed (#32); F-019 stays Implemented until the owner installs the app. B-002-T01 closed on the owner's decision; B-002-T02 waits on project-harness:F-098-T01 (released).

## 2026-11-24

**Reconciliation and step plans, 2026-11-24 (main `8e5da72`).** PRs #18–#22 and #25–#29 merged with green PR CI (main ran green after each merge except #18, whose e2e read test raced scheduled reads until #19 fixed it): B-004 and B-005 closed; the F- records they carry stay Implemented until the owner tries them; B-006 (from #27) F-017 (from #28), F-018 and B-007 (from #29) moved to their sources. Records moved to source files (`docs/work/records`), and every active record now has its steps in `docs/work/tasks` (owner decision 2026-11-24: `workItems.featurePlans`). Review: independent fresh-context review of #30 by the coordinator, 2026-11-24: no blocker; 3 should-fix (external dependencies shown as ready, unverified green-after-merge claims, F-006 PR number checked: #16 is correct) and 4 minor wording points, all fixed in #30; the NERV waits point at nerv:F-122-T02 and nerv:F-123-T02 (NERV PR #730, owner-approved).
