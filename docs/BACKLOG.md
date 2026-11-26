# <a id="top"></a>Grover backlog

Current work ledger, reviewed 26 November 2026 against main `2eceb42`. Generated from [record sources](work/records) and [steps](work/tasks) by `npm run work:build`: edit those, not this file. [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

<!-- totals:start -->
**Remaining effort:** 52.25 h agent + 13.25 h owner across 79 open steps of 26 features and 7 other records. Generated from the task files.
<!-- totals:end -->

## Work items

Bugs (B-) and features (F-) in one list, in work-queue order. Steps: `effort` = remaining agent time (🟢 up to 1 h · 🟡 4 h · 🔴 8 h · 🟣 more); `h` = agent hours, owner time apart; a step status is not the record's acceptance.

### <a id="b-008"></a>[🐞 B-008](#top)

**The feed end-to-end test fails now and then on CI: feed done, mixing tank not emptied**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔺 P1 | 🟢 Small | 0 h | — | — | 🤖 | — | — |

💻 **→** Next: B-008-T01 — Find why the feed e2e test fails now and then (Implemented; verification pending).

| | |
|---|---|
| **Issue** | `apps/hub/test/e2e.test.ts`, "a feed runs end to end": the feed ends `done`, yet the simulated mixing tank still holds 0.3 L or more (`mixing tank emptied` fails). PR CI run 45487054804 failed on `a790c83`; run 45487113564 passed on `55c7c70`, a docs-only commit on the same code. Earlier failures of the feed tests (runs 45460424727, 45461154747) were on branches still changing. Not known: a race in the test or the simulated drivers, or a feed reported done before the transfer pump emptied the tank (a product defect). Found by the delivery audit of 2026-11-25. |
| **Reproduce** | 10 serial local runs all passed. Under load it fails: 2026-11-25, `node --test apps/hub/test/e2e.test.ts` ten at a time with 12 CPU burners failed 3 to 11 of 30 runs, each ending `done (time allowed used)` with 0.35 to 3.7 L in the mixing tank. Deterministic: `apps/hub/test/fast-rig.test.ts`. |
| **Check** | The cause is named with evidence; if it is the feed logic, a failing test shows it first and the fix makes it pass; the test passes in 30 repeated runs under CPU load (for example `stress` or several runs in parallel) and on the next 10 CI runs. |

**Steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | PRs |
|---|---|---|---|---|---|---|---|---|
| 🟢 Small | <a id="b-008-t01"></a>B-008-T01 — Find why the feed e2e test fails now and then | 1 h | 0 h | 0 h | Implemented; verification pending | — | [B-008-T02](#b-008-t02) | [PR #38](https://github.com/voidbrain/Grover/pull/38) cause, failing test and fix |
| 🟢 Small | <a id="b-008-t02"></a>B-008-T02 — Failing test if the feed logic is wrong, then the fix | 1 h | 0 h | 0 h | Implemented; verification pending | [B-008-T01](#b-008-t01) | — | [PR #38](https://github.com/voidbrain/Grover/pull/38) cause, failing test and fix |
| 🟢 Small | **Total** | 2 h | 0 h (0 of 2 steps recorded) | 0 h | 0 of 2 completed | | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/B-008.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: B-008-T01: [PR #38](https://github.com/voidbrain/Grover/pull/38) cause, failing test and fix · B-008-T02: [PR #38](https://github.com/voidbrain/Grover/pull/38) cause, failing test and fix. Test: `apps/hub/test/fast-rig.test.ts` (fails without the fix: 5.33 L left). [#38](https://github.com/voidbrain/Grover/pull/38). CI runs [45487054804](https://github.com/voidbrain/Grover/actions/runs/45487054804) (fail) and [45487113564](https://github.com/voidbrain/Grover/actions/runs/45487113564) (pass, docs-only change); [#37](https://github.com/voidbrain/Grover/pull/37) |
| Opened | 2026-11-25 |
| Verification | Pending: the next 10 CI runs |
| Reviewed | 2026-11-25 |

</details>

---
### <a id="f-005"></a>[✨ F-005](#top)

**Deploy hub and agent on the Pi behind Tailscale**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟢 Small | 0.5 h agent + 1 h owner | — | [F-003-T02](#f-003-t02), [F-018-T03](#f-018-t03) | ⏳ | 🧑‍🔧 | — |

🧑 **→** Next: [🧑‍🔧](acceptance/pi-deploy.md) F-005-T04 — Owner installs the agent on a small second Pi in the tent (later) (Planned).

| | |
|---|---|
| **Issue** | systemd units and deploy steps exist (`deploy/`, README) but have not been run on a Pi: the hub goes on Calvary (NERV-03), the agent on a small second Pi in the tent. |
| **Reproduce** | README, "Deploying on a Raspberry Pi", steps 1 to 6. |
| **Check** | The hub starts at boot on Calvary and the agent on the tent Pi; `https://<pi>.<tailnet>.ts.net` opens the dashboard from a phone on the tailnet and not from outside it; NERV lists the Grover tools at `/mcp`. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who |
|---|---|---|---|---|---|---|---|:---:|
| 🟢 Small | <a id="f-005-t04"></a>F-005-T04 — Owner installs the agent on a small second Pi in the tent (later) | 0 h | 0 h | 0 h agent + 1 h owner | Planned | — | [F-003-T02](#f-003-t02), [F-005-T03](#f-005-t03), [F-018-T03](#f-018-t03) | [🧑‍🔧](acceptance/pi-deploy.md) |
| 🟢 Small | <a id="f-005-t03"></a>F-005-T03 — Fix the README and service files from the first installs (hub on Calvary, agent on the tent Pi) | 0.5 h | 0 h | 0.5 h | Planned | [F-005-T04](#f-005-t04) | — | ⏳ 🤖 |
| 🟢 Small | **Total** | 0.5 h (3 of 4 steps) | 0 h (0 of 4 steps recorded) | 0.5 h agent + 1 h owner | 2 of 4 completed | | | |

<details><summary>Done steps (2)</summary>

| Effort | Step | Estimate | Actual | Status |
|---|---|---|---|---|
| — | <a id="f-005-t01"></a>F-005-T01 — Owner installs the Grover hub on Calvary (NERV-03) behind Tailscale | 0 h | 0 h | Completed |
| — | <a id="f-005-t02"></a>F-005-T02 — Owner checks NERV lists the Grover tools (waits on nerv:F-123-T02) | — | 0 h | Completed |

</details>

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-005.md)

| Field | Value |
|---|---|
| PR / evidence | [#30](https://github.com/voidbrain/Grover/pull/30), [#60](https://github.com/voidbrain/Grover/pull/60); [#61](https://github.com/voidbrain/Grover/pull/61); [#62](https://github.com/voidbrain/Grover/pull/62); [#63](https://github.com/voidbrain/Grover/pull/63); [#64](https://github.com/voidbrain/Grover/pull/64) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-25 |

</details>

---

### <a id="f-003"></a>[✨ F-003](#top)

**Hardware bring-up on the Raspberry Pi**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔺 P1 | 🟡 Medium | 2.5 h agent + 4.5 h owner | [F-005-T04](#f-005-t04) | [F-004-T02](#f-004-t02) | ⏳ | — | 🤔 |

🧑 **→** Next: [🤔](decisions/level-sensor.md) F-003-T01 — Owner chooses the water-level sensor (Ready).

| | |
|---|---|
| **Issue** | The real drivers (DS18B20, ADS1115, GPIO through `pinctrl`, MCP23017) have never run on a device; pump flows (`mlPerSecond`) and caps (`maxRunMs`) are unknown; the water-level sensor of the old build (two-pin, HC-SR04 style) cannot be timed from Node. |
| **Reproduce** | [Hardware bring-up](guides/hardware-bring-up.md), steps 1 to 6, on the Pi. |
| **Check** | Every probe reads a plausible value, every relay switches, each pump delivers its calibrated volume ± 10 %, and stopping the agent or the hub stops a running pump as described in step 6. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who |
|---|---|---|---|---|---|---|---|:---:|
| 🟢 Small | <a id="f-003-t01"></a>F-003-T01 — Owner chooses the water-level sensor | 0 h | 0 h | 0 h agent + 0.5 h owner | Ready | — | [F-003-T03](#f-003-t03) | [🤔](decisions/level-sensor.md) |
| 🟢 Small | <a id="f-003-t02"></a>F-003-T02 — Owner runs bring-up steps 1–4 on the Pi (buses, bindings, reads, switches) | 0 h | 0 h | 0 h agent + 2 h owner | Planned | [F-005-T04](#f-005-t04) | [F-003-T04](#f-003-t04), [F-004-T02](#f-004-t02) | ⏳ 🧑‍🔧 |
| 🟡 Medium | <a id="f-003-t03"></a>F-003-T03 — Driver for the chosen level sensor | 2 h | 0 h | 2 h | Planned | [F-003-T01](#f-003-t01) | [F-003-T04](#f-003-t04) | ⏳ 🤖 |
| 🟢 Small | <a id="f-003-t04"></a>F-003-T04 — Owner runs bring-up steps 5–6 on the Pi (pump calibration, levels, a first feed, safety) | 0 h | 0 h | 0 h agent + 2 h owner | Planned | [F-003-T02](#f-003-t02), [F-003-T03](#f-003-t03) | [F-003-T05](#f-003-t05) | ⏳ 🧑‍🔧 |
| 🟢 Small | <a id="f-003-t05"></a>F-003-T05 — Record the bring-up results; open B- records for driver faults | 0.5 h | 0 h | 0.5 h | Planned | [F-003-T04](#f-003-t04) | — | ⏳ 🤖 |
| 🟡 Medium | **Total** | 2.5 h | 0 h (0 of 5 steps recorded) | 2.5 h agent + 4.5 h owner | 0 of 5 completed | | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-003.md)

| Field | Value |
|---|---|
| PR / evidence | [#30](https://github.com/voidbrain/Grover/pull/30) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### <a id="f-004"></a>[✨ F-004](#top)

**Calibrate analog probes (volts to pH and EC)**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔺 P1 | 🟢 Small | 0.25 h agent + 1 h owner | [F-003-T02](#f-003-t02) | — | ⏳ | — | — |

💻 **→** Next: F-004-T02 — Owner calibrates the real pH and EC probes on the Pi (Planned).

| | |
|---|---|
| **Issue** | The `ads1115` driver returns volts, and the hub treats them as pH or EC: dosing on a real rig would be wrong until calibration exists. |
| **Reproduce** | Bind a pH probe with `ads1115` and read it: the value is a voltage (about 1.5–2.5), not a pH. |
| **Check** | A calibrated probe reports pH within ± 0.1 of buffer solutions 4 and 7 and EC within ± 0.1 mS/cm of the calibration solution, compensated (pH slope by temperature, EC to 25 °C) with the chosen water temperature probe; calibration points are taken from the probe editor with a raw reading that is not stored as a measurement; an analog pH/EC probe without calibration is never used to plan a feed, and the preview says why; unit tests cover the maths, the agent and the feed guard. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-004-t02"></a>F-004-T02 — Owner calibrates the real pH and EC probes on the Pi | 0 h | 0 h | 0 h agent + 1 h owner | Planned | [F-003-T02](#f-003-t02) | [F-004-T03](#f-004-t03) | ⏳ 🧑‍🔧 | — |
| 🟢 Small | <a id="f-004-t03"></a>F-004-T03 — Record the calibration result; fix what it found | 0.25 h | 0 h | 0.25 h | Planned | [F-004-T02](#f-004-t02) | — | ⏳ 🤖 | — |
| 🟢 Small | **Total** | 0.25 h (2 of 3 steps) | 0 h (0 of 3 steps recorded) | 0.25 h agent + 1 h owner | 1 of 3 completed | | | | |

<details><summary>Done steps (1)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-004-t01"></a>F-004-T01 — Build analog probe calibration | — | 0 h | Completed | [PR #21](https://github.com/voidbrain/Grover/pull/21) implementation |

</details>

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-004.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-004-T01: [PR #21](https://github.com/voidbrain/Grover/pull/21) implementation. [#21](https://github.com/voidbrain/Grover/pull/21); [#30](https://github.com/voidbrain/Grover/pull/30) |
| Opened | 2026-11-24 |
| Verification | 2026-11-24: PR CI green on #21 and the main run after merge (efeccdb) green; the owner's try is pending. |
| Reviewed | 2026-11-24 |

</details>

---

### <a id="f-011"></a>[✨ F-011](#top)

**Feed cycle per pot: supply tanks, mixing tank, pot pumps**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔺 P1 | 🟢 Small | 0.5 h agent + 0.5 h owner | — | — | ⏳ | 🧑‍🔧 | — |

🧑 **→** Next: [🧑‍🔧](acceptance/dev-stack.md#a-feed) F-011-T02 — Owner tries a feed on the simulated rig on the dev stack (Ready).

| | |
|---|---|
| **Issue** | The owner's rig, confirmed 2026-11-24: per tent (room), lights, fan and air temperature on schedules. Six supply tanks (water, grow, micro, bloom, ripen, pH down), each with a level sensor and a pump into one mixing tank (with its own level). Per pot: a transfer pump from the mixing tank, a recirculation pump (closed loop), a level sensor, and pH/EC probes (to start, one pair may serve all pots). A feed mixes one pot's dose (by phase, adjusted by that pot's EC and pH) in the mixing tank and moves it to the pot. Before running: supply tanks must have enough, the mixing tank must be empty, the pot must be able to take the batch. Low tanks are notified. Ripen is used alone at the end, then a plain-water flush phase. Grover today doses into one reservoir and has no feed cycle. |
| **Reproduce** | `npm run dev`: there is no way to feed a pot; the dose suggestion corrects a single reservoir. |
| **Check** | A feed for a pot runs end to end on the simulated rig (water, nutrients, pH down into the mixing tank, settle, transfer until the mixing tank is empty or the pot is full); it is refused with a reason (and an alert) when a supply tank is low, the mixing tank is not empty or the pot cannot take the batch; a low pot level or out-of-range pot EC/pH starts one automatically when the tent's auto-feed is on; the agent aborts and switches everything off on stop, mode change or a failed check; tests cover the planner, the agent run and the hub-agent join. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-011-t02"></a>F-011-T02 — Owner tries a feed on the simulated rig on the dev stack | 0 h | 0 h | 0 h agent + 0.5 h owner | Ready | — | [F-011-T03](#f-011-t03) | [🧑‍🔧](acceptance/dev-stack.md#a-feed) | — |
| 🟢 Small | <a id="f-011-t03"></a>F-011-T03 — Record the try of a feed; fix what it found | 0.5 h | 0 h | 0.5 h | Planned | [F-011-T02](#f-011-t02) | — | ⏳ 🤖 | — |
| 🟢 Small | **Total** | 0.5 h (2 of 3 steps) | 0 h (0 of 3 steps recorded) | 0.5 h agent + 0.5 h owner | 1 of 3 completed | | | | |

<details><summary>Done steps (1)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-011-t01"></a>F-011-T01 — Build the feed cycle per pot | — | 0 h | Completed | [PR #17](https://github.com/voidbrain/Grover/pull/17) implementation |

</details>

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-011.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-011-T01: [PR #17](https://github.com/voidbrain/Grover/pull/17) implementation. [#17](https://github.com/voidbrain/Grover/pull/17) (stacked on #16); [#30](https://github.com/voidbrain/Grover/pull/30) |
| Opened | 2026-11-24 |
| Verification | 2026-11-24: PR CI green on #17 and the main run after merge (a5cf6e3) green; the owner's try is pending. |
| Reviewed | 2026-11-24 |

</details>

---

### <a id="f-027"></a>[✨ F-027](#top)

**Gauntlet pack for the hub's MCP tools (grover-v1), Italian and English**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟡 Medium | 3.25 h | — | [F-028-T04](#f-028-t04) | 🤖 | — | — |

💻 **→** Next: F-027-T01 — Pin gauntlet-protocol, validate in CI, tool-name test and recorded skips (Planned).

| | |
|---|---|
| **Issue** | NERV's models call 19 Grover tools, four of which move hardware, and no case checks that a model picks the right tool and arguments, leaves hardware to approval and answers from the tool result. The tool-use general pack uses invented tools only. The owner uses NERV and all modules in Italian, so every case set includes Italian phrasings. Owner decision 2026-11-26 in chat: "ok to all" (accepts proposal 1 of the shared-asset review, coordinator:F-016-T04); same message: "nerv and all modules will need to work with Italian". |
| **Reproduce** | `ls evals/gauntlet` finds nothing; `grep gauntlet package.json` finds no pin; `apps/hub/src/mcp.ts` registers 19 tools with no case naming any. |
| **Check** | `evals/gauntlet/grover-v1.json`, model layer, regression and holdout splits, Italian and English requests, exact-json (json-match once released), invented data; `gauntlet validate` runs in CI from a pinned `@voidbrain/gauntlet-protocol` devDependency; a test fails when a case names a tool or argument that `mcp.ts` does not register; the skips are recorded in `docs/DESIGN.md`, "NERV"; NERV runs the pack against its models (nerv:F-120-T11). |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | PRs |
|---|---|---|---|---|---|---|---|---|
| 🟢 Small | <a id="f-027-t01"></a>F-027-T01 — Pin gauntlet-protocol, validate in CI, tool-name test and recorded skips | 0.75 h | 0 h | 0.75 h | Planned | — | [F-027-T02](#f-027-t02) | [PR #54](https://github.com/voidbrain/Grover/pull/54) plan |
| 🟡 Medium | <a id="f-027-t02"></a>F-027-T02 — Tool-choice, approval and argument cases, Italian and English | 1.5 h | 0 h | 1.5 h | Planned | [F-027-T01](#f-027-t01) | [F-027-T03](#f-027-t03), [F-028-T04](#f-028-t04) | [PR #54](https://github.com/voidbrain/Grover/pull/54) plan; [PR #56](https://github.com/voidbrain/Grover/pull/56) timed-switch case note |
| 🟢 Small | <a id="f-027-t03"></a>F-027-T03 — Answer-from-result cases on overview and alerts payloads, Italian and English | 1 h | 0 h | 1 h | Planned | [F-027-T02](#f-027-t02) | — | [PR #54](https://github.com/voidbrain/Grover/pull/54) plan |
| 🟡 Medium | **Total** | 3.25 h | 0 h (0 of 3 steps recorded) | 3.25 h | 0 of 3 completed | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-027.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-027-T01: [PR #54](https://github.com/voidbrain/Grover/pull/54) plan · F-027-T02: [PR #54](https://github.com/voidbrain/Grover/pull/54) plan; [PR #56](https://github.com/voidbrain/Grover/pull/56) timed-switch case note · F-027-T03: [PR #54](https://github.com/voidbrain/Grover/pull/54) plan. [#54](https://github.com/voidbrain/Grover/pull/54) (plan); [review page](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-shared-assets/gauntlet-grover.md); owner decision 2026-11-26 |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="b-006"></a>[🐞 B-006](#top)

**An upgraded agent drops its cached config until the hub answers**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | 0 h | — | — | 🤖 | — | — |

💻 **→** Next: B-006-T01 — Failing agent test, then run a cached config of the previous protocol (Implemented; verification pending).

| | |
|---|---|
| **Issue** | `AgentConfig.protocol` must equal `PROTOCOL_VERSION`. After an agent upgrade (each protocol bump: 4 for calibration, 5 for weekdays), the agent fails to parse its own cached `config.json` on start and runs nothing (lights, fans, loops, reads) until the hub reconnects and sends a new config. The agent must keep working without the hub (AGENTS.md). Found in the review of #27 on 2026-11-24. |
| **Reproduce** | Start an agent with a cached config whose `protocol` is one lower and no hub: no schedule runs. |
| **Check** | An agent test: a cached config of the previous protocol is used (its new fields at their defaults) and the agent's schedules run with no hub; a config of a newer or unknown protocol is still refused with a fault. |

**Steps**

| Effort | Step | Estimate | Actual | Remaining | Status | PRs |
|---|---|---|---|---|---|---|
| 🟢 Small | <a id="b-006-t01"></a>B-006-T01 — Failing agent test, then run a cached config of the previous protocol | 1 h | 0 h | 0 h | Implemented; verification pending | [PR #44](https://github.com/voidbrain/Grover/pull/44) cached config of the previous protocol; refusal fault |
| 🟢 Small | **Total** | 1 h | 0 h (0 of 1 steps recorded) | 0 h | 0 of 1 completed | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/B-006.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: B-006-T01: [PR #44](https://github.com/voidbrain/Grover/pull/44) cached config of the previous protocol; refusal fault. [#30](https://github.com/voidbrain/Grover/pull/30); [#44](https://github.com/voidbrain/Grover/pull/44) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="b-010"></a>[🐞 B-010](#top)

**Held threshold alerts read as if the value were still past the threshold, and threshold checks lack float tolerance**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | 0.25 h | — | — | 🤖 | — | — |

💻 **→** Next: B-010-T01 — Failing test, then held-alert wording and threshold tolerance (Implemented; verification pending).

| | |
|---|---|
| **Issue** | While a threshold alert is held inside its hysteresis margin (`F-008-T02`), `Alerts` formats the same message as when the reading is past the threshold — for example `Grow tank low (3.4, alert below 3): refill it. Feeds that need it are refused until then.` when `tank-grow` is at `3.4` (`alertBelow: 3`, clear point `3.5`), or `Air temperature at 31.6, above 32.` when `air-temp` is at `31.6` (`alertAbove: 32`, clear point `31.5`). In addition, `r.value < probe.alertBelow` and `r.value > probe.alertAbove` used exact comparisons without floating-point tolerance (`0.7 - 0.4 < 0.3` and `0.1 + 0.2 > 0.3` in IEEE-754). |
| **Reproduce** | Push `2.9` then `3.4` on `tank-grow` (`alertBelow: 3`, margin `0.5`), or push `0.7 - 0.4` on an EC probe with `alertBelow: 0.3` (`apps/hub/test/alerts.test.ts`). |
| **Check** | While held inside the hysteresis margin, the alert message states the current value, the threshold, and that the alert is held until the value passes the clear point (`at least <clear>` for `alertBelow`, `at most <clear>` for `alertAbove`); threshold comparisons use a tolerance (`EPSILON`) so floating-point noise at the threshold neither trips nor misclassifies an alert; failing test committed first in `apps/hub/test/alerts.test.ts` and kept unchanged by the fix. |

**Steps**

| Effort | Step | Estimate | Actual | Remaining | Status | PRs |
|---|---|---|---|---|---|---|
| 🟢 Small | <a id="b-010-t01"></a>B-010-T01 — Failing test, then held-alert wording and threshold tolerance | 0.5 h | 0 h | 0.25 h | Implemented; verification pending | [PR #39](https://github.com/voidbrain/Grover/pull/39) |
| 🟢 Small | **Total** | 0.5 h | 0 h (0 of 1 steps recorded) | 0.25 h | 0 of 1 completed | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/B-010.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: B-010-T01: [PR #39](https://github.com/voidbrain/Grover/pull/39). Test: `apps/hub/test/alerts.test.ts` (`B-010: held threshold alerts state the value, threshold and clear point…`, `B-010: threshold comparisons use a tolerance…`; committed failing first). [#39](https://github.com/voidbrain/Grover/pull/39) |
| Opened | 2026-11-25 |
| Verification | Unit/integration: 2026-11-25, passed locally (`npm test`, `npm run test:client`, `npm run build`); CI pending on [#39](https://github.com/voidbrain/Grover/pull/39) |
| Reviewed | 2026-11-25 |

</details>

---
### <a id="b-011"></a>[🐞 B-011](#top)

**Client specs are type-checked; the hysteresis test reads the probe kinds from the contract**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟢 Small | 0 h | — | — | 🤖 | — | — |

💻 **→** Next: B-011-T01 — Spec type check and contract-derived probe kinds in the hysteresis test (Implemented; verification pending).

| | |
|---|---|
| **Issue** | Two dormant checks found by the coordinator's sweep, 2026-11-26: `typecheck` ran `apps/client/tsconfig.app.json`, which excludes `*.spec.ts`, so the client specs ran unchecked under Vitest (T5, proposal 9); and "threshold alerts have a positive hysteresis margin for every probe kind" iterated a hand-written list of five kinds, so a new probe kind was not checked (C5, proposal 15). |
| **Reproduce** | On `main` `080194c`: `package.json` `typecheck` has no spec config; `apps/hub/test/alerts.test.ts:29-33` lists the kinds by hand. |
| **Check** | `npm run typecheck` (CI) also runs `tsc -p apps/client/tsconfig.spec.json --noEmit` and passes (no error found when added); the hysteresis test iterates `PROBE_KIND_IDS` from `@grover/contracts` and asserts `ALERT_HYSTERESIS` has exactly those keys. |

**Steps**

| Effort | Step | Estimate | Actual | Remaining | Status | PRs |
|---|---|---|---|---|---|---|
| 🟢 Small | <a id="b-011-t01"></a>B-011-T01 — Spec type check and contract-derived probe kinds in the hysteresis test | 0.5 h | 0 h | 0 h | Implemented; verification pending | [PR #50](https://github.com/voidbrain/Grover/pull/50) spec type check, contract kinds |
| 🟢 Small | **Total** | 0.5 h | 0 h (0 of 1 steps recorded) | 0 h | 0 of 1 completed | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/B-011.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: B-011-T01: [PR #50](https://github.com/voidbrain/Grover/pull/50) spec type check, contract kinds. [#50](https://github.com/voidbrain/Grover/pull/50) |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-012"></a>[✨ F-012](#top)

**Plants and strains: origin, generation, breeder, ancestry**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | 0 h | — | — | 🤖 | — | — |

💻 **→** Next: F-012-T03 — Record the try of the import; fix what it found (Implemented; verification pending).

| | |
|---|---|
| **Issue** | The rebuild dropped the plant records of the old Grover (tables `grover_plants`, `grover_strains`, `grover_companies` at tag `legacy-v1`). The owner needs each plant's origin: strain, breeder, generation (0 from seed, 1 first cutting, 2 cutting of a cutting…) and the plant it was cut from, which pot it is in, its dates; and each strain's breeder, ancestry (parent strains), indica/sativa split, THC (and CBD) when known. Example from the owner, 2026-11-24: Northern Lights #5 x Haze, generation 2, in pot 3; legacy: Sensi Seeds, parents Northern Lights #5 and Haze, 50 % sativa. |
| **Reproduce** | `git show legacy-v1:Documentation/MYSQL-DB/Sql_backup_2024_07_25.sql`, tables above; the new hub has no plants. |
| **Check** | Breeders, strains (parents, sativa %, THC/CBD %, flowering days, notes) and plants (strain, breeder, generation, mother plant, pot, dates, yield, notes) can be added and edited in Setup; a pot card shows its plant; the legacy strains, breeders and plants import once (`npm run hub -- import-legacy`) without guessing pots; NERV can read them (MCP); tests cover the schemas, the import and the API. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Who | PRs |
|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-012-t03"></a>F-012-T03 — Record the try of the import; fix what it found | 0.25 h | 0 h | 0 h | Implemented; verification pending | 🤖 | — |
| 🟢 Small | **Total** | 0.25 h (2 of 3 steps) | 0 h (0 of 3 steps recorded) | 0 h | 2 of 3 completed | | |

<details><summary>Done steps (2)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-012-t01"></a>F-012-T01 — Build plants, strains and the legacy import | — | 0 h | Completed | [PR #18](https://github.com/voidbrain/Grover/pull/18) implementation |
| — | <a id="f-012-t02"></a>F-012-T02 — Owner imports the old records on the Pi and enters the generation-2 plant | 0 h | 0 h | Completed | — |

</details>

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-012.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-012-T01: [PR #18](https://github.com/voidbrain/Grover/pull/18) implementation. [#18](https://github.com/voidbrain/Grover/pull/18); [#30](https://github.com/voidbrain/Grover/pull/30); owner's import 2026-11-26 (F-012-T02) |
| Opened | 2026-11-24 |
| Verification | 2026-11-24: PR CI green on #18; the first main run after merge (448a499) failed in the e2e read test (a race with scheduled reads, fixed in the test by #19, 789002c); main green since bc36108. 2026-11-26: the import on the Calvary hub (F-012-T02, see the closure evidence above), and a read-only `grover_plants` MCP call there returned its 17 plants. |
| Reviewed | 2026-11-26 |

</details>

---




### <a id="f-008"></a>[✨ F-008](#top)

**Alerts for NERV: out-of-range values, offline agent, faults**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🟡 Medium | 1.5 h agent + 0.25 h owner | `nerv:F-122-T02` | — | 🤖 | — | — |

💻 **→** Next: F-008-T04 — Write the alert contract for NERV (Implemented; verification pending).

| | |
|---|---|
| **Issue** | Nothing tells the owner when pH, EC, temperature or level leave the phase range, when an agent goes offline or a driver faults; NERV can only poll `grover_overview`. |
| **Reproduce** | Stop the agent or push a reading outside the range: nothing is raised. |
| **Check** | The hub raises and clears alerts with hysteresis, lists them in the client and through an MCP tool, and NERV can deliver them (its own pack, recorded in NERV's backlog). |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟡 Medium | <a id="f-008-t04"></a>F-008-T04 — Write the alert contract for NERV | 1.5 h | 0 h | 1.5 h | Implemented; verification pending | — | — | 🤖 | [PR #53](https://github.com/voidbrain/Grover/pull/53) feature |
| 🟢 Small | <a id="f-008-t03"></a>F-008-T03 — Owner sees a Grover alert delivered by NERV (waits on nerv:F-122-T02) | 0 h | 0 h | 0 h agent + 0.25 h owner | Planned | `nerv:F-122-T02` | — | ⏳ 🧑‍🔧 | — |
| 🟡 Medium | **Total** | 3 h (3 of 4 steps) | 0 h (0 of 4 steps recorded) | 1.5 h agent + 0.25 h owner | 2 of 4 completed | | | | |

<details><summary>Done steps (2)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-008-t01"></a>F-008-T01 — Build Grover-side alerts (thresholds, feeds, offline agents) | — | 0 h | Completed | [PR #17](https://github.com/voidbrain/Grover/pull/17) implementation |
| — | <a id="f-008-t02"></a>F-008-T02 — Hysteresis at alert thresholds | 1.5 h | 0 h | Completed | [PR #35](https://github.com/voidbrain/Grover/pull/35) feature |

</details>

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-008.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-008-T01: [PR #17](https://github.com/voidbrain/Grover/pull/17) implementation · F-008-T02: [PR #35](https://github.com/voidbrain/Grover/pull/35) feature · F-008-T04: [PR #53](https://github.com/voidbrain/Grover/pull/53) feature. [#17](https://github.com/voidbrain/Grover/pull/17) (stacked on #16); [#30](https://github.com/voidbrain/Grover/pull/30); [#35](https://github.com/voidbrain/Grover/pull/35); [#53](https://github.com/voidbrain/Grover/pull/53) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-25 |

</details>

---

### <a id="f-026"></a>[✨ F-026](#top)

**Hub backup schedule, off-host copy and restore drill**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔶 P2 | 🔴 Large | 5 h agent + 0.75 h owner | — | — | 🤖 | — | — |

💻 **→** Next: F-026-T01 — Scheduled backup with retention (Planned).

| | |
|---|---|
| **Issue** | F-010 gave the hub a `backup` command (`apps/hub/src/backup.ts`) but nothing runs it: no schedule, the copy lives on the same SD card as the database, and no restore has ever been tried outside a unit test. A dead SD card loses the grow history. NERV has a tested restore drill (`test/restore-drill.test.ts`); Grover has none. The coordinator's durable-data table (F-021) reads this record. Evidence: [NERV practices transfer report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md), class C item C4; missing practices M8 and M10 (soak not proposed); situation-gap row X3. Owner decision 2026-11-26 in chat: "NERV practices inventory accept all" (all 22 proposals of the [report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md); this record is proposal 20). |
| **Reproduce** | `npm run hub -- backup <file>` works on demand; search the repository for a timer, cron or scheduled job that calls it: none. No file documents where a copy goes or how to restore. |
| **Check** | A scheduled backup with retention runs on the Pi (F-026-T01); a test restores the newest copy into a running hub and reads its rooms and readings (F-026-T02); the owner chooses where the off-host copy goes (F-026-T03) and the copy happens (F-026-T04); the owner restores once on the Pi from the off-host copy and the date is recorded (F-026-T05). |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟡 Medium | <a id="f-026-t01"></a>F-026-T01 — Scheduled backup with retention | 2 h | 0 h | 2 h | Planned | — | [F-026-T02](#f-026-t02), [F-026-T03](#f-026-t03) | 🤖 | [PR #52](https://github.com/voidbrain/Grover/pull/52) plan |
| 🟡 Medium | <a id="f-026-t02"></a>F-026-T02 — Restore drill as an automated test | 1.5 h | 0 h | 1.5 h | Planned | [F-026-T01](#f-026-t01) | [F-026-T05](#f-026-t05) | ⏳ 🤖 | [PR #52](https://github.com/voidbrain/Grover/pull/52) plan |
| 🟢 Small | <a id="f-026-t03"></a>F-026-T03 — Owner: choose where the off-host copy goes | 0 h | 0 h | 0 h agent + 0.25 h owner | Planned | [F-026-T01](#f-026-t01) | [F-026-T04](#f-026-t04) | ⏳ 🤔 | [PR #52](https://github.com/voidbrain/Grover/pull/52) plan |
| 🟡 Medium | <a id="f-026-t04"></a>F-026-T04 — Off-host copy of the backup | 1.5 h | 0 h | 1.5 h | Planned | [F-026-T03](#f-026-t03) | [F-026-T05](#f-026-t05) | ⏳ 🤖 | [PR #52](https://github.com/voidbrain/Grover/pull/52) plan |
| 🟢 Small | <a id="f-026-t05"></a>F-026-T05 — Owner: restore once on the Pi from the off-host copy | 0 h | 0 h | 0 h agent + 0.5 h owner | Planned | [F-026-T02](#f-026-t02), [F-026-T04](#f-026-t04) | — | ⏳ 🧑‍🔧 | [PR #52](https://github.com/voidbrain/Grover/pull/52) plan |
| 🔴 Large | **Total** | 5 h | 0 h (0 of 5 steps recorded) | 5 h agent + 0.75 h owner | 0 of 5 completed | | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-026.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-026-T01: [PR #52](https://github.com/voidbrain/Grover/pull/52) plan · F-026-T02: [PR #52](https://github.com/voidbrain/Grover/pull/52) plan · F-026-T03: [PR #52](https://github.com/voidbrain/Grover/pull/52) plan · F-026-T04: [PR #52](https://github.com/voidbrain/Grover/pull/52) plan · F-026-T05: [PR #52](https://github.com/voidbrain/Grover/pull/52) plan. [#52](https://github.com/voidbrain/Grover/pull/52) (plan); [report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md); owner decision 2026-11-26 |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-006"></a>[✨ F-006](#top)

**Set-up screens in the client**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | 0.5 h agent + 0.5 h owner | — | — | ⏳ | 🧑‍🔧 | — |

🧑 **→** Next: [🧑‍🔧](acceptance/dev-stack.md#setup-pages) F-006-T02 — Owner tries the Setup pages on the dev stack (Ready).

| | |
|---|---|
| **Issue** | Everything except daily operation is set up through the HTTP API with curl; the client has no way to add or edit a room, probe, actuator, schedule or calendar. |
| **Reproduce** | Open the dashboard: there is no edit or add control. |
| **Check** | Each entity can be created, edited and deleted from the client with validation messages from the contracts schemas; the owner has tried a full set-up in a browser. (A browser test is F-009.) |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-006-t02"></a>F-006-T02 — Owner tries the Setup pages on the dev stack | 0 h | 0 h | 0 h agent + 0.5 h owner | Ready | — | [F-006-T03](#f-006-t03) | [🧑‍🔧](acceptance/dev-stack.md#setup-pages) | — |
| 🟢 Small | <a id="f-006-t03"></a>F-006-T03 — Record the try of the Setup pages; fix what it found | 0.5 h | 0 h | 0.5 h | Planned | [F-006-T02](#f-006-t02) | — | ⏳ 🤖 | — |
| 🟢 Small | **Total** | 0.5 h (2 of 3 steps) | 0 h (0 of 3 steps recorded) | 0.5 h agent + 0.5 h owner | 1 of 3 completed | | | | |

<details><summary>Done steps (1)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-006-t01"></a>F-006-T01 — Build the Setup pages | — | 0 h | Completed | [PR #16](https://github.com/voidbrain/Grover/pull/16) implementation |

</details>

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-006.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-006-T01: [PR #16](https://github.com/voidbrain/Grover/pull/16) implementation. [#16](https://github.com/voidbrain/Grover/pull/16) (stacked on #15); [#30](https://github.com/voidbrain/Grover/pull/30) |
| Opened | 2026-11-24 |
| Verification | 2026-11-24: PR CI green on #16 and the main run after merge (1f80ff5) green; the owner's try is pending. |
| Reviewed | 2026-11-24 |

</details>

---

### <a id="f-007"></a>[✨ F-007](#top)

**Lights follow the grow calendar; Switch to bloom**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | 0.25 h agent + 0.25 h owner | — | — | ⏳ | 🧑‍🔧 | — |

🧑 **→** Next: [🧑‍🔧](acceptance/dev-stack.md#lights-and-switch-to-bloom) F-007-T02 — Owner tries Switch to bloom and the light line on the dev stack (Ready).

| | |
|---|---|
| **Issue** | Each phase has `lightHours` (18 in veg, 12 in bloom) but nothing reads them: the light runs on a fixed schedule edited by hand. Agreed with the owner on 2026-11-24: the light window follows the calendar from a chosen start time; with staggered pots the tent's one light follows the most advanced plant, or a plant the owner picks; a Switch to bloom button (and Start flush) records the date on the plant, which moves its phase and, when it is the one the light follows, the light. |
| **Reproduce** | Seed the demo tent (`npm run dev`) and move `calendarStart` back past day 42: the phase reads "Early bloom" but the light window stays 06:00–00:00. |
| **Check** | With the tent set to follow the calendar, the agent receives a light window of the followed phase's hours from the chosen start, and the window changes (without a manual edit) when that plant switches to bloom; the most advanced plant is followed by default, a picked plant when set; a phase with 0 light hours keeps the light off; with the tent on its own schedules nothing changes; Switch to bloom and Start flush record today's date; tests cover the choice, the window, the agent and the button. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-007-t02"></a>F-007-T02 — Owner tries Switch to bloom and the light line on the dev stack | 0 h | 0 h | 0 h agent + 0.25 h owner | Ready | — | [F-007-T03](#f-007-t03) | [🧑‍🔧](acceptance/dev-stack.md#lights-and-switch-to-bloom) | — |
| 🟢 Small | <a id="f-007-t03"></a>F-007-T03 — Record the try of Switch to bloom; fix what it found | 0.25 h | 0 h | 0.25 h | Planned | [F-007-T02](#f-007-t02) | — | ⏳ 🤖 | — |
| 🟢 Small | **Total** | 0.25 h (2 of 3 steps) | 0 h (0 of 3 steps recorded) | 0.25 h agent + 0.25 h owner | 1 of 3 completed | | | | |

<details><summary>Done steps (1)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-007-t01"></a>F-007-T01 — Build lights that follow the grow calendar | — | 0 h | Completed | [PR #20](https://github.com/voidbrain/Grover/pull/20) implementation |

</details>

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-007.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-007-T01: [PR #20](https://github.com/voidbrain/Grover/pull/20) implementation. [#20](https://github.com/voidbrain/Grover/pull/20); [#30](https://github.com/voidbrain/Grover/pull/30) |
| Opened | 2026-11-24 |
| Verification | 2026-11-24: PR CI green on #20 and the main run after merge (9400372) green; the owner's try is pending. |
| Reviewed | 2026-11-24 |

</details>

---

### <a id="f-013"></a>[✨ F-013](#top)

**Plant cycle: nursery, cuttings, harvest, a plant per pot, phase per plant**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | 0.5 h agent + 0.5 h owner | — | — | ⏳ | 🧑‍🔧 | — |

🧑 **→** Next: [🧑‍🔧](acceptance/dev-stack.md#plant-cycle) F-013-T02 — Owner tries the plant cycle on the dev stack (Ready).

| | |
|---|---|
| **Issue** | The owner's cycle (2026-11-24): every plant (g0 from seed, or a cutting) starts elsewhere, not connected to the agent, then is placed in a free pot of the tent. When a plant in the tent is about to flower, cuttings are taken: they become the next generation, rooted elsewhere; when a plant in the tent is harvested, one of them takes its pot. A mother and its cuttings are never in the tent together. Pots can be staggered, so each pot's feed must follow its own plant's age and bloom date, not one tent calendar. Generations are finite: warn above 5. Today: no "take cuttings", "harvest" or "place in pot" actions, two growing plants can share a pot, and every pot is fed by the tent's calendar. |
| **Reproduce** | `npm run dev`: recording cuttings or a harvest means editing plants one by one; feeding pot 3 uses the tent's day count whatever its plant's age. |
| **Check** | Take cuttings creates N plants (next generation, that plant as mother, same strain and breeder, no pot, started today) and warns above generation 5; Harvest records the date (and yield) and frees the pot; Place in pot puts a nursery plant into a free pot and is refused for an occupied pot; a pot holds at most one growing plant; each pot's phase (and so its feed and target ranges) comes from its plant's start, bloom and flush dates, the tent calendar only when the pot has no growing plant or its plant has no (or a future) start date; the nursery is listed with age; tests cover the phase rule, the actions and the per-pot feed. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-013-t02"></a>F-013-T02 — Owner tries the plant cycle on the dev stack | 0 h | 0 h | 0 h agent + 0.5 h owner | Ready | — | [F-013-T03](#f-013-t03) | [🧑‍🔧](acceptance/dev-stack.md#plant-cycle) | — |
| 🟢 Small | <a id="f-013-t03"></a>F-013-T03 — Record the try of the plant cycle; fix what it found | 0.5 h | 0 h | 0.5 h | Planned | [F-013-T02](#f-013-t02) | — | ⏳ 🤖 | — |
| 🟢 Small | **Total** | 0.5 h (2 of 3 steps) | 0 h (0 of 3 steps recorded) | 0.5 h agent + 0.5 h owner | 1 of 3 completed | | | | |

<details><summary>Done steps (1)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-013-t01"></a>F-013-T01 — Build the plant cycle | — | 0 h | Completed | [PR #19](https://github.com/voidbrain/Grover/pull/19) implementation |

</details>

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-013.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-013-T01: [PR #19](https://github.com/voidbrain/Grover/pull/19) implementation. [#19](https://github.com/voidbrain/Grover/pull/19); [#30](https://github.com/voidbrain/Grover/pull/30) |
| Opened | 2026-11-24 |
| Verification | 2026-11-24: PR CI green on #19 and the main run after merge (bc36108) green; the owner's try is pending. |
| Reviewed | 2026-11-24 |

</details>

---

### <a id="f-014"></a>[✨ F-014](#top)

**Plant page with statistics, as in the old app**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | 0.5 h agent + 0.25 h owner | — | — | ⏳ | 🧑‍🔧 | — |

🧑 **→** Next: [🧑‍🔧](acceptance/dev-stack.md#plant-page) F-014-T02 — Owner tries the plant page on the dev stack (Ready).

| | |
|---|---|
| **Issue** | The old app's plant panel (tag `legacy-v1`, `components/plants/detail-panel/`) had a chart of the plant's probes with the phase's safe band and actuator events, ranges Today / Last week / Last month / From start, a doses bar, phase details, an event log and a table. The new app has only a chart per probe. Requested by the owner on 2026-11-24. |
| **Reproduce** | `npm run dev`: there is no page for a plant; its readings, feeds and doses cannot be seen together. |
| **Check** | A plant page (from the pot card and the plants page) shows: header (strain, generation and mother line, breeder, genetics, dates, days, current phase); charts of level, EC, pH and water temperature of its pot with the phase band and markers for feeds, bloom, flush and harvest, over Today / Last week / Last month / From start (from when it went into the pot); total water and nutrients given and the number of feeds; days in the tent, share of EC and pH readings in range, yield; a log of its feeds (EC/pH before and after), phase changes and its pot's alerts. Plants record when they are placed in a pot. Tests cover the statistics. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-014-t02"></a>F-014-T02 — Owner tries the plant page on the dev stack | 0 h | 0 h | 0 h agent + 0.25 h owner | Ready | — | [F-014-T03](#f-014-t03) | [🧑‍🔧](acceptance/dev-stack.md#plant-page) | — |
| 🟢 Small | <a id="f-014-t03"></a>F-014-T03 — Record the try of the plant page; fix what it found | 0.5 h | 0 h | 0.5 h | Planned | [F-014-T02](#f-014-t02) | — | ⏳ 🤖 | — |
| 🟢 Small | **Total** | 0.5 h (2 of 3 steps) | 0 h (0 of 3 steps recorded) | 0.5 h agent + 0.25 h owner | 1 of 3 completed | | | | |

<details><summary>Done steps (1)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-014-t01"></a>F-014-T01 — Build the plant page | — | 0 h | Completed | [PR #25](https://github.com/voidbrain/Grover/pull/25) implementation |

</details>

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-014.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-014-T01: [PR #25](https://github.com/voidbrain/Grover/pull/25) implementation. [#25](https://github.com/voidbrain/Grover/pull/25); [#30](https://github.com/voidbrain/Grover/pull/30) |
| Opened | 2026-11-24 |
| Verification | 2026-11-24: PR CI green on #25 and the main run after merge (77851b1) green; the owner's try is pending. |
| Reviewed | 2026-11-24 |

</details>

---

### <a id="f-015"></a>[✨ F-015](#top)

**Rig map: the tent as a live diagram, with its controls**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | 0.5 h agent + 0.5 h owner | — | — | ⏳ | 🧑‍🔧 | — |

🧑 **→** Next: [🧑‍🔧](acceptance/dev-stack.md#rig-map) F-015-T02 — Owner tries the rig map on a phone and a laptop, light and dark on the dev stack (Ready).

| | |
|---|---|
| **Issue** | The dashboard lists probes and actuators as cards; nothing shows how the rig is plumbed and wired (supply tanks → their pumps → mixing tank → feed pumps → pots with their loops; lights, fan, air temperature) or where a fault or a running pump sits in it. Requested by the owner on 2026-11-24 ("a visual map would be nice, maybe as an alternative page, with all controls and situation"). |
| **Reproduce** | `npm run dev`: there is no view of the rig as it is built. |
| **Check** | An alternative page per tent (a link from the dashboard) draws the rig from its setup, not a fixed picture: the six supply tanks with level and low marks, their pumps, the mixing tank, each pot's feed pump, loop, level, EC, pH and plant (name, phase, day), and the tent's lights, fan and air temperature. Live: pumps and switches show on, waiting or off, a feed in progress shows its step, stale readings and alerts are marked on the part they concern. Controls on each part are the dashboard's (Run, Switch, Feed now, Read now, Stop all), go through the same API, and disable while running (B-005). Works at phone width and in both themes (STYLE-GUIDE tokens). A client spec covers drawing from a setup and one control. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-015-t02"></a>F-015-T02 — Owner tries the rig map on a phone and a laptop, light and dark on the dev stack | 0 h | 0 h | 0 h agent + 0.5 h owner | Ready | — | [F-015-T03](#f-015-t03) | [🧑‍🔧](acceptance/dev-stack.md#rig-map) | — |
| 🟢 Small | <a id="f-015-t03"></a>F-015-T03 — Record the try of the rig map; fix what it found | 0.5 h | 0 h | 0.5 h | Planned | [F-015-T02](#f-015-t02) | — | ⏳ 🤖 | — |
| 🟢 Small | **Total** | 0.5 h (2 of 3 steps) | 0 h (0 of 3 steps recorded) | 0.5 h agent + 0.5 h owner | 1 of 3 completed | | | | |

<details><summary>Done steps (1)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-015-t01"></a>F-015-T01 — Build the rig map | — | 0 h | Completed | [PR #26](https://github.com/voidbrain/Grover/pull/26) implementation |

</details>

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-015.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-015-T01: [PR #26](https://github.com/voidbrain/Grover/pull/26) implementation. [#23](https://github.com/voidbrain/Grover/pull/23) (record), [#26](https://github.com/voidbrain/Grover/pull/26); [#30](https://github.com/voidbrain/Grover/pull/30) |
| Opened | 2026-11-24 |
| Verification | 2026-11-24: PR CI green on #26 and the main run after merge (af7026c) green; the owner's try is pending. |
| Reviewed | 2026-11-24 |

</details>

---

### <a id="f-016"></a>[✨ F-016](#top)

**Schedules by day of week, weekends apart**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | 0.5 h agent + 0.25 h owner | — | — | ⏳ | 🧑‍🔧 | — |

🧑 **→** Next: [🧑‍🔧](acceptance/dev-stack.md#weekday-schedules) F-016-T02 — Owner tries weekday schedules on the dev stack (Ready).

| | |
|---|---|
| **Issue** | Schedule rules (window, every, at, dark) repeat the same every day. The old app (tag `legacy-v1`, `detail-panel/schedule-panel`) had a schedule per weekday with weekends shown apart. Requested by the owner on 2026-11-24. |
| **Reproduce** | `npm run dev`, Setup → a tent → Schedules: a rule cannot be limited to some days. |
| **Check** | A schedule rule can name the weekdays it runs on (default every day); the agent applies it in the tent's time zone, also offline; the schedule editor picks days with a weekdays/weekend shortcut and shows the week with weekends apart; light rules from the grow calendar stay daily. `PROTOCOL_VERSION` bumped if the rule shape changes; tests in contracts (which days a rule is due) and the e2e test. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-016-t02"></a>F-016-T02 — Owner tries weekday schedules on the dev stack | 0 h | 0 h | 0 h agent + 0.25 h owner | Ready | — | [F-016-T03](#f-016-t03) | [🧑‍🔧](acceptance/dev-stack.md#weekday-schedules) | — |
| 🟢 Small | <a id="f-016-t03"></a>F-016-T03 — Record the try of weekday schedules; fix what it found | 0.5 h | 0 h | 0.5 h | Planned | [F-016-T02](#f-016-t02) | — | ⏳ 🤖 | — |
| 🟢 Small | **Total** | 3.5 h | 0 h (0 of 3 steps recorded) | 0.5 h agent + 0.25 h owner | 1 of 3 completed | | | | |

<details><summary>Done steps (1)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-016-t01"></a>F-016-T01 — Weekdays on schedule rules: contracts, agent and editor | 3 h | 0 h | Completed | [PR #27](https://github.com/voidbrain/Grover/pull/27) implementation |

</details>

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-016.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-016-T01: [PR #27](https://github.com/voidbrain/Grover/pull/27) implementation. [#24](https://github.com/voidbrain/Grover/pull/24) (record), [#27](https://github.com/voidbrain/Grover/pull/27); [#30](https://github.com/voidbrain/Grover/pull/30) |
| Opened | 2026-11-24 |
| Verification | 2026-11-24: PR CI green on #27 and the main run after merge (236a17f) green; the owner's try is pending. |
| Reviewed | 2026-11-24 |

</details>

---
### <a id="f-018"></a>[✨ F-018](#top)

**Pumps through an L298N driver (two pins on the MCP23017)**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔶 P2 | 🟢 Small | 0.25 h agent + 1.5 h owner | [F-005-T04](#f-005-t04) | — | ⏳ | 🧑‍🔧 | — |

🧑 **→** Next: [🧑‍🔧](acceptance/pump-wiring.md) F-018-T01 — Owner writes down the pump wiring (L298N inputs on MCP23017 pins) (Ready).

| | |
|---|---|
| **Issue** | The old rig drove each pump through an L298N motor driver: two MCP23017 pins per pump (`pin1`, `pin2` in tag `legacy-v1`). The new `mcp23017` binding drives one pin, which suits a relay but leaves the second L298N input unmanaged. The owner said "L298N probably" on 2026-11-24; the old I²C addresses will be remapped by hand, so no import of them. |
| **Reproduce** | Bind a pump with `mcp23017`: only one pin is set; nothing holds the other input of the bridge. |
| **Check** | An `l298n` actuator binding (MCP23017 address, the two input pins, optional enable pin, active level) for pumps only: on is IN1 high and IN2 low, off is both low, and the agent claims both pins low at start and on stop and shutdown; the probe editor offers it; a mock test shows both pins off after stop, a watchdog trip and shutdown; hardware notes in docs/DESIGN.md. Device check: each pump runs forward and stops, recorded here. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-018-t01"></a>F-018-T01 — Owner writes down the pump wiring (L298N inputs on MCP23017 pins) | 0 h | 0 h | 0 h agent + 0.5 h owner | Ready | — | [F-018-T03](#f-018-t03) | [🧑‍🔧](acceptance/pump-wiring.md) | — |
| 🟢 Small | <a id="f-018-t03"></a>F-018-T03 — Owner runs each pump forward and stops it on the Pi | 0 h | 0 h | 0 h agent + 1 h owner | Planned | [F-018-T01](#f-018-t01), [F-005-T04](#f-005-t04) | [F-018-T04](#f-018-t04) | ⏳ 🧑‍🔧 | — |
| 🟢 Small | <a id="f-018-t04"></a>F-018-T04 — Record the pump device check; fix what it found | 0.25 h | 0 h | 0.25 h | Planned | [F-018-T03](#f-018-t03) | — | ⏳ 🤖 | — |
| 🟢 Small | **Total** | 2.25 h | 0 h (0 of 4 steps recorded) | 0.25 h agent + 1.5 h owner | 1 of 4 completed | | | | |

<details><summary>Done steps (1)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-018-t02"></a>F-018-T02 — The l298n actuator binding | 2 h | 0 h | Completed | [PR #29](https://github.com/voidbrain/Grover/pull/29) implementation |

</details>

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-018.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-018-T02: [PR #29](https://github.com/voidbrain/Grover/pull/29) implementation. [#24](https://github.com/voidbrain/Grover/pull/24) (record), [#29](https://github.com/voidbrain/Grover/pull/29), [#30](https://github.com/voidbrain/Grover/pull/30) |
| Opened | 2026-11-24 |
| Verification | 2026-11-24: PR CI green on #29 and the main run after merge (8e5da72) green; the device check is pending. |
| Reviewed | 2026-11-24 |

</details>

---
### <a id="b-012"></a>[🐞 B-012](#top)

**The hub republishes every agent config every 10 minutes, and DESIGN.md says it does not; four API routes are documented nowhere**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟢 Small | 1 h | — | — | 🤖 | — | — |

💻 **→** Next: B-012-T01 — Find why the 10-minute config republish exists and pin the chosen behaviour with a failing-first test (Planned).

| | |
|---|---|
| **Issue** | Found by the coordinator's hidden-code sweep, 2026-11-26 ([page](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-hidden-code.md)); owner decision in chat 2026-11-26: "2 ok". `apps/hub/src/hub.ts:63` runs `setInterval(() => agents.publishAllConfigs(), 10 * 60_000)`, while `docs/DESIGN.md:60` says the config topic is "Republished on every connect and setup change". The code comment says why: phases move with the days, so a light following the calendar changes on its own (F-007, commit `fed6e9f`, 2026-11-24; the F-007 record says "configs re-sent every 10 minutes and after plant changes"). So the job is deliberate and F-007 documents it; DESIGN.md was not updated. Open question: whether the 10-minute resend is also needed for recovery after a lost retained message or a restarted broker. Separately, `/api/actuations`, `/api/faults`, `/api/feeds` and `/api/health` (`apps/hub/src/http.ts`) are typed in `packages/contracts/src/api.ts` but listed in no document: DESIGN draws "HTTP /api" as one box. |
| **Reproduce** | Read `apps/hub/src/hub.ts` lines 61-64 against `docs/DESIGN.md` line 60; `grep -n "/api/actuations\|/api/faults\|/api/feeds\|/api/health" docs/DESIGN.md` finds nothing. |
| **Check** | The behaviour DESIGN states is the behaviour the code has, and a test pins it (the periodic resend, with fake timers, republishes every config once per interval and an unchanged config changes nothing on the agent; or, if the resend is dropped, the calendar-driven light change still reaches the agent by another path); DESIGN's Protocol section says when the config is republished and why; the four routes are listed in DESIGN with their query parameters and response types. |

**Steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | PRs |
|---|---|---|---|---|---|---|---|---|
| 🟢 Small | <a id="b-012-t01"></a>B-012-T01 — Find why the 10-minute config republish exists and pin the chosen behaviour with a failing-first test | 0.5 h | 0 h | 0.5 h | Planned | — | [B-012-T02](#b-012-t02) | [PR #57](https://github.com/voidbrain/Grover/pull/57) plan |
| 🟢 Small | <a id="b-012-t02"></a>B-012-T02 — Fix the code or update DESIGN.md to match, and document the four undocumented API routes | 0.5 h | 0 h | 0.5 h | Planned | [B-012-T01](#b-012-t01) | — | [PR #57](https://github.com/voidbrain/Grover/pull/57) plan |
| 🟢 Small | **Total** | 1 h | 0 h (0 of 2 steps recorded) | 1 h | 0 of 2 completed | | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/B-012.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: B-012-T01: [PR #57](https://github.com/voidbrain/Grover/pull/57) plan · B-012-T02: [PR #57](https://github.com/voidbrain/Grover/pull/57) plan. [#57](https://github.com/voidbrain/Grover/pull/57) (plan); owner decision 2026-11-26 "2 ok" |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-010"></a>[✨ F-010](#top)

**Hub data retention and backups**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔹 P3 | 🟢 Small | 0 h | — | — | 🤖 | — | — |

💻 **→** Next: F-010-T01 — Downsample old readings (Implemented; verification pending).

| | |
|---|---|
| **Issue** | Readings every 5 minutes for 5 probes grow the SQLite file on the Pi's SD card without bound, and there is no backup. |
| **Reproduce** | `npm run dev` for a while, then inspect `data/dev/hub.sqlite`. |
| **Check** | Old readings are downsampled (for example hourly after 30 days), a `backup` command writes a consistent copy, and both are tested. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | PRs |
|---|---|---|---|---|---|---|
| 🟢 Small | <a id="f-010-t01"></a>F-010-T01 — Downsample old readings | 1.5 h | 0 h | 0 h | Implemented; verification pending | [PR #46](https://github.com/voidbrain/Grover/pull/46) downsampling job and tests |
| 🟢 Small | <a id="f-010-t02"></a>F-010-T02 — Backup command for the hub database | 1 h | 0 h | 0 h | Implemented; verification pending | [PR #47](https://github.com/voidbrain/Grover/pull/47) backup command and tests |
| 🟢 Small | **Total** | 2.5 h | 0 h (0 of 2 steps recorded) | 0 h | 0 of 2 completed | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-010.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-010-T01: [PR #46](https://github.com/voidbrain/Grover/pull/46) downsampling job and tests · F-010-T02: [PR #47](https://github.com/voidbrain/Grover/pull/47) backup command and tests. [#30](https://github.com/voidbrain/Grover/pull/30); [#46](https://github.com/voidbrain/Grover/pull/46); [#47](https://github.com/voidbrain/Grover/pull/47) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---

### <a id="f-019"></a>[✨ F-019](#top)

**Install Grover as a web app on the phone**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔹 P3 | 🟢 Small | 0.25 h owner | — | — | 🤖 | — | — |

💻 **→** Next: F-019-T01 — Web app manifest and icons (Implemented; verification pending).

| | |
|---|---|
| **Issue** | The client is a plain web page: it cannot be added to the home screen as an app with its own icon and window. The owner asked on 2026-11-24 ("can be installed as webapp? notifications?"), and said notifications will be handled by NERV. |
| **Reproduce** | Open the client over `tailscale serve` on a phone: the browser offers only a bookmark, no install. |
| **Check** | A web app manifest (name, short name, icons from the favicon's design, theme colours from the STYLE-GUIDE tokens, `display: standalone`, start URL `/`) and a service worker that caches the app shell, so the installed app opens and shows the last snapshot (the client already caches it) while the hub is unreachable; API calls are never served from the cache. Installable from Chrome and Safari over the HTTPS `tailscale serve` address. No push notifications: alerts reach the owner through NERV (F-008). |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-019-t01"></a>F-019-T01 — Web app manifest and icons | 1 h | 0 h | 0 h | Implemented; verification pending | — | [F-019-T02](#f-019-t02) | 🤖 | [PR #31](https://github.com/voidbrain/Grover/pull/31) implementation and review fixes |
| 🟢 Small | <a id="f-019-t02"></a>F-019-T02 — Service worker for the app shell | 1.5 h | 0 h | 0 h | Implemented; verification pending | [F-019-T01](#f-019-t01) | [F-019-T03](#f-019-t03) | 🤖 | [PR #31](https://github.com/voidbrain/Grover/pull/31) implementation and review fixes |
| 🟢 Small | <a id="f-019-t03"></a>F-019-T03 — Owner installs the app on the phone | 0 h | 0 h | 0 h agent + 0.25 h owner | Ready | [F-019-T02](#f-019-t02) | — | ⏳ 🧑‍🔧 | — |
| 🟢 Small | **Total** | 2.5 h | 0 h (0 of 3 steps recorded) | 0.25 h owner | 0 of 3 completed | | | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-019.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-019-T01: [PR #31](https://github.com/voidbrain/Grover/pull/31) implementation and review fixes · F-019-T02: [PR #31](https://github.com/voidbrain/Grover/pull/31) implementation and review fixes. [#25](https://github.com/voidbrain/Grover/pull/25) (record); [#30](https://github.com/voidbrain/Grover/pull/30); [#33](https://github.com/voidbrain/Grover/pull/33) |
| Opened | 2026-11-24 |
| Verification | 2026-11-25: PR CI green on #31 and the main run after merge (1e892b4) green; the owner's install on the phone is pending. |
| Reviewed | 2026-11-24 |

</details>

---

### <a id="f-022"></a>[✨ F-022](#top)

**Turn on the dormant procedure settings: reviews, coverage enforcement, work usage, behaviour runner**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟢 Small | 1 h | — | — | 🤖 | — | — |

💻 **→** Next: F-022-T01 — Reviews, coverage enforcement, work usage and behaviour runner settings (Implemented; verification pending).

| | |
|---|---|
| **Issue** | The 2026-11-26 dormant-checks sweep (coordinator `docs/audits/2026-11-26-dormant-checks.md`, rows S1, S2, S3, S5) found no periodic reviews (`reviews` unset), coverage regressions that only warn (`coverage.enforce: false`), work-usage measurement off and no `behaviour.runner`. |
| **Reproduce** | `.harness.json` on `main` `080194c`: no `reviews`, `coverage.enforce: false`, `workUsage.enabled: false`, `behaviour` `{times: 3}`. |
| **Check** | `.harness.json` sets `reviews` (token, architecture, skills at 30 days), `coverage.enforce: true` (switched on by F-022-T04 once a current baseline is on `main`: under enforce the check reads the baseline from `origin/main`, so the PR that refreshes it cannot enforce it), `workUsage.enabled: true` and `behaviour.runner`; the first architecture review with its outside-landscape comparison is `docs/reviews/architecture/2026-11-26.md`; CI passes with enforcement on (or a real drop is fixed or recorded). First token and skills reviews: F-022-T03. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | PRs |
|---|---|---|---|---|---|---|---|---|
| 🟢 Small | <a id="f-022-t01"></a>F-022-T01 — Reviews, coverage enforcement, work usage and behaviour runner settings | 0.25 h | 0 h | 0 h | Implemented; verification pending | — | [F-022-T04](#f-022-t04) | [PR #50](https://github.com/voidbrain/Grover/pull/50) settings on |
| 🟢 Small | <a id="f-022-t02"></a>F-022-T02 — First architecture review with outside-landscape comparison | 0.5 h | 0 h | 0 h | Implemented; verification pending | — | — | [PR #50](https://github.com/voidbrain/Grover/pull/50) first architecture review |
| 🟢 Small | <a id="f-022-t03"></a>F-022-T03 — First token and skills reviews | 1 h | 0 h | 1 h | Planned | — | — | — |
| 🟢 Small | <a id="f-022-t04"></a>F-022-T04 — Turn coverage.enforce on | 0.25 h | 0 h | 0 h | Implemented; verification pending | [F-022-T01](#f-022-t01) | — | [PR #51](https://github.com/voidbrain/Grover/pull/51) coverage.enforce on |
| 🟢 Small | **Total** | 2 h | 0 h (0 of 4 steps recorded) | 1 h | 0 of 4 completed | | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-022.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-022-T01: [PR #50](https://github.com/voidbrain/Grover/pull/50) settings on · F-022-T02: [PR #50](https://github.com/voidbrain/Grover/pull/50) first architecture review · F-022-T04: [PR #51](https://github.com/voidbrain/Grover/pull/51) coverage.enforce on. [#50](https://github.com/voidbrain/Grover/pull/50); [#51](https://github.com/voidbrain/Grover/pull/51) |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-025"></a>[✨ F-025](#top)

**Second-platform CI: an arm64 job for the Pi agent**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟢 Small | 1 h | — | — | 🤖 | — | — |

💻 **→** Next: F-025-T01 — arm64 CI job for apps/agent (Planned).

| | |
|---|---|
| **Issue** | The Grover agent runs on a Raspberry Pi (arm64), while CI runs on Ubuntu x64 only, so a native-module or architecture difference reaches the Pi unseen. NERV runs Windows and macOS jobs; no other repository tests a second platform. Evidence: [NERV practices transfer report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md), inventory 11; class B item B2. Owner decision 2026-11-26 in chat: "NERV practices inventory accept all" (all 22 proposals of the [report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md); this record is proposal 20). |
| **Reproduce** | Read `.github/workflows/ci.yml`: every job has `runs-on: ubuntu-latest`. |
| **Check** | An `ubuntu-24.04-arm` job installs dependencies and runs the `apps/agent` tests on every PR, and a job failure fails CI (F-025-T01). |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | PRs |
|---|---|---|---|---|---|---|
| 🟢 Small | <a id="f-025-t01"></a>F-025-T01 — arm64 CI job for apps/agent | 1 h | 0 h | 1 h | Planned | [PR #52](https://github.com/voidbrain/Grover/pull/52) plan |
| 🟢 Small | **Total** | 1 h | 0 h (0 of 1 steps recorded) | 1 h | 0 of 1 completed | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-025.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-025-T01: [PR #52](https://github.com/voidbrain/Grover/pull/52) plan. [#52](https://github.com/voidbrain/Grover/pull/52) (plan); [report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md); owner decision 2026-11-26 |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-009"></a>[✨ F-009](#top)

**Browser tests and accessibility checks for the client**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟡 Medium | 3 h | — | — | 🤖 | — | — |

💻 **→** Next: F-009-T01 — Playwright against the dev stack: the dashboard renders the demo tent (Implemented; verification pending).

| | |
|---|---|
| **Issue** | The client has unit tests only; no browser test exercises the dashboard against a running hub, and the AXE requirement in the Angular rules is unchecked. |
| **Reproduce** | `npm run test:client` runs Vitest only; CI has no browser job. |
| **Check** | A Playwright suite starts `npm run dev`, checks the dashboard renders the demo room, runs a pump and switches the mode, and passes an axe scan; CI runs it. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | PRs |
|---|---|---|---|---|---|---|---|---|
| 🟢 Small | <a id="f-009-t01"></a>F-009-T01 — Playwright against the dev stack: the dashboard renders the demo tent | 2 h | 0 h | 0 h | Implemented; verification pending | — | [F-009-T02](#f-009-t02) | [PR #48](https://github.com/voidbrain/Grover/pull/48) npm run e2e and the dashboard test |
| 🟡 Medium | <a id="f-009-t02"></a>F-009-T02 — Browser scenarios: run a pump, switch the mode, axe scan | 2 h | 0 h | 2 h | Planned | [F-009-T01](#f-009-t01) | [F-009-T03](#f-009-t03) | — |
| 🟢 Small | <a id="f-009-t03"></a>F-009-T03 — Run the browser suite in CI | 1 h | 0 h | 1 h | Planned | [F-009-T02](#f-009-t02) | — | — |
| 🟡 Medium | **Total** | 5 h | 0 h (0 of 3 steps recorded) | 3 h | 0 of 3 completed | | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-009.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-009-T01: [PR #48](https://github.com/voidbrain/Grover/pull/48) npm run e2e and the dashboard test. [#30](https://github.com/voidbrain/Grover/pull/30); [#48](https://github.com/voidbrain/Grover/pull/48) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---

### <a id="f-021"></a>[✨ F-021](#top)

**Full audit and audit enforcement**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟡 Medium | 3.5 h | — | — | 🤖 | — | — |

💻 **→** Next: F-021-T01 — Next audit as kind full (Planned).

| | |
|---|---|
| **Issue** | Grover has a rebuild baseline (2026-11-24) and a delivery report (2026-11-25, scoped), but no report of manifest kind `full`, and `audit.enforce` is off. The 2026-11-26 cross-project audit (coordinator, docs/audits/2026-11-26-cross-project.md, proposal 16) proposes a full audit, then enforcement. |
| **Reproduce** | No `docs/audits/*.audit.json` has `"kind": "full"`; `.harness.json` has `"audit": {"enforce": false}`. |
| **Check** | A report with manifest `kind: full` passes `npm run check:audits`, and `audit.enforce` is true. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks |
|---|---|---|---|---|---|---|---|
| 🟡 Medium | <a id="f-021-t01"></a>F-021-T01 — Next audit as kind full | 3 h | 0 h | 3 h | Planned | — | [F-021-T02](#f-021-t02) |
| 🟢 Small | <a id="f-021-t02"></a>F-021-T02 — Turn audit.enforce on | 0.5 h | 0 h | 0.5 h | Planned | [F-021-T01](#f-021-t01) | — |
| 🟡 Medium | **Total** | 3.5 h | 0 h (0 of 2 steps recorded) | 3.5 h | 0 of 2 completed | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-021.md)

| Field | Value |
|---|---|
| PR / evidence | [#49](https://github.com/voidbrain/Grover/pull/49) |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-023"></a>[✨ F-023](#top)

**Axe accessibility pass per main route in the browser suite**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟡 Medium | 4 h | — | — | 🤖 | — | — |

💻 **→** Next: F-023-T01 — Axe pass per main route in the Playwright e2e (Planned).

| | |
|---|---|
| **Issue** | NERV, bricks and openbando run axe in browser tests; Grover has no accessibility check beyond contrast, so a missing label, a keyboard trap or a bad ARIA role would pass CI. The Playwright suite exists (`e2e/dashboard.spec.ts`) but is not in CI (dormant check T3 of the 2026-11-26 sweep, "already known"). Evidence: [NERV practices transfer report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md), inventory 13; class A item A10; missing practice M12. Owner decision 2026-11-26 in chat: "NERV practices inventory accept all" (all 22 proposals of the [report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md); this record is proposal 17). |
| **Reproduce** | Read the CI workflow and the test scripts of Grover: no axe run. Main routes: `/`, `probes/:id`, `rooms/:id/map`, `plants/:id`, `setup`, `setup/rooms/:id`, `setup/calendars/:id`, `setup/plants`. |
| **Check** | One axe pass per main route (`/`, `probes/:id`, `rooms/:id/map`, `plants/:id`, `setup`, `setup/rooms/:id`, `setup/calendars/:id`, `setup/plants`) fails on serious and critical violations and reports moderate ones, proved by a seeded-violation fixture that fails first (F-023-T01); CI runs it on every PR (F-023-T02). |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | PRs |
|---|---|---|---|---|---|---|---|---|
| 🟡 Medium | <a id="f-023-t01"></a>F-023-T01 — Axe pass per main route in the Playwright e2e | 2.5 h | 0 h | 2.5 h | Planned | — | [F-023-T02](#f-023-t02) | [PR #52](https://github.com/voidbrain/Grover/pull/52) plan |
| 🟡 Medium | <a id="f-023-t02"></a>F-023-T02 — Put the e2e suite, with axe, into CI | 1.5 h | 0 h | 1.5 h | Planned | [F-023-T01](#f-023-t01) | — | [PR #52](https://github.com/voidbrain/Grover/pull/52) plan |
| 🟡 Medium | **Total** | 4 h | 0 h (0 of 2 steps recorded) | 4 h | 0 of 2 completed | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-023.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-023-T01: [PR #52](https://github.com/voidbrain/Grover/pull/52) plan · F-023-T02: [PR #52](https://github.com/voidbrain/Grover/pull/52) plan. [#52](https://github.com/voidbrain/Grover/pull/52) (plan); [report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md); owner decision 2026-11-26 |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-024"></a>[✨ F-024](#top)

**Threat map with the NERV checker**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟡 Medium | 2.5 h | — | — | 🤖 | — | — |

💻 **→** Next: F-024-T01 — Threat-map checker with the closed-gap rule (Planned).

| | |
|---|---|
| **Issue** | Grover: an agent app: the hub reads probe data and an LLM-facing MCP server is planned (nerv:F-123), so external input can reach a model or a tool. NERV keeps a threat map (OWASP Agentic, LLM and MCP top 10 rows, each citing a test or a gap record) and a checker (`tools/check-threat-map.mjs`, `docs/security/agentic-threats.md`); no other repository has either. NERV's map still cites closed records as gaps (report N6), so the checker here also fails on a gap that cites a closed record. Evidence: [NERV practices transfer report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md), inventory 10; class B item B1; N6. Owner decision 2026-11-26 in chat: "NERV practices inventory accept all" (all 22 proposals of the [report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md); this record is proposal 18). |
| **Reproduce** | Search Grover for a threat map or a security page naming prompt injection, tool or key misuse: none. |
| **Check** | A short threat map lists each applicable Agentic, LLM and MCP top 10 risk with the test or the gap record that covers it, and a checker in CI fails on a row without either and on a gap that cites a closed record (F-024-T01, F-024-T02). |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | PRs |
|---|---|---|---|---|---|---|---|---|
| 🟢 Small | <a id="f-024-t01"></a>F-024-T01 — Threat-map checker with the closed-gap rule | 1 h | 0 h | 1 h | Planned | — | [F-024-T02](#f-024-t02) | [PR #52](https://github.com/voidbrain/Grover/pull/52) plan |
| 🟡 Medium | <a id="f-024-t02"></a>F-024-T02 — Write the threat map | 1.5 h | 0 h | 1.5 h | Planned | [F-024-T01](#f-024-t01) | — | [PR #52](https://github.com/voidbrain/Grover/pull/52) plan |
| 🟡 Medium | **Total** | 2.5 h | 0 h (0 of 2 steps recorded) | 2.5 h | 0 of 2 completed | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-024.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-024-T01: [PR #52](https://github.com/voidbrain/Grover/pull/52) plan · F-024-T02: [PR #52](https://github.com/voidbrain/Grover/pull/52) plan. [#52](https://github.com/voidbrain/Grover/pull/52) (plan); [report](https://github.com/voidbrain/coordinator/blob/main/docs/reviews/2026-11-26-nerv-practices-transfer.md); owner decision 2026-11-26 |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-028"></a>[✨ F-028](#top)

**Timed switch: "spegni il ventilatore per 2 ore", reverted by the hub**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🔴 Large | 4.5 h | [F-027-T02](#f-027-t02) | — | 🤖 | — | — |

💻 **→** Next: F-028-T01 — Design the timed switch in docs/DESIGN.md (Planned).

| | |
|---|---|
| **Issue** | Owner decision 2026-11-26 in chat: "yes to both", including a timed switch in Grover ("spegni il ventilatore per 2 ore") via MCP behind NERV's approval. `grover_switch` takes only `actuatorId` and `on` (`apps/hub/src/mcp.ts`), so a timed request can only switch and leave it. The owner uses all modules in Italian. |
| **Reproduce** | Ask NERV "spegni il ventilatore per 2 ore": at best the fan goes off and stays off; nothing turns it back on. |
| **Check** | A written design (F-028-T01); the hub stores the timer and reverts on time even with NERV offline and after a hub restart, cancels on a later command, retries and alerts when the agent is offline (F-028-T02); `grover_switch` gains an optional bounded `durationMinutes`, still a hardware tool behind NERV's approval, with the timer shown and cancellable in the client (F-028-T03); grover-v1 cases in Italian and English (F-028-T04). |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | PRs |
|---|---|---|---|---|---|---|---|---|
| 🟢 Small | <a id="f-028-t01"></a>F-028-T01 — Design the timed switch in docs/DESIGN.md | 0.5 h | 0 h | 0.5 h | Planned | — | [F-028-T02](#f-028-t02) | [PR #56](https://github.com/voidbrain/Grover/pull/56) plan |
| 🟡 Medium | <a id="f-028-t02"></a>F-028-T02 — Hub timers: store, revert, cancel, restart | 2 h | 0 h | 2 h | Planned | [F-028-T01](#f-028-t01) | [F-028-T03](#f-028-t03) | [PR #56](https://github.com/voidbrain/Grover/pull/56) plan |
| 🟡 Medium | <a id="f-028-t03"></a>F-028-T03 — MCP argument, REST and client: set, show and cancel a timer | 1.5 h | 0 h | 1.5 h | Planned | [F-028-T02](#f-028-t02) | [F-028-T04](#f-028-t04) | [PR #56](https://github.com/voidbrain/Grover/pull/56) plan |
| 🟢 Small | <a id="f-028-t04"></a>F-028-T04 — grover-v1 timed cases, Italian and English | 0.5 h | 0 h | 0.5 h | Planned | [F-028-T03](#f-028-t03), [F-027-T02](#f-027-t02) | — | [PR #56](https://github.com/voidbrain/Grover/pull/56) plan |
| 🔴 Large | **Total** | 4.5 h | 0 h (0 of 4 steps recorded) | 4.5 h | 0 of 4 completed | | | |

<details>
<summary>Next action, estimates and evidence</summary>

[Full notes & evidence](work/records/F-028.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-028-T01: [PR #56](https://github.com/voidbrain/Grover/pull/56) plan · F-028-T02: [PR #56](https://github.com/voidbrain/Grover/pull/56) plan · F-028-T03: [PR #56](https://github.com/voidbrain/Grover/pull/56) plan · F-028-T04: [PR #56](https://github.com/voidbrain/Grover/pull/56) plan. Plan: [#56](https://github.com/voidbrain/Grover/pull/56) |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-020"></a>[✨ F-020](#top)

**Adopt 🧱 bricks in the client**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟣 Very large | 14 h agent + 0.5 h owner | `bricks:F-003-T01`, `bricks:F-003-T02`, `bricks:F-003-T04`, `bricks:F-003-T06`, `bricks:F-003-T05` | — | ⏳ | — | — |

💻 **→** Next: F-020-T03 — Primitives: buttons, inputs, selects, switch and badges (Planned).

| | |
|---|---|
| **Issue** | `apps/client` (Angular 22) styles and builds every control itself: its own tokens in `src/styles.scss`, global buttons, fields, switch and segmented control, and per-page cards and tiles. The solution's shared Angular UI library 🧱 bricks (`voidbrain/bricks`, package `@voidbrain/bricks`: tokens primitive → semantic → component, themes base, plain and eva, foundations, components, patterns, genUI surfaces, a live-view helper) is being built (coordinator [coordinator:F-012](https://github.com/voidbrain/coordinator/blob/main/docs/BACKLOG.md#f-012)). Owner request 2026-11-25. Rules: Grover restyles by theme, never by overriding a bricks component; a component joins bricks only once a project needs it; one-offs stay here. |
| **Reproduce** | `apps/client/src/styles.scss` defines `--bg`, `--surface`, `--accent`, `--ok`/`--warn`/`--bad`, radii, spacing and font locally; `package.json` has no `@voidbrain/bricks`. |
| **Check** | The client pins one `@voidbrain/bricks` release and takes its tokens with a Grover theme (light and dark, the current green palette); every piece mapped below uses its bricks token, component or pattern, with no local override of a bricks component; Grover-only pieces stay and are listed in `docs/STYLE-GUIDE.md`; each generic piece bricks lacked is a merged bricks PR that the client then uses; client specs, build and CI pass; the owner's look on phone and desktop. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟡 Medium | <a id="f-020-t03"></a>F-020-T03 — Primitives: buttons, inputs, selects, switch and badges | 3 h | 0 h | 3 h | Planned | `bricks:F-003-T01` | [F-020-T04](#f-020-t04) | ⏳ 🤖 | — |
| 🟡 Medium | <a id="f-020-t04"></a>F-020-T04 — Setup pages: form field, data table, card and confirm dialog | 3 h | 0 h | 3 h | Planned | [F-020-T03](#f-020-t03), `bricks:F-003-T02`, `bricks:F-003-T04`, `bricks:F-003-T06` | [F-020-T05](#f-020-t05) | ⏳ 🤖 | — |
| 🟡 Medium | <a id="f-020-t05"></a>F-020-T05 — Dashboard and room card: card, status rows, empty state, dialog | 3 h | 0 h | 3 h | Planned | [F-020-T04](#f-020-t04), `bricks:F-003-T04`, `bricks:F-003-T05` | [F-020-T06](#f-020-t06) | ⏳ 🤖 | — |
| 🟡 Medium | <a id="f-020-t06"></a>F-020-T06 — Plant page, probe page and rig map on bricks | 2 h | 0 h | 2 h | Planned | [F-020-T05](#f-020-t05) | [F-020-T07](#f-020-t07) | ⏳ 🤖 | — |
| 🟡 Medium | <a id="f-020-t07"></a>F-020-T07 — Contribute segmented control and stat tile to bricks, then use them | 3 h | 0 h | 3 h | Planned | [F-020-T06](#f-020-t06) | [F-020-T08](#f-020-t08) | ⏳ 🤖 | — |
| 🟢 Small | <a id="f-020-t08"></a>F-020-T08 — Owner: look at the client on bricks, phone and desktop | 0 h | 0 h | 0 h agent + 0.5 h owner | Planned | [F-020-T07](#f-020-t07) | — | ⏳ 🧑‍🔧 | — |
| 🟣 Very large | **Total** | 17 h | 0 h (0 of 8 steps recorded) | 14 h agent + 0.5 h owner | 2 of 8 completed | | | | |

<details><summary>Done steps (2)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-020-t01"></a>F-020-T01 — Check the bricks mapping against its first release | 1 h | 0 h | Completed | [PR #41](https://github.com/voidbrain/Grover/pull/41) mapping check |
| — | <a id="f-020-t02"></a>F-020-T02 — Pin @voidbrain/bricks and adopt its tokens with a Grover theme | 2 h | 0 h | Completed | [PR #42](https://github.com/voidbrain/Grover/pull/42) tokens and Grover theme |

</details>

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-020.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-020-T01: [PR #41](https://github.com/voidbrain/Grover/pull/41) mapping check · F-020-T02: [PR #42](https://github.com/voidbrain/Grover/pull/42) tokens and Grover theme. [#40](https://github.com/voidbrain/Grover/pull/40) (record); [#41](https://github.com/voidbrain/Grover/pull/41); [#42](https://github.com/voidbrain/Grover/pull/42) |
| Opened | 2026-11-25 |
| Verification | Pending |
| Reviewed | 2026-11-25 |

</details>

---
### <a id="b-009"></a>[🐞 B-009](#top)

**Eight Dependabot PRs from 2021 to 2023 still open against the removed v1 tree**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟢 Small | 0.25 h agent + 0.25 h owner | — | — | ⏳ | — | 🤔 |

🧑 **→** Next: from tasks.

| | |
|---|---|
| **Issue** | PRs #3, #8, #9, #10, #11, #12, #13 and #14 (Dependabot, 2021-08 to 2023-03) bump packages of the v1 app, whose files the v2 rebuild removed (`0762df1`). Each keeps a `dependabot/npm_and_yarn/*` branch. They cannot be merged meaningfully, show up in every open-PR listing and in `gh pr list`, and the last Dependabot security job (2026-11-24, run 45425982568) failed on the removed `/CLIENT-ANGULAR/redneck` directory. All 41 Dependabot alerts are fixed; Dependabot security updates stay enabled for the current tree. Found by the delivery audit of 2026-11-25. |
| **Reproduce** | `gh pr list -R voidbrain/Grover --state open`: eight Dependabot PRs on the v1 paths. |
| **Check** | The owner decided; if approved, the eight PRs are closed with a comment naming this record and their branches deleted; `gh pr list` shows no v1 Dependabot PR. |

**Steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who |
|---|---|---|---|---|---|---|---|:---:|
| 🟢 Small | <a id="b-009-t01"></a>B-009-T01 — Owner decides on closing the eight v1 Dependabot PRs | 0 h | 0 h | 0 h agent + 0.25 h owner | Ready | — | [B-009-T02](#b-009-t02) | [🤔](decisions/v1-dependabot-prs.md) |
| 🟢 Small | <a id="b-009-t02"></a>B-009-T02 — Close the v1 Dependabot PRs and delete their branches | 0.25 h | 0 h | 0.25 h | Planned | [B-009-T01](#b-009-t01) | — | ⏳ 🤖 |
| 🟢 Small | **Total** | 0.25 h | 0 h (0 of 2 steps recorded) | 0.25 h agent + 0.25 h owner | 0 of 2 completed | | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/B-009.md)

| Field | Value |
|---|---|
| PR / evidence | [#37](https://github.com/voidbrain/Grover/pull/37) |
| Opened | 2026-11-25 |
| Verification | Pending |
| Reviewed | 2026-11-25 |

</details>

---
### <a id="b-013"></a>[🐞 B-013](#top)

**Two imported old records on the Calvary hub need the owner's word: the placeholder strain '–' and Dos Si Dos 33's dates**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🔴 Open | 🔹 P3 | 🟢 Small | 0.25 h agent + 0.25 h owner | — | — | ⏳ | — | 🤔 |

🧑 **→** Next: [🤔](work/records/B-013.md) B-013-T01 — Owner decides what to do with the placeholder strain '–' and Dos Si Dos 33's dates (Planned).

| | |
|---|---|
| **Issue** | Found by the owner's import on the Calvary hub, 2026-11-26 ([F-012](work/records/F-012.md), F-012-T02). (1) The old dump has a strain named '–' (old id 20), a placeholder; it was imported as a strain with id `item` and name '–', and two old plants use it: legacy-1 and legacy-4 (both started 2021-10-01, bloom 2022-01-30), whose old breeder id 89 is unknown. The import now names such a strain `legacy-strain-20` (F-012-T03), but the hub already holds `item`. (2) Old plant legacy-8, Dos Si Dos 33, has bloom 2022-04-01 before its start 2022-06-04: the old record says so; nothing was invented. Nothing was changed on the hub. |
| **Reproduce** | On the hub, Setup → Plants and strains: the strain '–' and the plants "– (old #1)" and "– (old #4)"; the plant "Dos Si Dos 33 (old #8)" with its dates. Or the MCP tool `grover_plants`. |
| **Check** | The owner's choice for each question is recorded here; if it changes data, a backup of the hub database is taken first and the change is applied and read back (`grover_plants`). |

**Steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who |
|---|---|---|---|---|---|---|---|:---:|
| 🟢 Small | <a id="b-013-t01"></a>B-013-T01 — Owner decides what to do with the placeholder strain '–' and Dos Si Dos 33's dates | 0 h | 0 h | 0 h agent + 0.25 h owner | Planned | — | [B-013-T02](#b-013-t02) | [🤔](work/records/B-013.md) |
| 🟢 Small | <a id="b-013-t02"></a>B-013-T02 — Apply the owner's choice on the Calvary hub and read it back | 0.25 h | 0 h | 0.25 h | Planned | [B-013-T01](#b-013-t01) | — | ⏳ 🤖 |
| 🟢 Small | **Total** | 0.25 h | 0 h (0 of 2 steps recorded) | 0.25 h agent + 0.25 h owner | 0 of 2 completed | | | |

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/B-013.md)

| Field | Value |
|---|---|
| PR / evidence | Opened with the F-012-T03 fixes |
| Opened | 2026-11-26 |
| Verification | Pending |
| Reviewed | 2026-11-26 |

</details>

---
### <a id="f-017"></a>[✨ F-017](#top)

**Nutrient colours: each supply tank in its nutrient's real colour**

| Status | Priority | Effort | Remaining | Depends on | Unlocks | Agent | Procedures | Decisions |
|---|---|---|---|---|---|:---:|:---:|:---:|
| 🟡 Implemented | 🔹 P3 | 🟢 Small | 0.5 h agent + 0.25 h owner | — | — | ⏳ | 🧑‍🔧 | — |

🧑 **→** Next: [🧑‍🔧](acceptance/dev-stack.md#nutrient-colours) F-017-T03 — Owner picks the nutrient colours (Ready).

| | |
|---|---|
| **Issue** | The old app gave each nutrient (Doses page) a colour matching the real product, so doses read at a glance. The new tanks (water, grow, micro, bloom, ripen, pH down) have no colour. Requested by the owner on 2026-11-24 ("colours are nice because they rely on real nutrient colour"). |
| **Reproduce** | `npm run dev`: supply tanks, their pumps and doses show no colour. |
| **Check** | Each supply tank has a colour chosen in Setup (a palette of nutrient-like colours plus a custom value, with defaults per role), stored with the tent (a migration), and used for the tank, its pump, dose bars and chart series; text on a colour keeps STYLE-GUIDE contrast in both themes. A client spec covers the editor. |

**Feature steps**

| Effort | Step | Estimate | Actual | Remaining | Status | Depends on | Unlocks | Who | PRs |
|---|---|---|---|---|---|---|---|:---:|---|
| 🟢 Small | <a id="f-017-t03"></a>F-017-T03 — Owner picks the nutrient colours | 0 h | 0 h | 0 h agent + 0.25 h owner | Ready | — | [F-017-T04](#f-017-t04) | [🧑‍🔧](acceptance/dev-stack.md#nutrient-colours) | — |
| 🟢 Small | <a id="f-017-t04"></a>F-017-T04 — Record the colour choice; fix what it found | 0.5 h | 0 h | 0.5 h | Planned | [F-017-T03](#f-017-t03) | — | ⏳ 🤖 | — |
| 🟢 Small | **Total** | 3.5 h | 0 h (0 of 4 steps recorded) | 0.5 h agent + 0.25 h owner | 2 of 4 completed | | | | |

<details><summary>Done steps (2)</summary>

| Effort | Step | Estimate | Actual | Status | PRs |
|---|---|---|---|---|---|
| — | <a id="f-017-t01"></a>F-017-T01 — A colour per supply tank, stored with the tent | 1 h | 0 h | Completed | [PR #28](https://github.com/voidbrain/Grover/pull/28) implementation |
| — | <a id="f-017-t02"></a>F-017-T02 — Colour editor and colours on tanks, pumps, dose bars and charts | 2 h | 0 h | Completed | [PR #28](https://github.com/voidbrain/Grover/pull/28) implementation |

</details>

<details>
<summary>Next action, estimates and PR history</summary>

[Full notes & evidence](work/records/F-017.md)

| Field | Value |
|---|---|
| PR / evidence | Steps: F-017-T01: [PR #28](https://github.com/voidbrain/Grover/pull/28) implementation · F-017-T02: [PR #28](https://github.com/voidbrain/Grover/pull/28) implementation. [#24](https://github.com/voidbrain/Grover/pull/24) (record), [#28](https://github.com/voidbrain/Grover/pull/28), [#30](https://github.com/voidbrain/Grover/pull/30) |
| Opened | 2026-11-24 |
| Verification | 2026-11-24: PR CI green on #28 and the main run after merge (c5e0bf3) green; the owner's choice of colours is pending. |
| Reviewed | 2026-11-24 |

</details>

---
## Other changes

**Reconciliation, 2026-11-26 (main `2eceb42`).** PRs #37-#44 merged on green PR CI: B-008, B-009, B-010, F-020 and B-006 work as named in their records. Harness reconciled from v10.20.0 to v10.21.4 (#45): F-099 closed.

Earlier entries: [reconciliation log](archive/reconciliation-2026.md).

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
