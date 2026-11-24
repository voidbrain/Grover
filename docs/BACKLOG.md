# Grover backlog

Current work ledger, reviewed 24 November 2026 against main `a5cf6e3`. [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

## Work items

Bugs (B-) and features (F-) in one list, most urgent first.


### B-004

**A probe read was stored only when the agent's reading event arrived**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

💻 **→ Human action required: No**<br />Let #18's CI run; it closes on green.

| | |
|---|---|
| **Issue** | `POST /api/probes/<id>/read` returned the value, but the hub stored it only when the agent's separate reading event came through the outbox. A feed planned right after a read (the e2e test on CI, 2026-11-24) saw no fresh readings and was refused. |
| **Reproduce** | `apps/hub/test/commands.test.ts`: a fake agent that answers a read and never sends the event; before the fix nothing was stored. |
| **Check** | The test passes: the read is stored and announced when the agent answers, and the agent's later event for the same reading (same time, which the ack now carries) is not stored twice. CI passes on #18. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Found by CI on #18 (run 45460424727). Fixed on `feat/f012-plants`: the agent's ack carries the reading's own time; `Commands.readProbe` and the Feeder's pre-feed readings store and announce the value from the ack. Closes on #18's green CI.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#18](https://github.com/voidbrain/Grover/pull/18) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-011

**Feed cycle per pot: supply tanks, mixing tank, pot pumps**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔺 P1 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Try a feed on the simulated rig and say whether it behaves as your rig should: [run it](../README.md#run-it), then use Preview feed and Feed now on a pot.

| | |
|---|---|
| **Issue** | The owner's rig, confirmed 2026-11-24: per tent (room), lights, fan and air temperature on schedules. Six supply tanks (water, grow, micro, bloom, ripen, pH down), each with a level sensor and a pump into one mixing tank (with its own level). Per pot: a transfer pump from the mixing tank, a recirculation pump (closed loop), a level sensor, and pH/EC probes (to start, one pair may serve all pots). A feed mixes one pot's dose (by phase, adjusted by that pot's EC and pH) in the mixing tank and moves it to the pot. Before running: supply tanks must have enough, the mixing tank must be empty, the pot must be able to take the batch. Low tanks are notified. Ripen is used alone at the end, then a plain-water flush phase. Grover today doses into one reservoir and has no feed cycle. |
| **Reproduce** | `npm run dev`: there is no way to feed a pot; the dose suggestion corrects a single reservoir. |
| **Check** | A feed for a pot runs end to end on the simulated rig (water, nutrients, pH down into the mixing tank, settle, transfer until the mixing tank is empty or the pot is full); it is refused with a reason (and an alert) when a supply tank is low, the mixing tank is not empty or the pot cannot take the batch; a low pot level or out-of-range pot EC/pH starts one automatically when the tent's auto-feed is on; the agent aborts and switches everything off on stop, mode change or a failed check; tests cover the planner, the agent run and the hub-agent join. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Built 2026-11-24 on `feat/f011-feed-cycle` (stacked on #16). Contracts: tank roles on level probes, alert thresholds, pot volumes, tent feed and tap-water settings, `planFeed` (owner's rule, 2026-11-24: nutrients to reach the target EC after dilution, then pH down for the pH they cause; water by level and EC, in portions between additives) and `feedReason`, a dosing model that separates dilution, nutrient pH rise and pH down, protocol v2 with the `feed` command and event; the default calendar now has ripen alone and a Flush phase. Hub: `Feeder` (plan, start, one per tent, auto-feed with cooldown, learning from feeds) replaces the single-reservoir `Control`; `Alerts` (thresholds, feeds, agents); migration 2. Agent: `FeedRunner`; the mock driver simulates the whole rig. Client: dashboard per tent with alerts, tanks and pot cards (readings, last feed, preview, Feed now); setup fields for tank roles, alerts, pot volumes and feed settings. Checks: 46 backend tests (16 contracts incl. 7 planner cases and a model-recovery case, 6 agent feed runs on the simulated rig, e2e feed end to end, low-tank abort with alerts, auto-feed and cooldown, one feed per tent), 13 client tests, typecheck, lint, build; dev stack smoke on 2026-11-24: preview, feed started, a second feed refused, Stop all aborted the running feed. Not done: pages seen in a browser, anything on the real rig (F-003). Closes when CI passes and the owner has tried it.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#17](https://github.com/voidbrain/Grover/pull/17) (stacked on #16) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-012

**Plants and strains: origin, generation, breeder, ancestry**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Import your old records and check your plants: [import step](../README.md#deploying-on-a-raspberry-pi) (step 5), then Setup → Plants and strains.

| | |
|---|---|
| **Issue** | The rebuild dropped the plant records of the old Grover (tables `grover_plants`, `grover_strains`, `grover_companies` at tag `legacy-v1`). The owner needs each plant's origin: strain, breeder, generation (0 from seed, 1 first cutting, 2 cutting of a cutting…) and the plant it was cut from, which pot it is in, its dates; and each strain's breeder, ancestry (parent strains), indica/sativa split, THC (and CBD) when known. Example from the owner, 2026-11-24: Northern Lights #5 x Haze, generation 2, in pot 3; legacy: Sensi Seeds, parents Northern Lights #5 and Haze, 50 % sativa. |
| **Reproduce** | `git show legacy-v1:Documentation/MYSQL-DB/Sql_backup_2024_07_25.sql`, tables above; the new hub has no plants. |
| **Check** | Breeders, strains (parents, sativa %, THC/CBD %, flowering days, notes) and plants (strain, breeder, generation, mother plant, pot, dates, yield, notes) can be added and edited in Setup; a pot card shows its plant; the legacy strains, breeders and plants import once (`npm run hub -- import-legacy`) without guessing pots; NERV can read them (MCP); tests cover the schemas, the import and the API. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Requested 2026-11-24; built the same day on `feat/f012-plants`. Breeders, strains (parents, sativa %, THC/CBD, flowering, autoflower, notes with sources) and plants (strain, breeder, generation, mother, pot, medium, dates, yield) in contracts, migration 4, store, API, MCP (`grover_plants`) and the client (Plants and strains page; the pot card names its plant). Importer: dry run on the real dump 2026-11-24 gave 6 breeders, 33 strains, 16 plants; Northern Lights #5 x Haze with parents Northern Lights #5 and Haze, its seed plant (Sensi Seeds, 2021-11-05 → 2022-04-01) as generation 0; no pots (old ids do not map). Strain figures checked online the same day: Sensi Seeds lists 70 % sativa / 30 % indica and 65-75 days flowering (the old record says 50 %); Sensi publishes no THC, retailers say about 20 % (Zamnesia, Cannapot; Leafly 19 %). The demo seed carries this example in pot 3 (generation 2, its mother, the seed plant). Checks: 11 new backend tests (plants, legacy incl. truncated dumps and id collisions, API incl. unknown references and ancestry loops), 2 client tests, build, lint; dev smoke of the page, snapshot and MCP tool. An independent review of #18 found nothing blocking; its seven minor points were fixed the same day (parser bounds, dumps without column lists, id collisions, a doc contradiction, 400 for unknown references, the import message, the mother list on strain change). Remaining: the owner imports the real records and enters the generation-2 plant in pot 3 on the deployed hub.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#18](https://github.com/voidbrain/Grover/pull/18) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---




### F-003

**Hardware bring-up on the Raspberry Pi**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔺 P1 | Open | 🟡 Medium |

🧑 **→ Human action required: Procedure**<br />Run the [hardware bring-up](guides/hardware-bring-up.md) on the Pi and report the results.

| | |
|---|---|
| **Issue** | The real drivers (DS18B20, ADS1115, GPIO through `pinctrl`, MCP23017) have never run on a device; pump flows (`mlPerSecond`) and caps (`maxRunMs`) are unknown; the water-level sensor of the old build (two-pin, HC-SR04 style) cannot be timed from Node. |
| **Reproduce** | [Hardware bring-up](guides/hardware-bring-up.md), steps 1 to 6, on the Pi. |
| **Check** | Every probe reads a plausible value, every relay switches, each pump delivers its calibrated volume ± 10 %, and stopping the agent or the hub stops a running pump as described in step 6. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Needs the Pi and the wired rig. Driver fixes found here get their own B- records with a failing test where one can be written (mock the bus). Choose an analog or I²C level sensor to replace the HC-SR04.

**Estimates:** Medium remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-004

**Calibrate analog probes (volts to pH and EC)**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔺 P1 | Open | 🟡 Medium |

💻 **→ Human action required: No**<br />Add two-point pH and one-point EC calibration with temperature compensation to the probe binding.

| | |
|---|---|
| **Issue** | The `ads1115` driver returns volts, and the hub treats them as pH or EC: dosing on a real rig would be wrong until calibration exists. |
| **Reproduce** | Bind a pH probe with `ads1115` and read it: the value is a voltage (about 1.5–2.5), not a pH. |
| **Check** | A calibrated probe reports pH within ± 0.1 of buffer solutions 4 and 7 and EC within ± 0.1 mS/cm of the calibration solution, compensated to 25 °C with the water temperature probe; calibration can be set from the API and is covered by unit tests. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Design in contracts (calibration in the binding, conversion as pure functions with tests), apply on the agent so readings are already in units. Until then, keep auto-feed off on a real rig.

**Estimates:** Medium remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-005

**Deploy hub and agent on the Pi behind Tailscale**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔶 P2 | Open | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Follow [Deploying on a Raspberry Pi](../README.md#deploying-on-a-raspberry-pi) and report what differed.

| | |
|---|---|
| **Issue** | systemd units and deploy steps exist (`deploy/`, README) but have not been run on a Pi. |
| **Reproduce** | README, "Deploying on a Raspberry Pi", steps 1 to 6. |
| **Check** | Both services start at boot; `https://<pi>.<tailnet>.ts.net` opens the dashboard from a phone on the tailnet and not from outside it; NERV lists the Grover tools at `/mcp`. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Fix the README and units with whatever the first install shows.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-006

**Set-up screens in the client**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Try the Setup pages on the dev stack and report what feels wrong: [run it](../README.md#run-it), then open http://127.0.0.1:8080/setup.

| | |
|---|---|
| **Issue** | Everything except daily operation is set up through the HTTP API with curl; the client has no way to add or edit a room, probe, actuator, schedule or calendar. |
| **Reproduce** | Open the dashboard: there is no edit or add control. |
| **Check** | Each entity can be created, edited and deleted from the client with validation messages from the contracts schemas; the owner has tried a full set-up in a browser. (A browser test is F-009.) |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Built 2026-11-24 on `feat/f006-setup-screens` (stacked on #15): Setup overview (rooms, calendars, agent registration with a one-time token, rotate, remove), room page (room form, pots, probes, actuators, schedules with inline editors), calendar editor (phases, doses, ranges). Signal Forms with field messages, contracts schemas checked before sending. Hub: deleting a probe or actuator deletes its schedules; 409 for a calendar in use or an agent already running a room; token rotation drops the agent's connection; `DELETE /api/agents/<id>`. Checks: 5 hub tests (`apps/hub/test/setup.test.ts`), 8 client tests (draft round-trips for every binding and rule, the probe editor's PUT body and its refusal without a name), build, lint, and the dev stack served `/setup`, `/setup/rooms/grow-1`, `/setup/calendars/default`. Not done: looking at the pages in a browser (no browser here) and a browser test (F-009). Closes when CI passes and the owner has tried it.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#16](https://github.com/voidbrain/Grover/pull/16) (stacked on #15) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-007

**Follow the grow calendar: light hours and phase changes**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔶 P2 | Open | 🟡 Medium |

💻 **→ Human action required: No**<br />Derive the light window from the active phase and apply it when the phase changes.

| | |
|---|---|
| **Issue** | Each phase has `lightHours` (18 in veg, 12 in bloom), but the light schedule is a fixed window: moving into bloom needs a manual schedule change. |
| **Reproduce** | Seed the demo tent (`npm run dev`) and move `calendarStart` back past day 42: the phase reads "Early bloom" but the light window stays 06:00–00:00. |
| **Check** | On the day the phase changes, the agent receives a light window of the new phase's hours without a manual edit, and a test covers the switch. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Hub-side: a daily phase check that rewrites the room's light schedule (marked as calendar-owned) and republishes the config.

**Estimates:** Medium remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-008

**Alerts for NERV: out-of-range values, offline agent, faults**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔶 P2 | Open | 🟡 Medium |

💻 **→ Human action required: No**<br />Deliver Grover alerts through NERV (NERV's pack, its own backlog); add hysteresis if readings flap at a threshold.

| | |
|---|---|
| **Issue** | Nothing tells the owner when pH, EC, temperature or level leave the phase range, when an agent goes offline or a driver faults; NERV can only poll `grover_overview`. |
| **Reproduce** | Stop the agent or push a reading outside the range: nothing is raised. |
| **Check** | The hub raises and clears alerts with hysteresis, lists them in the client and through an MCP tool, and NERV can deliver them (its own pack, recorded in NERV's backlog). |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Grover side built with F-011 on 2026-11-24: alerts for probe thresholds (low supply tanks say "refill"), stopped or refused automatic feeds and offline agents, on the dashboard, at `GET /api/alerts` and through `grover_alerts`. Out-of-range pot values start feeds rather than alerts. Remaining: delivery in NERV (recorded in NERV's backlog, not here) and hysteresis at thresholds.

**Estimates:** Medium remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#17](https://github.com/voidbrain/Grover/pull/17) (stacked on #16) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-009

**Browser tests and accessibility checks for the client**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔹 P3 | Open | 🟡 Medium |

💻 **→ Human action required: No**<br />Add Playwright with an axe check against the dev stack, and client coverage.

| | |
|---|---|
| **Issue** | The client has unit tests only; no browser test exercises the dashboard against a running hub, and the AXE requirement in the Angular rules is unchecked. |
| **Reproduce** | `npm run test:client` runs Vitest only; CI has no browser job. |
| **Check** | A Playwright suite starts `npm run dev`, checks the dashboard renders the demo room, runs a pump and switches the mode, and passes an axe scan; CI runs it. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** The template's e2e CI job was left out until this exists.

**Estimates:** Medium remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### B-002

**`check:conventions` does not see the client in this monorepo**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔹 P3 | Open | 🟢 Small |

💻 **→ Human action required: No**<br />Report to the harness template and adopt the fix once released.

| | |
|---|---|
| **Issue** | `tools/check-conventions.mjs` walks `src/`, `tools/` and `e2e/` under the repository root; Grover's Angular code is under `apps/client/src`, so the convention check passes without checking it. |
| **Reproduce** | `npm run check:conventions` reports no problems even after adding `standalone: true` to a client component. |
| **Check** | The check finds the planted problem in `apps/client/src`. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Template change (a configurable source root in `.harness.json`); this project then reconciles. Lint covers part of the same rules meanwhile.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-010

**Hub data retention and backups**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔹 P3 | Open | 🟢 Small |

💻 **→ Human action required: No**<br />Add retention for raw readings and a backup command for the hub database.

| | |
|---|---|
| **Issue** | Readings every 5 minutes for 5 probes grow the SQLite file on the Pi's SD card without bound, and there is no backup. |
| **Reproduce** | `npm run dev` for a while, then inspect `data/dev/hub.sqlite`. |
| **Check** | Old readings are downsampled (for example hourly after 30 days), a `backup` command writes a consistent copy, and both are tested. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Use SQLite `VACUUM INTO` for the backup.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

## Other changes

## How to use this file

| Status | Requirements | Next statuses and conditions | Priority cue |
|---|---|---|---|
| **🔴 Open** | Reproducible bug or agreed capability; scope and next action recorded. | - **Investigate** if cause/scope is uncertain<br>- **Implemented** when code is complete<br>- **Blocked** if a named dependency prevents progress<br>- **Closed** if cancelled/superseded, with reason. | Coloured |
| **🟠 Investigate** | Report and unanswered question recorded; next diagnostic identified. | - **Open** when scope/cause is established<br>- **Implemented** when fixed<br>- **Blocked** if evidence/dependency is unavailable<br>- **Closed** if duplicate/not reproducible after documented investigation, with reason. | Coloured |
| **🟡 Implemented** | Code exists; required verification remains pending. | - **Verified** when all acceptance checks pass (automated ones: the merged PR's green CI run)<br>- Open or Investigate if a check fails<br>- **Blocked** if a required check cannot proceed. | Coloured |
| **🟢 Verified** | All acceptance checks passed; date, method and evidence recorded, including human/device checks when required. | - **Closed** when no action remains and resolution is recorded<br>- **Open** or **Investigate** if new evidence invalidates verification. Do not leave completed items here indefinitely. | Coloured |
| **🟣 Blocked** | Specific blocker, affected work/check and resume condition recorded. | - Return to **Open**, **Investigate** or **Implemented** when unblocked<br>- **Verified** only after all checks pass<br>- **Closed** if cancelled/superseded, with reason. | Grey ◻️ |
| **🔵 Closed** | Resolution recorded and item archived. | - **Open** or **Investigate** if reopened by new evidence<br>Retain ID, original Opened date and historical closure record. | Grey ◻️ |

Follow [Backlog rules](BACKLOG-RULES.md) for updating records, reconciling PR/CI evidence, stale-state review, closure/archiving, human dependencies and table validation. Preserve stable IDs and existing user edits.

Each item shows its ID and title, a summary table (status with its colour, priority, effort size; with source-owned records also remaining time, Depends on, Unlocks and Procedures and Decisions, 🧑 where the record or one of its ready steps waits on that kind of human action), the human or next action, and Issue / Reproduce / Check. Expand the closed details for next actions, estimate rationale, PR history, dates and verification. Effort, from the remaining agent hours (owner time apart): 🟢 Small ≤1 h · 🟡 Medium ≤4 h · 🔴 Large ≤8 h · 🟣 Very large more; work still estimated in days: 🟢 Small ≤1 day · 🟡 Medium 2–3 days · 🔴 Large ≥4 days. Status and verification evidence describe progress; effort is an estimate of work still required. A `---` line ends every item.
