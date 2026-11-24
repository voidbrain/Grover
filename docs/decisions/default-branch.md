# Default branch and the old site

Decision record for B-001. Opened 2026-11-24. **Decided 2026-11-24 by the owner: option 1 (rename to `main`) and unpublish the old site.** Both done the same day.

The repository's default branch is `master`; the harness and its tools assume `main` and are configured around it (`defaultBranch` in `.harness.json`). The old GitHub Pages workflow (Angular 18 client) was removed in the rebuild, but the site it published may still be live.

## Options

1. **Rename `master` to `main`** on GitHub (Settings → Branches → rename; GitHub redirects old links and open PRs retarget). Then drop `defaultBranch` from `.harness.json` and the `master` project line in AGENTS. Recommended: every other harnessed project uses `main`.
2. **Keep `master`**: leave `defaultBranch: "master"` and the AGENTS project line as they are.

Separately: **unpublish the old GitHub Pages site** (Settings → Pages → unpublish) or leave it. It talks to the retired PHP endpoint, so it can no longer work.

## Run after choosing option 1 (on your Mac)

```bash
gh api -X POST repos/voidbrain/Grover/branches/master/rename -f new_name=main
git -C ~/Projects/Grover fetch origin && git -C ~/Projects/Grover branch -m master main && git -C ~/Projects/Grover branch -u origin/main main
```

Expected: `gh repo view voidbrain/Grover --json defaultBranchRef` prints `main`.
