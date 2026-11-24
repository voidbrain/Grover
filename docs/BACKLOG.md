# Grover backlog

Current work ledger, reviewed 24 November 2026 against main `a5cf6e3`. [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

## Work items

Bugs (B-) and features (F-) in one list, most urgent first.


### F-013

**Plant cycle: nursery, cuttings, harvest, a plant per pot, phase per plant**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Try the cycle on the dev stack: [run it](../README.md#run-it), then on pot 3 Take cuttings, Harvest, and Place in pot.

| | |
|---|---|
| **Issue** | The owner's cycle (2026-11-24): every plant (g0 from seed, or a cutting) starts elsewhere, not connected to the agent, then is placed in a free pot of the tent. When a plant in the tent is about to flower, cuttings are taken: they become the next generation, rooted elsewhere; when a plant in the tent is harvested, one of them takes its pot. A mother and its cuttings are never in the tent together. Pots can be staggered, so each pot's feed must follow its own plant's age and bloom date, not one tent calendar. Generations are finite: warn above 5. Today: no "take cuttings", "harvest" or "place in pot" actions, two growing plants can share a pot, and every pot is fed by the tent's calendar. |
| **Reproduce** | `npm run dev`: recording cuttings or a harvest means editing plants one by one; feeding pot 3 uses the tent's day count whatever its plant's age. |
| **Check** | Take cuttings creates N plants (next generation, that plant as mother, same strain and breeder, no pot, started today) and warns above generation 5; Harvest records the date (and yield) and frees the pot; Place in pot puts a nursery plant into a free pot and is refused for an occupied pot; a pot holds at most one growing plant; each pot's phase (and so its feed and target ranges) comes from its plant's start, bloom and flush dates, the tent calendar only when the pot has no growing plant or its plant has no (or a future) start date; the nursery is listed with age; tests cover the phase rule, the actions and the per-pot feed. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Requested 2026-11-24, built the same day on `feat/f013-plant-cycle`: `phaseForPlant` (contracts), `PlantCycle` (take cuttings, harvest, place) with HTTP and MCP, one growing plant per pot, the Feeder feeding each pot for its plant's phase (`potPhase`, also in the snapshot), the dashboard pot card (actions, its phase) and the plants page (In the tent, Growing elsewhere, Harvested). Checks: 5 new backend tests (phase per plant; cuttings, warning past 5, one per pot, harvest and place, staggered pots fed for their own phase), the existing test that put a second plant in pot 3 moved to pot 4 on purpose, 83 backend and 15 client tests, build, lint; dev smoke: cuttings, harvest, place, per-pot phases. The tent's light stays one schedule (F-007). An independent review (2026-11-24) found a hang in Take cuttings with long strain names (a blocker), duplicate cutting numbers, a wrong fallback when flushing without a flush phase, UTC instead of the grow's time zone, future harvest dates and doc gaps; all fixed the same day with tests (`plant-cycle.test.ts`, `plants.test.ts`). Before deploying on the real rig: record the bloom date of any plant already flowering. Closes when CI passes and the owner has tried it.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#19](https://github.com/voidbrain/Grover/pull/19) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

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

### B-007

**A pump whose switch-on fails is not treated as possibly running**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔶 P2 | Open | 🟢 Small |

🧑 **→ Human action required: Decision**<br />Approve changing the agent's safety layer (`actuators.ts`): treat a failed switch-on like a failed switch-off.

| | |
|---|---|
| **Issue** | When a driver's `set(true)` throws, `Actuators` settles the run as not started: the pump is neither on nor stuck, and the watchdog never retries switching it off. If the write reached the chip although it reported an error, and the driver's own roll-back also failed (a dead I²C bus), the pump could keep running with no cap. Found in the second review of #29 (F-018) on 2026-11-24. Changing `actuators.ts` needs the owner's approval (AGENTS.md safety rules). |
| **Reproduce** | A driver whose `set(true)` writes the pin, then throws, and whose `set(false)` also throws: after `run()`, `isOn` is false and `stuckPump()` is null. |
| **Check** | With approval: a failed switch-on tries `set(false)`; if that fails too, the pump is marked stuck (no other pump runs, the watchdog retries off). An actuators test shows it, and the existing limits still hold. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Found 2026-11-24. Waiting for the owner's decision.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### B-006

**An upgraded agent drops its cached config until the hub answers**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔶 P2 | Open | 🟢 Small |

💻 **→ Human action required: No**<br />Upgrade a cached config of an older protocol on start, or keep running it, so the tent keeps its schedules.

| | |
|---|---|
| **Issue** | `AgentConfig.protocol` must equal `PROTOCOL_VERSION`. After an agent upgrade (each protocol bump: 4 for calibration, 5 for weekdays), the agent fails to parse its own cached `config.json` on start and runs nothing (lights, fans, loops, reads) until the hub reconnects and sends a new config. The agent must keep working without the hub (AGENTS.md). Found in the review of #27 on 2026-11-24. |
| **Reproduce** | Start an agent with a cached config whose `protocol` is one lower and no hub: no schedule runs. |
| **Check** | An agent test: a cached config of the previous protocol is used (its new fields at their defaults) and the agent's schedules run with no hub; a config of a newer or unknown protocol is still refused with a fault. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Found 2026-11-24 in the review of #27. Start with the failing agent test.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### B-005

**Run on a pump queued another run on each click while it ran**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔺 P1 | Implemented | 🟢 Small |

💻 **→ Human action required: No**<br />Let the PR's CI run; it closes on green.

| | |
|---|---|
| **Issue** | Reported by the owner on 2026-11-24: Run (Pumps, by hand) stayed enabled while the pump ran, because its request ends as soon as the Pi queues the run. Each extra click queued another run, so a pump could run several times in a row; NERV or a second browser could do the same. |
| **Reproduce** | `apps/agent/test/actuators.test.ts`, "a pump that is running or waiting cannot be queued again": before the fix the second run was accepted. On the dashboard: click Run twice. |
| **Check** | The agent refuses a run for a pump that is waiting or running ("already running / waiting"); the dashboard keeps Run disabled, showing "waiting" then "running", from the click until the Pi reports the pump off (or its cap plus a minute, if that report is lost); the test passes. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Fixed 2026-11-24 on `fix/b005-run-once`: `Actuators` tracks a busy state per pump (waiting / running) and refuses another run until the first settles; the client tracks pending runs until the "off" actuation. Other buttons checked: Feed now is disabled while a feed runs, switches and plant actions are disabled while their request is in flight and act once. Closes on the PR's green CI.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#22](https://github.com/voidbrain/Grover/pull/22) |
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




### F-015

**Rig map: the tent as a live diagram, with its controls**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Look at the map on the dev stack ([run it](../README.md#run-it), then Map next to the tent's name), on a phone and a laptop, light and dark.

| | |
|---|---|
| **Issue** | The dashboard lists probes and actuators as cards; nothing shows how the rig is plumbed and wired (supply tanks → their pumps → mixing tank → feed pumps → pots with their loops; lights, fan, air temperature) or where a fault or a running pump sits in it. Requested by the owner on 2026-11-24 ("a visual map would be nice, maybe as an alternative page, with all controls and situation"). |
| **Reproduce** | `npm run dev`: there is no view of the rig as it is built. |
| **Check** | An alternative page per tent (a link from the dashboard) draws the rig from its setup, not a fixed picture: the six supply tanks with level and low marks, their pumps, the mixing tank, each pot's feed pump, loop, level, EC, pH and plant (name, phase, day), and the tent's lights, fan and air temperature. Live: pumps and switches show on, waiting or off, a feed in progress shows its step, stale readings and alerts are marked on the part they concern. Controls on each part are the dashboard's (Run, Switch, Feed now, Read now, Stop all), go through the same API, and disable while running (B-005). Works at phone width and in both themes (STYLE-GUIDE tokens). A client spec covers drawing from a setup and one control. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Requested 2026-11-24. Built 2026-11-24 on `feat/f015-rig-map`: `/rooms/<id>/map` drawn from the setup (tent switches and probes; the six supply tanks with level, low mark and pump; the mixing tank with the running feed's step; each pot with plant, phase, alerts, feed pump, loop and readings), with the dashboard's controls (Run, Switch, Read, Feed now, Stop all) through the same Hub calls; the pump control and probe tiles are now shared with the room card (`pump-control.ts`, `tiles.ts`), `.toggle` moved to the global styles. Checks: a client spec (drawing from a setup, alerts on their part, a supply pump run that disables Run), 22 client tests, build, lint. Looked at with headless Chrome on a simulated rig: 390 px phone viewport (page as wide as the screen, no horizontal scroll) light and dark, and 1280 px dark; words in narrow tiles no longer break mid-word. Review of #26 fixed (specs and fix in one commit; the reviewer put the previous component back and five of the six map specs failed): tank and mixing-tank alerts show their words on the part (they showed only a border); Stop all, Read and the switches follow the room card's rules; parts the drawing has no place for are listed under "Other parts"; the mixing tank names the pot it feeds; a room card spec shows the shared pump control keeps Run disabled while a pump waits (B-005). 27 client tests. Closes when CI passes and the owner has looked at it. The legacy logical map (tag `legacy-v1`, `Documentation/img/Logical map.png`: room → pots → sensors and actuators) is a starting point for the layout.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#23](https://github.com/voidbrain/Grover/pull/23) (record), [#26](https://github.com/voidbrain/Grover/pull/26) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-016

**Schedules by day of week, weekends apart**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Try it on the dev stack: Setup → the tent → a schedule → Days.

| | |
|---|---|
| **Issue** | Schedule rules (window, every, at, dark) repeat the same every day. The old app (tag `legacy-v1`, `detail-panel/schedule-panel`) had a schedule per weekday with weekends shown apart. Requested by the owner on 2026-11-24. |
| **Reproduce** | `npm run dev`, Setup → a tent → Schedules: a rule cannot be limited to some days. |
| **Check** | A schedule rule can name the weekdays it runs on (default every day); the agent applies it in the tent's time zone, also offline; the schedule editor picks days with a weekdays/weekend shortcut and shows the week with weekends apart; light rules from the grow calendar stay daily. `PROTOCOL_VERSION` bumped if the rule shape changes; tests in contracts (which days a rule is due) and the e2e test. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Requested 2026-11-24 ("Day-of-week schedules, weekends separately"). Built 2026-11-24 on `feat/f016-weekdays`: `days` on schedules (migration 8; null every day), `isoWeekday` and `scheduleOnDay` in contracts (a window past midnight belongs to the day it started), the agent's tick skips other days (window held off, dark not held, nothing fires), calendar light schedules stay daily, `PROTOCOL_VERSION` 5, the editor's Days fieldset with shortcuts and the days in the schedule list. Checks: 4 contract tests, an agent test (a weekday window does nothing on Saturday), an e2e case (days reach the agent; none refused), drafts and editor specs. Review of #27, first round (no blocker): a switch turned on by hand on a day its window does not run held until the next run day (up to a week); each such day now starts with an edge, so it holds until that day ends (agent test; test and fix in one commit); agent tests for a window past midnight in the tick, `dark` and timed runs on other days; the editor sends nothing with no day ticked. Second round, blocker: that day-start edge switched a light off in the middle of its other schedule's window (weekdays 06:00–20:00 and weekend 20:00–02:00: off at 00:00 Sunday); the failing agent test is committed on its own before the fix. Closes when CI passes and the owner has tried it.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#24](https://github.com/voidbrain/Grover/pull/24) (record), [#27](https://github.com/voidbrain/Grover/pull/27) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-017

**Nutrient colours: each supply tank in its nutrient's real colour**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔹 P3 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Pick the colours of your nutrients: Setup → the tent → Nutrient colours.

| | |
|---|---|
| **Issue** | The old app gave each nutrient (Doses page) a colour matching the real product, so doses read at a glance. The new tanks (water, grow, micro, bloom, ripen, pH down) have no colour. Requested by the owner on 2026-11-24 ("colours are nice because they rely on real nutrient colour"). |
| **Reproduce** | `npm run dev`: supply tanks, their pumps and doses show no colour. |
| **Check** | Each supply tank has a colour chosen in Setup (a palette of nutrient-like colours plus a custom value, with defaults per role), stored with the tent (a migration), and used for the tank, its pump, dose bars and chart series; text on a colour keeps STYLE-GUIDE contrast in both themes. A client spec covers the editor. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Requested 2026-11-24. Built 2026-11-24 on `feat/f017-nutrient-colours` (stacked on F-016 for the migration order): `tankColours` on rooms (migration 9, validated on read; only colours that differ from the default are stored), `NUTRIENT_PALETTE`, `DEFAULT_TANK_COLOURS`, `tankColour` and `doseTank` in `kinds.ts`, a colour picker per supply tank with the palette as suggestions, swatches beside the tanks (dashboard, map) and supply pumps, coloured dose bars on the plant page. Deviations from the check: there are no per-tank chart series yet, so no chart uses the colours; no spec drives the setup form's pickers (drafts and map specs cover the values). Review of #28 (no blocker), failing tests committed first: a damaged stored value broke loading the tent or dropped every colour (now read key by key); the hub drops default colours and lowers the case whoever sends them; the "(shared)" label check ignores case. Checks: 2 contract tests, a hub test (stored with the tent, bad values refused), drafts and map specs. Closes when CI passes and the owner has chosen the colours.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#24](https://github.com/voidbrain/Grover/pull/24) (record), [#28](https://github.com/voidbrain/Grover/pull/28) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-018

**Pumps through an L298N driver (two pins on the MCP23017)**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Wire and check each pump on the Pi: [hardware bring-up](guides/hardware-bring-up.md), step 4b.

| | |
|---|---|
| **Issue** | The old rig drove each pump through an L298N motor driver: two MCP23017 pins per pump (`pin1`, `pin2` in tag `legacy-v1`). The new `mcp23017` binding drives one pin, which suits a relay but leaves the second L298N input unmanaged. The owner said "L298N probably" on 2026-11-24; the old I²C addresses will be remapped by hand, so no import of them. |
| **Reproduce** | Bind a pump with `mcp23017`: only one pin is set; nothing holds the other input of the bridge. |
| **Check** | An `l298n` actuator binding (MCP23017 address, the two input pins, optional enable pin, active level) for pumps only: on is IN1 high and IN2 low, off is both low, and the agent claims both pins low at start and on stop and shutdown; the probe editor offers it; a mock test shows both pins off after stop, a watchdog trip and shutdown; hardware notes in docs/DESIGN.md. Device check: each pump runs forward and stops, recorded here. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Requested 2026-11-24. Built 2026-11-24 on `feat/f018-l298n`: the `l298n` binding (pumps only, IN1/IN2/EN distinct, EN optional), its driver on a shared MCP23017 (all pins claimed low; on: IN2 low, IN1 high, EN high; off: EN, IN1, IN2 low; IN2 never high; the chip's close leaves them low), `PROTOCOL_VERSION` 6, the wiring in the actuator editor and list, bring-up step 4b. Checks: a contract test (pumps only, distinct pins), two hardware tests on a fake I²C bus (levels at claim, on, off and shutdown, IN2 never written high; Stop all through `Actuators` leaves both low), a drafts spec. Review of #29, failing tests committed first: a failed write while switching on left IN1 (or EN) high in the expander's latch, so a later write of the bank could run the pump untracked (now the driver takes everything back off and a failed write leaves its pin at its off level in the latch); switching off stopped at the first failed write (now every pin is tried); EN is claimed first; two actuators could share an expander pin, e.g. a relay on a bridge's IN2 (now the hub refuses it and the agent refuses such a config). Deviations from the check: no active level (an L298N's inputs are active-high logic, so the binding has none); no watchdog-trip test of its own (the watchdog switches off through the same `set(false)`, tested), and shutdown is tested through the expander's close, not `HardwareDrivers.close`. Second round, blocker: a database with two actuators already on one pin (legal before) made the hub throw while building the config, on every agent connect and every 10 minutes; now the config is not sent, the agent keeps its own and a `config` fault names the clash (failing test committed first). The agent's safety layer (`actuators.ts`) is unchanged; a switch-on that fails on a dead I²C bus is B-007. Not done: the device check (owner's go-ahead per run). Closes when CI passes and each pump has been checked on the Pi.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#24](https://github.com/voidbrain/Grover/pull/24) (record), [#29](https://github.com/voidbrain/Grover/pull/29) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-019

**Install Grover as a web app on the phone**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔹 P3 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />On the phone, open Grover at its `tailscale serve` address and add it to the home screen (Chrome: Install app; Safari: Share → Add to Home Screen).

| | |
|---|---|
| **Issue** | The client is a plain web page: it cannot be added to the home screen as an app with its own icon and window. The owner asked on 2026-11-24 ("can be installed as webapp? notifications?"), and said notifications will be handled by NERV. |
| **Reproduce** | Open the client over `tailscale serve` on a phone: the browser offers only a bookmark, no install. |
| **Check** | A web app manifest (name, short name, icons from the favicon's design, theme colours from the STYLE-GUIDE tokens, `display: standalone`, start URL `/`) and a service worker that caches the app shell, so the installed app opens and shows the last snapshot (the client already caches it) while the hub is unreachable; API calls are never served from the cache. Installable from Chrome and Safari over the HTTPS `tailscale serve` address. No push notifications: alerts reach the owner through NERV (F-008). |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Requested 2026-11-24. Install needs HTTPS, which `tailscale serve` gives. Built 2026-11-24 on `feat/f019-install`: `manifest.webmanifest`, `icon.svg` with 192/512 PNGs, `sw.js` (keeps the page and the files it names at install, network first for pages, kept copies for hashed files, never `/api` or `/mcp`), registered in production builds only; index links and theme colour. Checks: a hub test (manifest, worker and icons served with their types; the worker's routing and the files it keeps, run in a sandbox). Headless Chrome on a simulated rig: the manifest parses, the worker activates and controls the page; with the network cut, a reload opens the app with "Offline: last known data". Not verified: Chrome's headless installability check still reports no acceptable icon although both PNGs are served (200, image/png, 192 and 512 px), so installing is for the owner to try; pages never opened online (their lazy scripts) are not kept. Closes when CI passes and the owner has installed it.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#25](https://github.com/voidbrain/Grover/pull/25) (record) |
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

### F-014

**Plant page with statistics, as in the old app**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Try it on the dev stack: [run it](../README.md#run-it), then open NL5xHaze gen 2 from pot 3 (start from a fresh `data/dev` so the demo plant has its placing date).

| | |
|---|---|
| **Issue** | The old app's plant panel (tag `legacy-v1`, `components/plants/detail-panel/`) had a chart of the plant's probes with the phase's safe band and actuator events, ranges Today / Last week / Last month / From start, a doses bar, phase details, an event log and a table. The new app has only a chart per probe. Requested by the owner on 2026-11-24. |
| **Reproduce** | `npm run dev`: there is no page for a plant; its readings, feeds and doses cannot be seen together. |
| **Check** | A plant page (from the pot card and the plants page) shows: header (strain, generation and mother line, breeder, genetics, dates, days, current phase); charts of level, EC, pH and water temperature of its pot with the phase band and markers for feeds, bloom, flush and harvest, over Today / Last week / Last month / From start (from when it went into the pot); total water and nutrients given and the number of feeds; days in the tent, share of EC and pH readings in range, yield; a log of its feeds (EC/pH before and after), phase changes and its pot's alerts. Plants record when they are placed in a pot. Tests cover the statistics. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Requested 2026-11-24 ("should also see stats, they were in the old"); scope taken from the legacy plant panel the same day. Built 2026-11-24 on `feat/f014-plant-page`: `placedOn` on plants (migration 7, set by Place in pot, editable), `phaseTimeline`, `plantStats` and `downsample` in contracts, `GET /api/plants/<id>/report?range=day|week|month|all` and the MCP tool `grover_plant_report`, the page at `/plants/<id>` (linked from the pot card and the plants page) with header, statistics, nutrient bars, four charts with phase bands and event markers, and a log. Checks: 3 contract tests, 2 hub tests, an e2e case (HTTP and MCP agree), 2 client specs. Review of #25 fixed test-first: a report over half a year of 5-minute readings took 12.5 s inside the hub (a date formatter per reading); now about 0.1 s (one formatter per zone, each probe read once between local midnights, days assigned in one pass), with a test bound; the report gives local midnights as instants, so a browser in another zone draws the grow's days; a harvested plant shows no alerts (they would be the next plant's) and keeps the history of probes switched off since; the page reloads when a feed of its pot changes state; the placing date must fall between start and harvest. Deviations from the check: the log shows the pot's open alerts only, because cleared alerts are not stored; on a day a plant is harvested and the next placed in the same pot, that day's readings and feeds count for both. Closes when CI passes and the owner has looked at a plant's page.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#25](https://github.com/voidbrain/Grover/pull/25) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-004

**Calibrate analog probes (volts to pH and EC)**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔺 P1 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Calibrate the real pH and EC probes on the Pi: [hardware bring-up](guides/hardware-bring-up.md), step 3b.

| | |
|---|---|
| **Issue** | The `ads1115` driver returns volts, and the hub treats them as pH or EC: dosing on a real rig would be wrong until calibration exists. |
| **Reproduce** | Bind a pH probe with `ads1115` and read it: the value is a voltage (about 1.5–2.5), not a pH. |
| **Check** | A calibrated probe reports pH within ± 0.1 of buffer solutions 4 and 7 and EC within ± 0.1 mS/cm of the calibration solution, compensated (pH slope by temperature, EC to 25 °C) with the chosen water temperature probe; calibration points are taken from the probe editor with a raw reading that is not stored as a measurement; an analog pH/EC probe without calibration is never used to plan a feed, and the preview says why; unit tests cover the maths, the agent and the feed guard. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Built 2026-11-24 on `feat/f004-calibration`: `Calibration` on probes (migration 6), the maths in contracts (line through points, one-point correction, pH and EC temperature compensation), applied on the agent with the chosen water temperature probe, raw reads (`read` with `raw: true`, not stored) over MQTT and `POST /api/probes/<id>/read-raw`, the calibration section in the probe editor, and the feed guard for uncalibrated analog pH/EC (the plan says why). Checks: 5 maths tests (buffers read back exactly, compensation, one-point EC and offset), an agent test (calibrated and raw reads), a feed-guard test; 105 backend and 15 client tests, build, lint. Review of #21 (2026-11-24) fixed test-first: pH needs two buffers and degenerate points are refused (schema and editor); EC points away from 25 °C fitted at their temperature; `calibratedAt` so volts read before calibrating are never used by feeds or alerts; calibration dropped on rewiring; compensation temperature checked (water temperature probe of the same pot or tent, at most 15 minutes old, 0–50 °C); `PROTOCOL_VERSION` 4, older agents' analog pH/EC treated as uncalibrated; a stored calibration the rules refuse reads as none; maths moved to zod-free `kinds.ts` for the editor preview; e2e case for `read-raw`; client spec (offline, one buffer, choices before the first point). Second review fixed test-first: EC without a current temperature assumes the calibration temperature (it read low); compensation per kind (EC always through zero to 25 °C; pH 'ph' or none); references at least 1 pH / 0.1 mS/cm apart; readings carry the `calibratedAt` the agent applied and the hub keeps only current ones; a deleted or moved temperature probe is released; the feed's fresh-reading check uses calibrated measurements. Third review: readings are checked against the calibration by the same rules as the probe (a refused stored calibration counts as none, so the probe never goes silent); a probe moved away from its temperature probe releases the link instead of refusing the save; a manual read made before the new calibration reached the agent says so. 120 backend and 18 client tests. Not done: a calibration with real buffers on the device (F-003). Closes when CI passes and the owner has calibrated the real probes.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#21](https://github.com/voidbrain/Grover/pull/21) |
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

**Lights follow the grow calendar; Switch to bloom**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Try it on the dev stack: [run it](../README.md#run-it), then Switch to bloom on pot 3 and watch the light line change to 12 h.

| | |
|---|---|
| **Issue** | Each phase has `lightHours` (18 in veg, 12 in bloom) but nothing reads them: the light runs on a fixed schedule edited by hand. Agreed with the owner on 2026-11-24: the light window follows the calendar from a chosen start time; with staggered pots the tent's one light follows the most advanced plant, or a plant the owner picks; a Switch to bloom button (and Start flush) records the date on the plant, which moves its phase and, when it is the one the light follows, the light. |
| **Reproduce** | Seed the demo tent (`npm run dev`) and move `calendarStart` back past day 42: the phase reads "Early bloom" but the light window stays 06:00–00:00. |
| **Check** | With the tent set to follow the calendar, the agent receives a light window of the followed phase's hours from the chosen start, and the window changes (without a manual edit) when that plant switches to bloom; the most advanced plant is followed by default, a picked plant when set; a phase with 0 light hours keeps the light off; with the tent on its own schedules nothing changes; Switch to bloom and Start flush record today's date; tests cover the choice, the window, the agent and the button. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** Built 2026-11-24 on `feat/f007-light-calendar`: tent settings `lightFrom`, `lightStart`, `lightPlantId` (migration 5), `chooseLightPhase` and `lightRule` (contracts), `Lights` on the hub rewriting the light's rule in the agent config, a `dark` schedule rule on the agent, configs re-sent every 10 minutes and after plant changes, Switch to bloom / Start flush (HTTP, MCP, pot card), the light line on the dashboard and the settings in the tent form. The demo tent follows the calendar. Also: the tent calendar's start date must be YYYY-MM-DD (migration 5 trims stored ones). Checks: 7 new tests (lighting, lights, agent dark rule), 94 backend and 15 client tests, build, lint; dev smoke: Switch to bloom moved the light from 06:00-00:00 to 06:00-18:00 and the agent received it within a second. An independent review (2026-11-24) found no blocker; fixed the same day with tests: dark is held on every tick (a light switched on by hand in a 0-hour phase went on staying on), protocol version 3 for the `dark` rule, an e2e case for Switch to bloom reaching the agent, distinct light schedule ids, the dashboard saying when the calendar has nothing to follow, `dark` kept when a schedule is edited, unreadable calendar dates cleared by migration 5. Closes when CI passes and the owner has tried it.

**Estimates:** Small remaining effort. Initial estimate; revise from the scoped work and evidence. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#20](https://github.com/voidbrain/Grover/pull/20) |
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
