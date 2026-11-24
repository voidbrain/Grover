<!-- Written by tools/impact-map.mjs from the "impact" rows of .harness.json: change the rows, then run it. -->

# Impact map

What must follow a change, and what must run again after it (docs/agents/change-impact.md). `npm run check:freshness` lists, on every PR, the rows a branch sets off and the order to run them.

**More detail:** [Design](../DESIGN.md) (Architecture, protocol, dosing, safety, NERV integration) · [Code coverage](coverage.md) (Backend coverage per folder, from npm run coverage)

| Id | When these change | Made of (content) | This must follow | Command | Runs again after | Checked by |
|---|---|---|---|---|---|---|
| contracts | `packages/contracts/**` |  | The shared protocol and domain changed: hub, agent and client all compile against it. Bump PROTOCOL_VERSION for an incompatible MQTT change, and update docs/DESIGN.md. | `npm run typecheck && npm test && npm run build` |  | Type check of all three parts, the hub+agent end-to-end test and the client build |
| backend | `apps/hub/**`, `apps/agent/**`, `tools/dev.ts` |  | Run the backend suite (includes the hub+agent end-to-end test over real MQTT); reconcile docs/DESIGN.md and the README run and deploy sections. | `npm test` | contracts | node --test suites in packages/, apps/hub/test and apps/agent/test |
| client | `apps/client/**` |  | Build and test the client; the hub serves apps/client/dist/client/browser, so a deployed hub needs a fresh build. Reconcile docs/STYLE-GUIDE.md for UI changes. | `npm run build && npm run test:client` |  | Angular build and Vitest unit tests |
| mcp-tools | `apps/hub/src/mcp.ts`, `apps/hub/src/commands.ts` |  | The MCP tool surface NERV uses changed: update the tool table in docs/DESIGN.md ("NERV") and tell NERV's pack owner. | `npm test` | backend | MCP listing and call test in apps/hub/test/e2e.test.ts |
| work-items | `docs/work/**`, `docs/agents/model-profiles.json`, `tools/work-items.mjs`, `tools/task-claims.mjs` |  | Regenerate the source-owned ledger (npm run work:build), then the dependency and queue views; review task resources and owner pages. | `npm run work:build && npm run check:work` |  | check:work, check:backlog, check:dependencies and check:queue in CI |

## Content dependencies

What each output is made of, besides code: change one of these and the output is out of date.

| Output | Made of | Redo with |
|---|---|---|
| (none listed) | | |

## Value couplings

A value that lives in more than one place: change it in one, change it in all. Best kept by one shared source, else by a test.

| Value | Where | Kept equal by |
|---|---|---|
| Default grow calendar (phases, doses, EC/pH ranges) | `packages/contracts/src/dosing.ts` (DEFAULT_CALENDAR)<br>`docs/DESIGN.md` (Domain section: links DEFAULT_CALENDAR, quotes no numbers) | By hand: the design doc links the code and quotes no numbers it cannot check; contracts.test.ts pins fresh-mix volumes. |
| MQTT topics and message shapes | `packages/contracts/src/mqtt.ts` (topics, schemas, PROTOCOL_VERSION)<br>`docs/DESIGN.md` (Protocol section) | Both sides import the same module; the hub+agent end-to-end test covers every topic. |

## Outside the repository

What can change an output with no commit here, and how we would notice.

| What | Affects | Noticed by |
|---|---|---|
| Raspberry Pi OS (pinctrl, w1-therm, i2c), wiring and probe calibration | Hardware drivers in apps/agent/src/drivers/hardware.ts | Only on the device: no CI covers it (backlog record for the hardware bring-up) |
| Tailscale (MagicDNS, tailscale serve) and NERV's MCP client | Remote access to the hub and NERV control | Manual check after deploy |
