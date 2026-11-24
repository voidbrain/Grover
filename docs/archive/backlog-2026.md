# Backlog archive 2026

Closed records, in closing-date order. History, not current status: see the [backlog](../BACKLOG.md).

## Closed 2026-11-24

### F-001

**Rebuild v2: contracts, hub, agent and client**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P1 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-24: nothing left to do.

| | |
|---|---|
| **Issue** | Grover rebuilt from scratch on Node 24 and Angular 22: shared contracts, a hub (SQLite, MQTT broker, HTTP, MCP, dosing) and an agent (drivers, safety, outbox) replace the PHP server and the old device app; the old code is at the `legacy-v1` tag. |
| **Reproduce** | `npm install && npm test && npm run test:client && npm run build`, then `npm run dev` and open http://127.0.0.1:8080 (see [README](../README.md), "Run it"). |
| **Check** | Backend suites (contracts, agent safety, hub+agent end to end over MQTT, MCP) and client tests pass in CI on the PR; the dev stack serves the dashboard and answers reads and pump runs. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Local on 2026-11-24: 25 backend tests and 3 client tests pass, typecheck, lint and build pass, `npm run dev` answered health, probe read, pump run, dose suggestion and served the client. Closes on the merged PR's green CI. Device checks are F-003, deployment F-005. Closed 2026-11-24: #15 merged to main and CI on main passed (runs for dd8ec87, 1f80ff5, a5cf6e3).

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#15](https://github.com/voidbrain/Grover/pull/15) |
| Opened | 2026-11-24 |
| Verification | CI green on main after merge, 2026-11-24 |
| Reviewed | 2026-11-24 |

</details>

---

### F-002

**Adopt the project harness (v10.9.0)**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-24: nothing left to do.

| | |
|---|---|
| **Issue** | Grover adopts the project harness: AGENTS, area notes, backlog and rules, style guide, design doc, copied tools, lint and format, CI. |
| **Reproduce** | `npm run check:freshness`, `npm run check:backlog`, `npm run check:rules`, `npm run check:tooling`, `npm run lint`, `npm run format:check`. |
| **Check** | All of them pass in the PR's CI; `check:freshness` ends with the harness on template v10.9.0. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Applied 2026-11-24 from template tag v10.9.0. Optional parts not adopted: parallel work, work items, scoped verification, work usage, solution profile, push guard. Maintenance enforcement is on as the template default. Closes on the merged PR's green CI. Closed 2026-11-24: #15 merged to main and CI on main passed (runs for dd8ec87, 1f80ff5, a5cf6e3).

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#15](https://github.com/voidbrain/Grover/pull/15) |
| Opened | 2026-11-24 |
| Verification | CI green on main after merge, 2026-11-24 |
| Reviewed | 2026-11-24 |

</details>

---

### B-001

**Default branch is `master`; the old GitHub Pages site may still be live**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-24: nothing left to do.

| | |
|---|---|
| **Issue** | The harness assumes `main`; Grover uses `master` (configured through `defaultBranch`). The removed Pages workflow published a client that talks to the retired PHP endpoint. |
| **Reproduce** | Read [the decision record](decisions/default-branch.md); `gh repo view voidbrain/Grover --json defaultBranchRef`; check Settings → Pages. |
| **Check** | One option chosen; with a rename, `defaultBranch` and the AGENTS project line are removed and CI triggers on `main`. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Owner chose on 2026-11-24: rename to `main` and unpublish the old site. Done the same day with `gh`: `gh repo view voidbrain/Grover --json defaultBranchRef` prints `main`, open PRs #3–#14 retargeted to `main`, `gh api repos/voidbrain/Grover/pages` returns 404. In the rebuild change: `defaultBranch` removed from `.harness.json`, the AGENTS `master` project line removed, CI triggers on `main`. Closes when that PR's CI passes on `main`. Closed 2026-11-24: #15 merged to main and CI on main passed (runs for dd8ec87, 1f80ff5, a5cf6e3).

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#15](https://github.com/voidbrain/Grover/pull/15) |
| Opened | 2026-11-24 |
| Verification | Repository settings checked with `gh` 2026-11-24; CI green on main after merge |
| Reviewed | 2026-11-24 |

</details>

---

### B-003

**Safety and robustness findings from the review of #15 to #17**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P1 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-24: nothing left to do.

