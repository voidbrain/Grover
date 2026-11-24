# Grover design

How Grover works today, checked against the code. Planned work lives in the [backlog](BACKLOG.md), not here. Numbers (phase ranges, doses, priors) live in the code and are linked, not copied.

## Parts

```
           tailnet (Tailscale: MagicDNS + HTTPS via `tailscale serve`)
 ┌──────────────┐   HTTP /api, WebSocket /api/live   ┌──────────────────────────────┐
 │ Client       │ ─────────────────────────────────▶ │ HUB  apps/hub                │
 │ Angular      │       served by the hub            │ SQLite: the source of truth  │
 └──────────────┘                                    │ Commands, dosing control     │
 ┌──────────────┐   MCP /mcp (streamable HTTP)       │ embedded MQTT broker (aedes) │
 │ NERV         │ ─────────────────────────────────▶ │                              │
 └──────────────┘                                    └──────────────┬───────────────┘
                                                        MQTT 1883   │  agents connect out
                                                                    ▼
                                                     AGENT apps/agent (one per Pi)
                                                     drivers · safety · schedules · outbox
```

- **Contracts** (`packages/contracts`): every shape that crosses a boundary, as zod schemas, plus the pure logic both sides need (schedule rules, the dosing model). `@grover/contracts/kinds` is the zod-free subset the browser imports.
- **Hub** (`apps/hub`): one process. `Store` (SQLite through `node:sqlite`, migrations in `db.ts`), `AgentLink` (broker, auth, topic ACLs, configs, request/ack commands), `Commands` (the only way to move hardware), `Control` (dose log, model, auto-dose), `http.ts` (API, live socket, MCP, static client).
- **Agent** (`apps/agent`): one per Raspberry Pi, one room each. `Actuators` (safety), drivers (`drivers/mock.ts`, `drivers/hardware.ts`), `Outbox` (durable event queue), `Agent` (config, schedule runner, commands).
- **Client** (`apps/client`): dashboard per room (probes against the phase range, switches, pumps, mode, stop, dose suggestion), a probe history chart, and Setup: rooms, pots, probes, actuators, schedules, grow calendars and agent registration. It reads `/api/snapshot`, follows `/api/live` and writes through the same `PUT`/`DELETE` routes as any API client; forms are checked with the contracts schemas before sending, and the hub checks again.

Hub and agent are separate processes even on the same Pi, so the agent's safety does not depend on the hub staying up.

## Domain

Defined in [`domain.ts`](../packages/contracts/src/domain.ts) and [`kinds.ts`](../packages/contracts/src/kinds.ts).

- **Room**: one controlled space with one reservoir and one agent. Has a mode, `autoDose`, reservoir litres and a grow calendar with a start date.
- **Pot**: a plant position in a room. Probes and actuators may belong to a pot or to the room (the reservoir).
- **Probe**: air temperature, water temperature, water level, pH or EC, with a binding that tells the agent which driver to use.
- **Actuator**: a *switch* (light, fan, water loop: holds a state) or a *pump* (water, pH down, grow, micro, bloom, ripen, transfer: bounded runs only). Pumps have `maxRunMs` (hard cap) and `mlPerSecond` (calibration, needed to dose by volume).
- **Schedule**: a target (probe or actuator) and a rule: `window` (on between two times, may wrap midnight), `at` (listed times), `every` (every N minutes from midnight). Times are local to the hub's time zone, which travels in the agent config.
- **Calendar**: ordered phases, each with days, light hours, dose per 10 L and ranges for EC, pH, water temperature and level. The default calendar comes from the original Grover tables: [`DEFAULT_CALENDAR`](../packages/contracts/src/dosing.ts).
- **Operating modes**: `normal` (everything runs), `silent` (probes and lights only), `off` (everything off, no readings).

## Protocol (hub ↔ agent)

[`mqtt.ts`](../packages/contracts/src/mqtt.ts). Agents authenticate with username = client id = agent id and a token the hub issued (`POST /api/agents/<id>/token`; only its hash is stored).

| Topic | Direction | What |
|---|---|---|
| `grover/agents/<id>/status` | agent → hub | retained; last will = offline. Mode, running actuators, hash of the config it runs. |
| `grover/agents/<id>/events` | agent → hub | readings, actuations, faults; QoS 1, from the durable outbox. |
| `grover/agents/<id>/config` | hub → agent | retained; everything the agent needs to run alone. Republished on every connect and setup change. |
| `grover/agents/<id>/commands` | hub → agent | `read`, `run` (bounded), `switch`, `stop_all`. |
| `grover/agents/<id>/acks` | agent → hub | one per command; the hub waits up to `GROVER_COMMAND_TIMEOUT_MS`. |

The hub stores each event once (readings keyed by probe and time, actuations by actuator, time and state), so the agent can replay its outbox safely after an outage. `configHash` lets the client show whether the agent runs the current settings.

## Safety

Enforced on the agent ([`actuators.ts`](../apps/agent/src/actuators.ts)) whatever the hub sends, and checked again by the hub ([`commands.ts`](../apps/hub/src/commands.ts)) so refusals come back early with a reason:

