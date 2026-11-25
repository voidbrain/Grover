# The v1 Dependabot PRs

Decision record for B-009. Opened 2026-11-25 by the [delivery audit](../audits/2026-11-25-delivery.md). **Waiting on the owner.**

PRs #3, #8, #9, #10, #11, #12, #13 and #14 were opened by Dependabot between 2021 and 2023 for the v1 app. The v2 rebuild removed those files (v1 is kept at the `legacy-v1` tag), so none of them can apply. Each keeps a `dependabot/npm_and_yarn/*` branch. Dependabot security updates stay on for the current code; all 41 alerts are fixed.

## Options

1. **Close the eight PRs and delete their branches** (recommended). Nothing is lost: v1 stays at `legacy-v1`.
2. **Leave them open.** They keep showing in every PR listing.

The agent did not create these PRs, so it closes them only with your approval (AGENTS.md, "Asks first").

## Tell the agent

Paste in a Grover session: `B-009: approved, close the v1 Dependabot PRs and delete their branches` (or `B-009: declined, <reason>`).

Expected after B-009-T02: `gh pr list -R voidbrain/Grover --state open --author app/dependabot` prints nothing.