| | |
|---|---|
| **Issue** | An independent review on 2026-11-24 found: queued pump runs starting after Stop all, mode change or shutdown; a stop lost while a relay was switching on; a feed starting its next pump after Stop all; pumps with `maxRunMs` 0 running uncapped; MCP23017 active-low relays switched on at init and shutdown; a feed left "running" after an agent power cut, a race between two feeds, manual pump runs mid-feed, a switch-off failure not retried, no Host/Origin check on the HTTP API, a deleted pot's probes becoming the tent's shared pair, migration 2 carrying auto-dose into auto-feed, negative pot levels, and a feed left unknown after a command timeout. A re-review of the fixes found: finished feeds recorded as aborted (status overtaking queued events, network drops, hub restarts), an aborted feed switching off lights for hours, a tent reservation leaking on a planning error, old uncapped pump rows breaking the hub, scheduled pump runs entering a feed, a stuck relay freezing the pump queue, IPv6 allowed hosts, and a cancelled feed reporting into a closed outbox at shutdown. |
| **Reproduce** | The tests named in the Check row fail on the code before the fix (four of the safety bugs were reproduced by the reviewer with scripts). |
| **Check** | `actuators.test.ts` (stop drops queued runs; stop while switching on; no cap no run; failed switch-off retried), `feed.test.ts` (Stop all during a re-check), `hardware.test.ts` (MCP23017 off levels), `feeder.test.ts` (race, agent offline, timeout, hub restart), `setup.test.ts` (pot delete cascade, Host/Origin/JSON guard, migration resets auto-feed), `e2e.test.ts` (no manual pumps during a feed; Stop all aborts it), `contracts.test.ts` (pump cap in the schema, negative level), `agent.test.ts` (scheduled pumps wait during a feed; failed window switch retried), and the re-review cases in `feeder.test.ts`, `feed.test.ts`, `actuators.test.ts` and `setup.test.ts` (migration 3) all pass. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Each finding started with a failing test, then the fix, on `feat/f011-feed-cycle` (2026-11-24). One test's expectation changed on purpose: "stop releases the queue so later runs still happen" became "stop drops queued runs" (Stop all is an emergency stop). The review found no issue in MQTT auth/ACL, token hashing or the SQL built from strings. The re-review (same day) confirmed the 15 findings fixed or partly fixed and found the second round listed in Issue, fixed the same way. Closes on #17's green CI after merge. Closed 2026-11-24: #17 merged to main and CI on main passed (runs for dd8ec87, 1f80ff5, a5cf6e3).

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#17](https://github.com/voidbrain/Grover/pull/17) |
| Opened | 2026-11-24 |
| Verification | CI green on main after merge, 2026-11-24 |
| Reviewed | 2026-11-24 |

</details>

---

### B-004

**A probe read was stored only when the agent's reading event arrived**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-24: fix merged in #18 with green PR CI; main green since bc36108 (#19).

| | |
|---|---|
| **Issue** | `POST /api/probes/<id>/read` returned the value, but the hub stored it only when the agent's separate reading event came through the outbox. A feed planned right after a read (the e2e test on CI, 2026-11-24) saw no fresh readings and was refused. |
| **Reproduce** | `apps/hub/test/commands.test.ts`: a fake agent that answers a read and never sends the event; before the fix nothing was stored. |
| **Check** | The test passes: the read is stored and announced when the agent answers, and the agent's later event for the same reading (same time, which the ack now carries) is not stored twice. CI passes on #18. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Closed 2026-11-24: fix merged in #18 with green PR CI; main green since bc36108 (#19). Found by CI on #18 (run 45460424727). Fixed on `feat/f012-plants`: the agent's ack carries the reading's own time; `Commands.readProbe` and the Feeder's pre-feed readings store and announce the value from the ack. Closes on #18's green CI.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | [#18](https://github.com/voidbrain/Grover/pull/18) |
| Opened | 2026-11-24 |
| Verification | 2026-11-24: PR CI green on #18; the first main run after merge (448a499) failed in this record's e2e read test, which assumed the newest reading was the manual one while scheduled reads add others; #19 (789002c) made the test look for the read value; main green since bc36108. |
| Reviewed | 2026-11-24 |

</details>

---

### B-005

**Run on a pump queued another run on each click while it ran**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P1 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-24: fix merged in #22 with green PR CI and a green main run after merge (7ca3266).

| | |
|---|---|
| **Issue** | Reported by the owner on 2026-11-24: Run (Pumps, by hand) stayed enabled while the pump ran, because its request ends as soon as the Pi queues the run. Each extra click queued another run, so a pump could run several times in a row; NERV or a second browser could do the same. |
| **Reproduce** | `apps/agent/test/actuators.test.ts`, "a pump that is running or waiting cannot be queued again": before the fix the second run was accepted. On the dashboard: click Run twice. |
| **Check** | The agent refuses a run for a pump that is waiting or running ("already running / waiting"); the dashboard keeps Run disabled, showing "waiting" then "running", from the click until the Pi reports the pump off (or its cap plus a minute, if that report is lost); the test passes. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Closed 2026-11-24: fix merged in #22 with green PR CI and a green main run after merge (7ca3266). Fixed 2026-11-24 on `fix/b005-run-once`: `Actuators` tracks a busy state per pump (waiting / running) and refuses another run until the first settles; the client tracks pending runs until the "off" actuation. Other buttons checked: Feed now is disabled while a feed runs, switches and plant actions are disabled while their request is in flight and act once. Closes on the PR's green CI.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | [#22](https://github.com/voidbrain/Grover/pull/22) |
| Opened | 2026-11-24 |
| Verification | 2026-11-24: PR CI green on #22 and the main run after merge (7ca3266) green. |
| Reviewed | 2026-11-24 |

</details>

---
