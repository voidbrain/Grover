# Backlog archive 2026

Closed records, in closing-date order. History, not current status: see the [backlog](../BACKLOG.md).

<!-- archive-recap:start -->
## Weekly closure recaps

Closed records in this archive, grouped by closing date (Monday–Sunday). Links open the first section for that week; current status stays in the active backlog.

| Closing week | Features closed | Bugs closed |
|---|---:|---:|
| [2026-11-23 – 2026-11-29](#archive-week-2026-11-23) | 4 | 14 |
<!-- archive-recap:end -->

<a id="archive-week-2026-11-23"></a>
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

## Closed 2026-11-25

### B-007

**A pump whose switch-on fails is not treated as possibly running**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-25: fix merged in #32 with green PR CI and a green main run after merge (b62a29b).

| | |
|---|---|
| **Issue** | When a driver's `set(true)` throws, `Actuators` settles the run as not started: the pump is neither on nor stuck, and the watchdog never retries switching it off. If the write reached the chip although it reported an error, and the driver's own roll-back also failed (a dead I²C bus), the pump could keep running with no cap. Found in the second review of #29 (F-018) on 2026-11-24. Changing `actuators.ts` needs the owner's approval (AGENTS.md safety rules). |
| **Reproduce** | A driver whose `set(true)` writes the pin, then throws, and whose `set(false)` also throws: after `run()`, `isOn` is false and `stuckPump()` is null. |
| **Check** | With approval: a failed switch-on tries `set(false)`; if that fails too, the pump is marked stuck (no other pump runs, the watchdog retries off). An actuators test shows it, and the existing limits still hold. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Closed 2026-11-25: fix merged in #32 with green PR CI and a green main run after merge (b62a29b). 2026-11-24: step plan adopted (owner decision, `workItems.featurePlans`): B-007-T01, B-007-T02. Found 2026-11-24. The owner approved the change on 2026-11-24 ("ok"). Fixed in #32: the failing actuators test is committed first; `Actuators.turnOn` now switches off again after a failed switch-on and, if that fails too, marks the actuator on and stuck. The other limits are unchanged (the existing actuators tests pass). The owner asked whether the Pi can tell a failure: it sees writes the expander does not acknowledge; reading the output register back and sensing the pump's current are not done. Review of #32 (no blocker), failing tests committed first: switching on a switch marked stuck answered without a write (now a real switch-on that clears the stuck mark); a light window could be lost while its switch was stuck (the schedule now switches a stuck switch on for real); the off after a failed switch-on reported a run time (now none), and the watchdog's fault now says the switch-off had failed rather than "ran past its cap". Closes when #32 merges on green CI.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | [#30](https://github.com/voidbrain/Grover/pull/30) (steps) |
| Opened | 2026-11-24 |
| Verification | 2026-11-25: PR CI green on #32 and the main run after merge (b62a29b) green; owner approved the safety change 2026-11-24 |
| Reviewed | 2026-11-24 |

</details>

---

### B-002

**`check:conventions` does not see the client in this monorepo**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P3 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-25: check:conventions reads apps/client/src since the harness v10.20.0 reconcile (#36: tools/check-conventions.mjs copied, conventions.sourceDirs set); a planted standalone: true in apps/client/src/app/dashboard.ts made it exit 1 on 2026-11-25 and was removed before commit; closes with #36 green CI.

| | |
|---|---|
| **Issue** | `tools/check-conventions.mjs` walks `src/`, `tools/` and `e2e/` under the repository root; Grover's Angular code is under `apps/client/src`, so the convention check passes without checking it. |
| **Reproduce** | `npm run check:conventions` reports no problems even after adding `standalone: true` to a client component. |
| **Check** | The check finds the planted problem in `apps/client/src`. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Closed 2026-11-25: check:conventions reads apps/client/src since the harness v10.20.0 reconcile (#36: tools/check-conventions.mjs copied, conventions.sourceDirs set); a planted standalone: true in apps/client/src/app/dashboard.ts made it exit 1 on 2026-11-25 and was removed before commit; closes with #36 green CI. 2026-11-25: correction: B-002-T02 waits on project-harness:F-098-T01 (released), the step where the setting and the check change land, plus the release that ships it (F-098 is on the template's main, PR #253); not F-098-T03. 2026-11-25: owner decision (B-002-T01 closed): agreed, the template makes the convention check's source folder configurable; recorded in project-harness as F-098 (template PR #253). B-002-T02 waits on project-harness:F-098-T03 (the release) and stays waiting until it, through B-002-T03; on harness v10.10.0 or later that wait can become a real `dependsOn` with `externalMet`. 2026-11-24: step plan adopted (owner decision, `workItems.featurePlans`): B-002-T01, B-002-T02. Depends on project-harness: a configurable source root for `check-conventions` (not yet recorded in the template's backlog). B-002-T01, an owner decision, stands for that dependency, so B-002-T02 waits until the template record exists. Template change (a configurable source root in `.harness.json`); this project then reconciles. Lint covers part of the same rules meanwhile.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | [#30](https://github.com/voidbrain/Grover/pull/30); [#33](https://github.com/voidbrain/Grover/pull/33); [#34](https://github.com/voidbrain/Grover/pull/34); [#36](https://github.com/voidbrain/Grover/pull/36) |
| Opened | 2026-11-24 |
| Verification | Verified 2026-11-25: planted-problem check, check:conventions exit 1 |
| Reviewed | 2026-11-25 |

</details>

---

## Closed 2026-11-26

### F-099

**Reconcile project-harness v10.20.0 → v10.21.4**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P3 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-26: Reconciled to v10.21.4 in #45: copied files from the tag, pull-requests.md refreshed, version bumped; check:freshness reports no harness update, check:fast green; the merge waits for green PR CI.

| | |
|---|---|
| **Issue** | `.harness.json` names v10.20.0 while the template has released up to v10.21.4. Coordinator gap review 2026-11-26, proposal 14 ("Behind the harness"), accepted by the owner. |
| **Reproduce** | `npm run check:freshness` on `main`: it reports the harness template v10.21.4 and the files to update or reconcile. |
| **Check** | `.harness.json` names v10.21.4; `check:freshness` reports no harness update; `check:fast` and CI on the PR pass. |

<details>
<summary>Next action, estimates and evidence</summary>

**Next action / closure evidence:** Closed 2026-11-26: Reconciled to v10.21.4 in #45: copied files from the tag, pull-requests.md refreshed, version bumped; check:freshness reports no harness update, check:fast green; the merge waits for green PR CI. Opened 2026-11-26 from the coordinator gap review (proposal 14, owner accepted all proposals). F-099-T01 does the reconcile in a session of this repository, under APPLY.md.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | Opened in [#43](https://github.com/voidbrain/Grover/pull/43) |
| Opened | 2026-11-26 |
| Verification | check:freshness and check:harness clean 2026-11-26 |
| Reviewed | 2026-11-26 |

</details>

---

### B-014

**User-facing text names backlog IDs: two calibration hints in Setup say "(backlog F-004)"**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P3 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-26: Merged in #66 on green CI (main d57d5c2 green; #66 PR checks green): the user-text-ids test, committed failing first, passes and guards new strings.

| | |
|---|---|
| **Issue** | Reported by the owner through the coordinator, 2026-11-26: "this happened on nerv too many times". Backlog IDs are for the repository, not for the owner. The probe editor's hint (`apps/client/src/app/setup/probe-editor.ts`, "Analog probes report volts until calibration exists (backlog F-004).") and the room's auto-feed hint (`apps/client/src/app/setup/room-setup.html`, "Leave it off until the probes are calibrated (backlog F-004).") showed one. Nothing stopped a new one: 𖣂 nerv guards this with a test (nerv:B-102, `test/user-text-ids.test.ts`). |
| **Reproduce** | Setup → a room → an analog pH or EC probe, and the room's auto-feed switch on: the hints end with "(backlog F-004)". |
| **Check** | No string or template literal in `apps/*/src`, `packages/*/src` or the client's public scripts, and no Angular template, names a backlog ID (F- or B- and three digits) outside comments; a test fails on a new one and shows file and line; the two hints keep their meaning without the ID. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Closed 2026-11-26: Merged in #66 on green CI (main d57d5c2 green; #66 PR checks green): the user-text-ids test, committed failing first, passes and guards new strings. 2026-11-26: opened and fixed. `apps/hub/test/user-text-ids.test.ts` ports nerv:B-102's idea: it parses every TypeScript and JavaScript source with the TypeScript compiler and checks string and template literals (inline Angular templates included; HTML comments ignored), and checks every `.html` template with its comments stripped; code comments may name IDs. Committed failing first: it found exactly the two hints above (the sweep found no others: hub messages, alerts and MCP tool descriptions were already clean). The hints now read "…until they are calibrated." and "…until the probes are calibrated."

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | Test first, then the fix, in one PR; [#66](https://github.com/voidbrain/Grover/pull/66) |
| Opened | 2026-11-26 |
| Verification | 2026-11-26: PR #66 CI green; the test fails on a backlog ID in a user-facing string or template and shows file and line |
| Reviewed | 2026-11-26 |

</details>

---

### B-013

**Two imported old records on the Calvary hub need the owner's word: the placeholder strain '–' and Dos Si Dos 33's dates**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P3 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-26: #68 merged on green CI (importer fix with its failing-first test, B-013-T03); the owner's answer applied on the Calvary hub through its API after a backup and read back over MCP (B-013-T02).

| | |
|---|---|
| **Issue** | Found by the owner's import on the Calvary hub, 2026-11-26 ([F-012](../work/records/F-012.md), F-012-T02). (1) The old dump has a strain named '–' (old id 20), a placeholder; it was imported as a strain with id `item` and name '–', and two old plants use it: legacy-1 and legacy-4 (both started 2021-10-01, bloom 2022-01-30), whose old breeder id 89 is unknown. The import now names such a strain `legacy-strain-20` (F-012-T03), but the hub already holds `item`. (2) Old plant legacy-8, Dos Si Dos 33, has bloom 2022-04-01 before its start 2022-06-04: the old record says so; nothing was invented. Nothing was changed on the hub. |
| **Reproduce** | On the hub, Setup → Plants and strains: the strain '–' and the plants "– (old #1)" and "– (old #4)"; the plant "Dos Si Dos 33 (old #8)" with its dates. Or the MCP tool `grover_plants`. |
| **Check** | The owner's choice for each question is recorded here; if it changes data, a backup of the hub database is taken first and the change is applied and read back (`grover_plants`). |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Closed 2026-11-26: #68 merged on green CI (importer fix with its failing-first test, B-013-T03); the owner's answer applied on the Calvary hub through its API after a backup and read back over MCP (B-013-T02). 2026-11-26, owner's answer (B-013-T01, in chat): 1 → (c) keep plants legacy-1 and legacy-4, rename the strain '–' (id `item`) to "Unknown (old record)" with id `legacy-strain-20`; 2 → leave legacy-8's dates as imported. B-013-T02, same day, on the Calvary hub by an agent over SSH with the owner's OK: backup first (`hub-before-b013-20261126-2214.sqlite`), then through the hub's own API: strain `legacy-strain-20` "Unknown (old record)" created with `item`'s fields, plants legacy-1 and legacy-4 moved to it, `item` deleted (no SQL, hub kept running). Finding (B-013-T03): 20 other strains (Acapulco, Hawaii 93, Mango 2001, KC36, White Gorilla Haze, Dos Si Dos 33 and 14 more) had parent `item`. Not an id collision: in the old dump their lineage is '20', the placeholder, which the old app used for "parents not known" (strains 21–40 were created right after it with lineage 20), so the import turned "unknown" into a fake parent. Fixed in the importer (failing test committed first): a placeholder strain is never a parent, and it is imported as "Unknown (old record)", so importing again after the rename adds nothing (dry run on the legacy-v1 dump: 6/33/16, then 0/0/0). On the hub the same 20 strains were saved with no parents through the API. Read back the same day with MCP `grover_strains` and `grover_plants`: 33 strains, 17 plants, no `item` anywhere; `legacy-strain-20` "Unknown (old record)" with plants legacy-1 and legacy-4; the only parents left are the real ones (Brain Damage, Cheese, Frosted Guava, Lava Cake, Runtz, Northern Lights lines, Skunk #1, Amnesia Haze); legacy-8 unchanged (start 2022-06-04, bloom 2022-04-01). The plant names "– (old #1)" and "– (old #4)" were left as they are (not part of the answer; the owner can rename them in Setup). Assumption, cheap to undo: the importer uses the owner's name for the placeholder too.

2026-11-26: opened from F-012-T03. Questions for the owner, in plain words (B-013-T01):

1. The two old plants #1 and #4 have no strain name in the old records (just a dash). What should they be? (a) leave them as they are; (b) you tell me which strain they were (and the breeder, if you know), I set it and remove the empty '–' strain; (c) keep them but call the strain "Unknown (old record)", and rename its id to `legacy-strain-20`.
2. Old plant #8, Dos Si Dos 33, says it started flowering (2022-04-01) two months before it was started (2022-06-04). Do you remember the right dates? If not, I leave them as the old records say.

Answer in chat, for example: "1b: Northern Lights, Sensi Seeds; 2 leave". You can also fix both yourself in Setup → Plants and strains.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | Opened with the F-012-T03 fixes; [#65](https://github.com/voidbrain/Grover/pull/65); [#68](https://github.com/voidbrain/Grover/pull/68); closed in [#69](https://github.com/voidbrain/Grover/pull/69) |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---

## Closed 2026-11-27

### B-015

**The number fields of a grow calendar phase overlap each other (Setup → Default photoperiod, doses and ranges)**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-27: Closed 2026-11-27: PR #70 merged (failing e2e test, fix); owner visual check B-015-T02 passed on the Calvary hub at 114188b with the client rebuilt, 'grover ok' ~00:05 CET.

| | |
|---|---|
| **Issue** | Owner report 2026-11-26: in the hub client, Setup → the "Default photoperiod" calendar, the dose fields ("selects" in the report: number inputs with spinners) overlap each other. Cause: Grover's own layout, not a 🧱 bricks component (the page uses plain inputs and Grover's `.field` / `.ranges` grid in `apps/client/src/styles.scss` and `calendar-setup.ts`; bricks supplies only tokens here). A grid or flex item keeps `min-width: auto`, so a number input (intrinsic width about 20 characters, and no `width: 100%` unlike text inputs) stayed wider than its 9rem column and spilled into the next one; the same hit Days and Light hours in the 12rem form grid. |
| **Reproduce** | `npm run e2e -- calendar-setup` on a `main` before the fix: `e2e/calendar-setup.spec.ts` finds overlapping input boxes in Phase 1. By hand: [owner check page](../acceptance/b-015-calendar-fields.md). |
| **Check** | No two number inputs of a calendar phase overlap at desktop width (`e2e/calendar-setup.spec.ts`, committed failing first); the owner sees the dose fields and range pairs side by side without overlap, at desktop and phone width, on the hub. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Closed 2026-11-27: Closed 2026-11-27: PR #70 merged (failing e2e test, fix); owner visual check B-015-T02 passed on the Calvary hub at 114188b with the client rebuilt, 'grover ok' ~00:05 CET. 2026-11-26: B-015-T01 done: failing e2e test committed first (6 overlapping pairs on Phase 1), then `.field { min-width: 0 }` and `.field input[type='number'] { width: 100%; min-width: 0 }` in `apps/client/src/styles.scss`; `npm run e2e` passes locally. The e2e suite does not run in CI, so CI does not guard this test. 2026-11-27: B-015-T02 done: after the hub was updated to 114188b and the client rebuilt (`npm run build`), the owner checked the calendar on the Calvary hub at about 00:05 CET and answered "grover ok": no overlapping fields. Hub-side visual check passed (desktop width; phone width not separately reported).

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | [#70](https://github.com/voidbrain/Grover/pull/70) (failing e2e test, fix, owner check page) |
| Opened | 2026-11-26 |
| Verification | Owner visual check on the Calvary hub, 2026-11-27 ("grover ok") |
| Reviewed | 2026-11-26 |

</details>

---

### B-016

**README does not say how to update the hub on a Raspberry Pi: pulling code without `npm run build` keeps serving the old client**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P3 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-27: Closed 2026-11-27: README section added in this docs-only PR; green CI on it is the check.

| | |
|---|---|
| **Issue** | Found 2026-11-27 while updating the Calvary hub: the hub serves the prebuilt client in `apps/client/dist`, so two updates by pulling code without `npm run build` looked applied but kept serving the old screens. README had a deploy section and no update section. |
| **Reproduce** | `grep -n "Updating the hub" README.md` finds nothing on a `main` before the fix. |
| **Check** | README has an "Updating the hub on a Raspberry Pi" section next to "Deploying on a Raspberry Pi": backup, get the code (also by git bundle without DNS), `npm ci` only if the lockfile changed, `npm run build`, restart, check and force-refresh. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Closed 2026-11-27: Closed 2026-11-27: README section added in this docs-only PR; green CI on it is the check. 2026-11-27: B-016-T01 done: the README section is written. A documentation gap, not a rule.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | [#72](https://github.com/voidbrain/Grover/pull/72) (README section; also closes B-015) |
| Opened | 2026-11-27 |
| Verification | Pending |
| Reviewed | 2026-11-27 |

</details>

---

### B-006

**An upgraded agent drops its cached config until the hub answers**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-27: #44 merged at 2eceb42, CI 45769844330 green.

| | |
|---|---|
| **Issue** | `AgentConfig.protocol` must equal `PROTOCOL_VERSION`. After an agent upgrade (each protocol bump: 4 for calibration, 5 for weekdays), the agent fails to parse its own cached `config.json` on start and runs nothing (lights, fans, loops, reads) until the hub reconnects and sends a new config. The agent must keep working without the hub (AGENTS.md). Found in the review of #27 on 2026-11-24. |
| **Reproduce** | Start an agent with a cached config whose `protocol` is one lower and no hub: no schedule runs. |
| **Check** | An agent test: a cached config of the previous protocol is used (its new fields at their defaults) and the agent's schedules run with no hub; a config of a newer or unknown protocol is still refused with a fault. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Closed 2026-11-27: #44 merged at 2eceb42, CI 45769844330 green. 2026-11-26: B-006-T01 implemented: the agent runs a cached config of the previous protocol (`parseCachedConfig`) and refuses a newer, unknown or unreadable one with a `config` fault. Test: `apps/agent/test/agent.test.ts` ("a cached config of the previous protocol runs its schedules with no hub (B-006)" and the two refusal tests), committed failing first; the fix did not edit them. Close on green CI with `npm run work:close`. 2026-11-24: step plan adopted (owner decision, `workItems.featurePlans`): B-006-T01. Found 2026-11-24 in the review of #27. Start with the failing agent test.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | [#30](https://github.com/voidbrain/Grover/pull/30); [#44](https://github.com/voidbrain/Grover/pull/44) |
| Opened | 2026-11-24 |
| Verification | Unit/integration · 2026-11-27 · Test: apps/agent/test/agent.test.ts passed in #44 CI 45769844330 |
| Reviewed | 2026-11-27 |

</details>

---

### B-008

**The feed end-to-end test fails now and then on CI: feed done, mixing tank not emptied**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P1 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-27: #38 merged at 14dfdff, CI 45609993978 green and >28 subsequent CI runs passed e2e.test.ts; independent review clean.

| | |
|---|---|
| **Issue** | `apps/hub/test/e2e.test.ts`, "a feed runs end to end": the feed ends `done`, yet the simulated mixing tank still holds 0.3 L or more (`mixing tank emptied` fails). PR CI run 45487054804 failed on `a790c83`; run 45487113564 passed on `55c7c70`, a docs-only commit on the same code. Earlier failures of the feed tests (runs 45460424727, 45461154747) were on branches still changing. Not known: a race in the test or the simulated drivers, or a feed reported done before the transfer pump emptied the tank (a product defect). Found by the delivery audit of 2026-11-25. |
| **Reproduce** | 10 serial local runs all passed. Under load it fails: 2026-11-25, `node --test apps/hub/test/e2e.test.ts` ten at a time with 12 CPU burners failed 3 to 11 of 30 runs, each ending `done (time allowed used)` with 0.35 to 3.7 L in the mixing tank. Deterministic: `apps/hub/test/fast-rig.test.ts`. |
| **Check** | The cause is named with evidence; if it is the feed logic, a failing test shows it first and the fix makes it pass; the test passes in 30 repeated runs under CPU load (for example `stress` or several runs in parallel) and on the next 10 CI runs. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Closed 2026-11-27: #38 merged at 14dfdff, CI 45609993978 green and >28 subsequent CI runs passed e2e.test.ts; independent review clean. 2026-11-25: cause found, a test-rig race, not feed logic. The e2e rig ran every pump at 1000 times its flow. The simulated pumps deliver for as long as they are really on, and on a busy runner each pump goes off tens of ms late. A feed's water is five 20 ms runs, so about 50 ms of lateness per run added up to 4.7 L to a 2 L batch. The transfer's allowance (1.5 times the batch, one 120 ms slice) could not move that, so the feed ended `done` with the tank full. On the real rig a run lasts seconds and the same lateness is a few mL. Fix in [#38](https://github.com/voidbrain/Grover/pull/38): `apps/hub/test/fast-rig.ts` runs supply pumps at 100 times their flow and transfer pumps at 1000 times. No assertion or timeout changed. 60 of 60 runs passed under the same load. Next: Verified after the next 10 CI runs pass this test.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | Test: `apps/hub/test/fast-rig.test.ts` (fails without the fix: 5.33 L left). [#38](https://github.com/voidbrain/Grover/pull/38) (CI 45609993978 green). Review: independent fresh-context subagent review of #38 (2026-11-27), no findings. CI runs [45487054804](https://github.com/voidbrain/Grover/actions/runs/45487054804) (fail) and [45487113564](https://github.com/voidbrain/Grover/actions/runs/45487113564) (pass, docs-only change); [#37](https://github.com/voidbrain/Grover/pull/37) |
| Opened | 2026-11-25 |
| Verification | Unit/integration · 2026-11-27 · Test: apps/hub/test/fast-rig.test.ts passed in #38 CI 45609993978, 60/60 local CPU-load runs, and >28 consecutive CI runs through #72 (45909002027) |
| Reviewed | 2026-11-27 |

</details>

---

### B-010

**Held threshold alerts read as if the value were still past the threshold, and threshold checks lack float tolerance**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-27: #39 merged at ec23d79, CI 45656882670 green.

| | |
|---|---|
| **Issue** | While a threshold alert is held inside its hysteresis margin (`F-008-T02`), `Alerts` formats the same message as when the reading is past the threshold — for example `Grow tank low (3.4, alert below 3): refill it. Feeds that need it are refused until then.` when `tank-grow` is at `3.4` (`alertBelow: 3`, clear point `3.5`), or `Air temperature at 31.6, above 32.` when `air-temp` is at `31.6` (`alertAbove: 32`, clear point `31.5`). In addition, `r.value < probe.alertBelow` and `r.value > probe.alertAbove` used exact comparisons without floating-point tolerance (`0.7 - 0.4 < 0.3` and `0.1 + 0.2 > 0.3` in IEEE-754). |
| **Reproduce** | Push `2.9` then `3.4` on `tank-grow` (`alertBelow: 3`, margin `0.5`), or push `0.7 - 0.4` on an EC probe with `alertBelow: 0.3` (`apps/hub/test/alerts.test.ts`). |
| **Check** | While held inside the hysteresis margin, the alert message states the current value, the threshold, and that the alert is held until the value passes the clear point (`at least <clear>` for `alertBelow`, `at most <clear>` for `alertAbove`); threshold comparisons use a tolerance (`EPSILON`) so floating-point noise at the threshold neither trips nor misclassifies an alert; failing test committed first in `apps/hub/test/alerts.test.ts` and kept unchanged by the fix. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Closed 2026-11-27: #39 merged at ec23d79, CI 45656882670 green. 2026-11-25: B-010-T01 implemented in [#39](https://github.com/voidbrain/Grover/pull/39): failing tests committed first in `apps/hub/test/alerts.test.ts`, then `apps/hub/src/alerts.ts` updated to compare thresholds with `EPSILON` tolerance, strip IEEE-754 rounding noise from formatted numbers, and state the value, threshold and clear point while held inside the hysteresis margin (`docs/DESIGN.md` updated). Closes after [#39](https://github.com/voidbrain/Grover/pull/39) merges on green CI.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | Test: `apps/hub/test/alerts.test.ts` (`B-010: held threshold alerts state the value, threshold and clear point…`, `B-010: threshold comparisons use a tolerance…`; committed failing first). [#39](https://github.com/voidbrain/Grover/pull/39) |
| Opened | 2026-11-25 |
| Verification | Unit/integration · 2026-11-27 · Test: apps/hub/test/alerts.test.ts passed in #39 CI 45656882670 |
| Reviewed | 2026-11-27 |

</details>

---

### B-011

**Client specs are type-checked; the hysteresis test reads the probe kinds from the contract**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P2 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-27: #50 merged at aeada6c, CI 45801466993 green.

| | |
|---|---|
| **Issue** | Two dormant checks found by the coordinator's sweep, 2026-11-26: `typecheck` ran `apps/client/tsconfig.app.json`, which excludes `*.spec.ts`, so the client specs ran unchecked under Vitest (T5, proposal 9); and "threshold alerts have a positive hysteresis margin for every probe kind" iterated a hand-written list of five kinds, so a new probe kind was not checked (C5, proposal 15). |
| **Reproduce** | On `main` `080194c`: `package.json` `typecheck` has no spec config; `apps/hub/test/alerts.test.ts:29-33` lists the kinds by hand. |
| **Check** | `npm run typecheck` (CI) also runs `tsc -p apps/client/tsconfig.spec.json --noEmit` and passes (no error found when added); the hysteresis test iterates `PROBE_KIND_IDS` from `@grover/contracts` and asserts `ALERT_HYSTERESIS` has exactly those keys. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Closed 2026-11-27: #50 merged at aeada6c, CI 45801466993 green. 2026-11-26: owner accepted every fix of the dormant-checks sweep in chat ("Accept all fixes"). B-011-T01 implemented: spec config added to `typecheck` (10 spec files, no error); the test derives the kinds from the contract (passes; no defect found, the test was weak, not the code). Closes when the PR merges on green CI.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | [#50](https://github.com/voidbrain/Grover/pull/50) |
| Opened | 2026-11-26 |
| Verification | Unit/integration · 2026-11-27 · Test: apps/hub/test/alerts.test.ts and tsc -p apps/client/tsconfig.spec.json passed in #50 CI 45801466993 |
| Reviewed | 2026-11-27 |

</details>

---

### F-010

**Hub data retention and backups**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔵 | ◻️ P3 | Closed | 🟢 Small |

💻 **→ Human action required: No**<br />Closed 2026-11-27: #46 (CI 45783622309) and #47 (CI 45784283819) merged on green CI.

| | |
|---|---|
| **Issue** | Readings every 5 minutes for 5 probes grow the SQLite file on the Pi's SD card without bound, and there is no backup. |
| **Reproduce** | `npm run dev` for a while, then inspect `data/dev/hub.sqlite`. |
| **Check** | Old readings are downsampled (for example hourly after 30 days), a `backup` command writes a consistent copy, and both are tested. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Closed 2026-11-27: #46 (CI 45783622309) and #47 (CI 45784283819) merged on green CI. 2026-11-26: F-010-T02 implemented: `npm run hub -- backup <file>` writes a consistent copy with `VACUUM INTO` and refuses an existing file or a missing database (`apps/hub/src/backup.ts`); `apps/hub/test/backup.test.ts` backs up a running hub, restores the copy and reads its rooms and readings, and runs the command itself; README "Backups" names it. Both steps implemented: close on green CI with `npm run work:close`. 2026-11-26: F-010-T01 implemented: readings older than 30 days keep the first of each clock hour per probe (`Store.downsampleReadings`, `apps/hub/src/retention.ts`), run when the hub starts and hourly; tested in `apps/hub/test/retention.test.ts` (invented readings, including the start-up run); DESIGN.md "Data retention" names the rule. 2026-11-24: step plan adopted (owner decision, `workItems.featurePlans`): F-010-T01, F-010-T02. Use SQLite `VACUUM INTO` for the backup.

**Estimates:** No remaining effort.

| Field | Value |
|---|---|
| PR / evidence | [#30](https://github.com/voidbrain/Grover/pull/30); [#46](https://github.com/voidbrain/Grover/pull/46); [#47](https://github.com/voidbrain/Grover/pull/47) |
| Opened | 2026-11-24 |
| Verification | Unit/integration · 2026-11-27 · apps/hub/test/retention.test.ts (#46 CI 45783622309) and apps/hub/test/backup.test.ts (#47 CI 45784283819) green |
| Reviewed | 2026-11-27 |

</details>

---