- Pumps only run bounded: a run is clamped to `maxRunMs`; a pump cannot be switched on.
- One pump at a time (shared supply; a dose must not mix mid-measurement). Runs queue.
- A watchdog on every tick forces off any pump past its cap, even if its timer was lost.
- Config change, `stop_all`, `off` mode, SIGINT/SIGTERM and uncaught errors turn everything off. Drivers start with outputs off.
- `silent` keeps only lights; `off` refuses everything.
- Window schedules act on edges only, so a manual switch holds until the next window boundary.

## Offline behaviour

- **Agent without hub**: keeps its cached config (`<state>/config.json`), runs schedules and windows, queues events in `<state>/outbox.sqlite` (capped at 200 000 events) and sends them when the hub is back. No automatic dosing.
- **Client without hub**: shows the last snapshot (browser storage) with an "Offline" badge; actions are disabled. Setup is not editable offline.
- **Hub without agent**: commands answer 503 (agent offline); the dashboard shows when the agent was last seen.

## Setup rules

- Deleting a probe or actuator deletes the schedules that target it; deleting a room deletes its pots, probes, actuators and their schedules (readings and actuations stay in history). A calendar a room uses cannot be deleted (409). An agent runs one room at most (409).
- Issuing a token for an existing agent replaces it and drops the agent's MQTT connection; removing an agent revokes its token and leaves its room without one.

## Dosing

[`dosing.ts`](../packages/contracts/src/dosing.ts) and [`control.ts`](../apps/hub/src/control.ts).

- Model: ΔEC = k_ec · (mL nutrient / L) and ΔpH = −k_ph · (mL pH-down / L), per room. Coefficients are fitted by least squares through the origin, shrunk towards priors (`DOSE_PRIORS`) so a few noisy samples cannot swing them. Samples where the value moved the wrong way are ignored.
- Samples: every pump run on a calibrated room-level nutrient or pH-down pump is logged with the reading before it; the first reading at least 10 minutes later closes it as "after". Runs close together merge into one sample.
- Correction: needs fresh (≤1 h) EC **and** pH readings. Nutrients first, in the phase's dose ratio, aiming at the middle of the EC range; pH only when EC is in range. Each step applies 70 % of the computed amount and is capped per pump. Flushing phases get nothing; EC too high or pH too low are reported, not dosed.
- `autoDose` (off by default) runs one step after a reading, at most once per `GROVER_AUTODOSE_COOLDOWN_MS` (30 min). Otherwise the hub only suggests (`GET /api/rooms/<id>/dose`) and a person or NERV applies it.

## NERV

NERV drives Grover through the hub's MCP endpoint (`/mcp`, streamable HTTP, stateless) on the tailnet. Tools ([`mcp.ts`](../apps/hub/src/mcp.ts)):

| Tool | Changes hardware |
|---|---|
| `grover_overview`: rooms, agents, phase, probes with latest readings, actuators | no |
| `grover_readings`, `grover_history`, `grover_dose_suggestion` | no |
| `grover_read_probe` | takes a reading |
| `grover_run_pump`, `grover_switch`, `grover_apply_dose`, `grover_set_mode` | yes |
| `grover_stop_all` | yes (always safe) |

Tools that change hardware say so in their description and are annotated `readOnlyHint: false`, so NERV's gate can ask its owner first. They go through `Commands` like the UI, with source `mcp` in the log. Grover makes no model calls of its own: reasoning in language (explaining a trend, deciding whether to dose) happens in NERV with NERV's models, over these tools.

## Hardware

Bindings ([`hardware.ts`](../apps/agent/src/drivers/hardware.ts)): `ds18b20` (1-Wire, kernel w1-therm), `ads1115` (analog pH/EC/level over I²C; returns volts), `gpio` (via `pinctrl`), `mcp23017` (I²C expander outputs), `mock`. `hcsr04` is refused (Node cannot time microseconds). None of these has run on a device yet, and analog probes have no calibration from volts to pH/EC yet: see the backlog. Wiring notes and diagrams of the original build: [hardware/](hardware/).

## Configuration

Hub: `GROVER_DB`, `GROVER_HTTP_HOST` (default 127.0.0.1), `GROVER_HTTP_PORT` (8080), `GROVER_MQTT_HOST` (127.0.0.1), `GROVER_MQTT_PORT` (1883), `GROVER_CLIENT_DIR`, `GROVER_TZ`, `GROVER_COMMAND_TIMEOUT_MS`, `GROVER_AUTODOSE_COOLDOWN_MS` ([`config.ts`](../apps/hub/src/config.ts)). Agent: `GROVER_AGENT_ID`, `GROVER_AGENT_TOKEN`, `GROVER_HUB_MQTT`, `GROVER_AGENT_STATE`, `GROVER_DRIVERS` (`mock` or `hardware`) ([`config.ts`](../apps/agent/src/config.ts)).

## Tests

- `packages/contracts/test`: schedule rules and time zones, topics, config hash, model fitting, corrections, phase lookup.
- `apps/agent/test`: actuator safety (cap, one pump at a time, stop releases the queue, reload drops queued runs, watchdog).
- `apps/hub/test/e2e.test.ts`: a real hub and a real agent with mock drivers over MQTT: config delivery, reads, bounded runs and dose logging, refusals, mode changes, topic and credential checks, setup pushes, dose suggestion, MCP listing and a tool call, outbox drain.
- `apps/client`: shell rendering and the formatting helpers.
- Not covered: real drivers on a Pi, browser tests of the client, accessibility checks with a tool, long outages and reboots on a device.
