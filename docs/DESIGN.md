# Grover design

How Grover works today, checked against the code. Planned work lives in the [backlog](BACKLOG.md), not here. Numbers (phase ranges, doses, priors) live in the code and are linked, not copied.

## Parts

```
           tailnet (Tailscale: MagicDNS + HTTPS via `tailscale serve`)
 ┌──────────────┐   HTTP /api, WebSocket /api/live   ┌──────────────────────────────┐
 │ Client       │ ─────────────────────────────────▶ │ HUB  apps/hub                │
 │ Angular      │       served by the hub            │ SQLite: the source of truth  │
 └──────────────┘                                    │ Commands, feeds, alerts      │
 ┌──────────────┐   MCP /mcp (streamable HTTP)       │ embedded MQTT broker (aedes) │
 │ NERV         │ ─────────────────────────────────▶ │                              │
 └──────────────┘                                    └──────────────┬───────────────┘
                                                        MQTT 1883   │  agents connect out
                                                                    ▼
                                                     AGENT apps/agent (one per Pi)
                                                     drivers · safety · schedules · outbox
```

- **Contracts** (`packages/contracts`): every shape that crosses a boundary, as zod schemas, plus the pure logic both sides need (schedule rules, the feed planner, the dosing model). `@grover/contracts/kinds` is the zod-free subset the browser imports.
- **Hub** (`apps/hub`): one process. `Store` (SQLite through `node:sqlite`, migrations in `db.ts`), `AgentLink` (broker, auth, topic ACLs, configs, request/ack commands), `Commands` (single hardware actions), `Feeder` (plans and starts feeds, learns from them, auto-feed), `Alerts`, `http.ts` (API, live socket, MCP, static client).
- **Agent** (`apps/agent`): one per Raspberry Pi, one room each. `Actuators` (safety), `FeedRunner` (runs a feed step by step), drivers (`drivers/mock.ts` simulates the whole rig, `drivers/hardware.ts`), `Outbox` (durable event queue), `Agent` (config, schedule runner, commands).
- **Client** (`apps/client`): dashboard per tent (alerts, tent probes, tank levels, each pot with its readings against the phase range, last feed, feed preview and "Feed now", switches, manual pump runs, mode, stop), a probe history chart, and Setup: rooms, pots, probes, actuators, schedules, grow calendars and agent registration. It reads `/api/snapshot`, follows `/api/live` and writes through the same `PUT`/`DELETE` routes as any API client; forms are checked with the contracts schemas before sending, and the hub checks again.

Hub and agent are separate processes even on the same Pi, so the agent's safety does not depend on the hub staying up.

## Domain

Defined in [`domain.ts`](../packages/contracts/src/domain.ts) and [`kinds.ts`](../packages/contracts/src/kinds.ts).

The rig (confirmed by the owner, F-011):

```
 supply tanks (each with a level probe)          mixing tank (level probe)        pots (each: level probe,
 water · grow · micro · bloom · ripen · pH down ──supply pumps──▶  ▣  ──pot feed pump──▶ recirculation loop, pH/EC)
```

- **Room** (a tent): one agent; lights, fan and air temperature on schedules; a mode, `autoFeed`, a grow calendar with its day 1, and the mixing tank settings (`mixEmptyLevel`, `mixSettleSeconds`), the tap water's EC and pH, and `feedCooldownMinutes`.
- **Pot**: `liters` (when full, scales pH corrections), `feedLiters` (largest batch) and `litersPerCm` (to tell whether a batch fits). Its probes and pumps carry its id: a level probe, pH/EC (or the tent's shared pair), a feed pump (`pump_transfer`) and a recirculation pump (`water_loop`, on a 24 h window).
- **Probe**: air temperature, water temperature, water level, pH or EC, with a binding that tells the agent which driver to use. A level probe with a `tank` role measures a supply tank or the mixing tank. Any probe can have `alertBelow` / `alertAbove`.
- **Actuator**: a *switch* (light, fan, recirculation: holds a state) or a *pump* (bounded runs only): the six supply pumps into the mixing tank, and the pots' feed pumps. Pumps have `maxRunMs` (hard cap) and `mlPerSecond` (calibration, needed to dose by volume).
- **Schedule**: a target (probe or actuator) and a rule: `window` (on between two times, may wrap midnight), `at` (listed times), `every` (every N minutes from midnight). Times are local to the hub's time zone, which travels in the agent config.
- **Calendar**: ordered phases, each with days, light hours, dose per 10 L and ranges for EC, pH, water temperature and level. The default calendar comes from the original Grover tables, with ripen alone in its own phase and a plain-water Flush phase at the end: [`DEFAULT_CALENDAR`](../packages/contracts/src/dosing.ts).
- **Operating modes**: `normal` (everything runs), `silent` (probes and lights only), `off` (everything off, no readings).

## Protocol (hub ↔ agent)

[`mqtt.ts`](../packages/contracts/src/mqtt.ts). Agents authenticate with username = client id = agent id and a token the hub issued (`POST /api/agents/<id>/token`; only its hash is stored).

| Topic | Direction | What |
|---|---|---|
| `grover/agents/<id>/status` | agent → hub | retained; last will = offline. Mode, running actuators, hash of the config it runs. |
| `grover/agents/<id>/events` | agent → hub | readings, actuations, faults, feed progress; QoS 1, from the durable outbox. |
| `grover/agents/<id>/config` | hub → agent | retained; everything the agent needs to run alone. Republished on every connect and setup change. |
| `grover/agents/<id>/commands` | hub → agent | `read`, `run` (bounded), `switch`, `stop_all`, `feed` (a whole plan). |
| `grover/agents/<id>/acks` | agent → hub | one per command; the hub waits up to `GROVER_COMMAND_TIMEOUT_MS`. |

Protocol version 2 (feeds). The hub stores each event once (readings keyed by probe and time, actuations by actuator, time and state), so the agent can replay its outbox safely after an outage. `configHash` lets the client show whether the agent runs the current settings.

## Safety

Enforced on the agent ([`actuators.ts`](../apps/agent/src/actuators.ts)) whatever the hub sends, and checked again by the hub ([`commands.ts`](../apps/hub/src/commands.ts)) so refusals come back early with a reason:

- Pumps only run bounded: a run is clamped to `maxRunMs`, which every pump must have (above 0; the schema and the agent both refuse a pump without one); a pump cannot be switched on.
- One pump at a time (shared supply; a dose must not mix mid-measurement). Runs queue.
- A watchdog on every tick forces off any pump past its cap, even if its timer was lost.
- Config change, `stop_all`, `off` mode, SIGINT/SIGTERM and uncaught errors turn everything off and drop every queued run, including one whose relay is still switching on: nothing starts after a stop. Drivers start with outputs off; MCP23017 pins stay inputs until claimed and are set to their off level (high for active-low relays) before they become outputs and again at shutdown.
- A relay that fails to switch off stays reported on, and the watchdog retries it on every tick.
- No pump runs by hand while a feed runs (hub and agent both refuse).
- `silent` keeps only lights; `off` refuses everything.
- Window schedules act on edges only, so a manual switch holds until the next window boundary.
- A feed runs one at a time per agent; every check failure, failed reading, Stop all, mode change away from normal or hardware settings change aborts it with everything off and the reason reported.

## Who can reach the hub

The hub listens on loopback; `tailscale serve` publishes it to the tailnet. On top of that it refuses requests whose Host is not loopback or in `GROVER_ALLOWED_HOSTS` (DNS rebinding), whose browser Origin is foreign (cross-site requests and WebSockets), and POST/PUT without a JSON body (cross-site forms). MQTT needs a per-agent token and confines each agent to its own topics.

## Offline behaviour

- **Agent without hub**: keeps its cached config (`<state>/config.json`), runs schedules and windows, queues events in `<state>/outbox.sqlite` (capped at 200 000 events) and sends them when the hub is back. No feeds: they are planned by the hub.
- **Client without hub**: shows the last snapshot (browser storage) with an "Offline" badge; actions are disabled. Setup is not editable offline.
- **Hub without agent**: commands answer 503 (agent offline); the dashboard shows when the agent was last seen. A feed in progress when the agent goes offline is closed as aborted; so is one the agent's status says it is not running, and any left open when the hub restarts.

## Setup rules

- Deleting a probe or actuator deletes the schedules that target it; deleting a room deletes its pots, probes, actuators and their schedules (readings and actuations stay in history). A calendar a room uses cannot be deleted (409). An agent runs one room at most (409).
- Issuing a token for an existing agent replaces it and drops the agent's MQTT connection; removing an agent revokes its token and leaves its room without one.

## Feeds

[`feeding.ts`](../packages/contracts/src/feeding.ts) (planner), [`feeder.ts`](../apps/hub/src/feeder.ts) (hub), [`feed.ts`](../apps/agent/src/feed.ts) (agent).

- **Plan** (hub, pure). With V0 the pot's volume now (level × litres per cm) and V1 = V0 + water:
  - *Water*: top the pot up to the phase's maximum level, more when its EC is above range and needs diluting; never more than the pot can take or one batch (`feedLiters`). Without a level reading, only a small carrier batch.
  - *Nutrients*: enough to take the pot's EC, after the tap water dilutes it, to the middle of the EC range (`ecPerMlL`), split in the phase's grow:micro:bloom:ripen ratio; none while flushing; at most twice the phase's full-strength dose for V1. Without a fresh EC, the phase dose for the water added.
  - *pH down*: worked out last, on the pH expected after dilution and after the nutrients raise it (`phRisePerMlL`), down to the middle of the pH range (`phDownPerMlL`); none when that is already at or below it; at most 0.5 mL per litre in one feed (the next feed finishes the job).
  - *Mixing order*: water in portions between the additives (water, grow, water, micro, …, pH down, water), at least 0.1 L with each, so concentrates never meet undiluted. Runs longer than a pump's cap are split.
  - The tent's tap water EC and pH (`waterEc`, `waterPh`) enter every dilution. "Feed now" first takes new readings of the pot's level, EC and pH when they are older than 10 minutes. Refused with a reason when the pot is full, cannot take enough water to carry the additives, has no readings at all, or a pump is missing or uncalibrated.
- **Run** (agent): check every level in the plan (supply tanks above their `alertBelow`, mixing tank at or below `mixEmptyLevel`, pot below its maximum); pump each supply into the mixing tank, re-checking that tank first; settle; run the pot's feed pump in slices of up to 5 s until the mixing tank is empty, the pot is full or the time allowed (1.5 × the expected time with a mixing-tank probe) is used. A pot filled before the mix is gone leaves the rest in the mixing tank, so the next feed is refused until it is emptied.
- **Triggers**: "Feed now" (client), `grover_feed_pot` (NERV), or auto-feed (tent setting, off by default): after a reading, a pot whose level is below the phase minimum, EC below or pH above range, and that was not fed (or tried) within `feedCooldownMinutes`. One feed per tent at a time; only in normal mode with the agent online.
- **Learning**: each finished feed records the pot's volume, EC and pH before it, what went in, what the model expected, and the first readings at least 10 minutes after. The per-tent model (`dosing.ts`) takes out the dilution and fits EC per mL of nutrient, the nutrients' pH rise and pH down's drop per mL per litre, by least squares shrunk towards priors (`DOSE_PRIORS`).
- Supply pumps run by hand also fill the mixing tank.

## Alerts

[`alerts.ts`](../apps/hub/src/alerts.ts). Raised once and kept until the condition clears; listed on the dashboard, at `GET /api/alerts` and through `grover_alerts` (NERV delivers them).

- A reading below a probe's `alertBelow` or above its `alertAbove` (a low supply tank says "refill it").
- A feed that stopped partway, or an automatic feed that was refused (a refused manual feed answers with its reason instead).
- An agent offline.

## NERV

NERV drives Grover through the hub's MCP endpoint (`/mcp`, streamable HTTP, stateless) on the tailnet. Tools ([`mcp.ts`](../apps/hub/src/mcp.ts)):

| Tool | Changes hardware |
|---|---|
| `grover_overview`: rooms, agents, phase, pots, probes with latest readings, actuators, alerts | no |
| `grover_readings`, `grover_history`, `grover_alerts`, `grover_feeds`, `grover_feed_preview` | no |
| `grover_read_probe` | takes a reading |
| `grover_run_pump`, `grover_switch`, `grover_feed_pot`, `grover_set_mode` | yes |
| `grover_stop_all` | yes (always safe) |

Tools that change hardware say so in their description and are annotated `readOnlyHint: false`, so NERV's gate can ask its owner first. They go through `Commands` like the UI, with source `mcp` in the log. Grover makes no model calls of its own: reasoning in language (explaining a trend, deciding whether to feed) happens in NERV with NERV's models, over these tools.

## Hardware

Bindings ([`hardware.ts`](../apps/agent/src/drivers/hardware.ts)): `ds18b20` (1-Wire, kernel w1-therm), `ads1115` (analog pH/EC/level over I²C; returns volts), `gpio` (via `pinctrl`), `mcp23017` (I²C expander outputs), `mock`. `hcsr04` is refused (Node cannot time microseconds). None of these has run on a device yet, and analog probes have no calibration from volts to pH/EC yet: see the backlog. Wiring notes and diagrams of the original build: [hardware/](hardware/).

## Configuration

Hub: `GROVER_DB`, `GROVER_HTTP_HOST` (default 127.0.0.1), `GROVER_ALLOWED_HOSTS` (host names besides loopback, e.g. the Pi's tailnet name), `GROVER_ALLOWED_ORIGINS`, `GROVER_HTTP_PORT` (8080), `GROVER_MQTT_HOST` (127.0.0.1), `GROVER_MQTT_PORT` (1883), `GROVER_CLIENT_DIR`, `GROVER_TZ`, `GROVER_COMMAND_TIMEOUT_MS` ([`config.ts`](../apps/hub/src/config.ts)). Agent: `GROVER_AGENT_ID`, `GROVER_AGENT_TOKEN`, `GROVER_HUB_MQTT`, `GROVER_AGENT_STATE`, `GROVER_DRIVERS` (`mock` or `hardware`) ([`config.ts`](../apps/agent/src/config.ts)).

## Tests

- `packages/contracts/test`: schedule rules and time zones, topics, config hash, model fitting, feed planning (batch, doses, EC/pH adjustments, ripen and flush, splitting at caps, refusals), feed reasons, phase lookup.
- `apps/agent/test`: actuator safety (cap, one pump at a time, stop releases the queue, reload drops queued runs, watchdog); feed runs on the simulated rig (full feed, low tank, mixing tank not empty, pot full, cancel, unknown pump).
- `apps/hub/test/e2e.test.ts`: a real hub and a real agent with mock drivers over MQTT: config delivery, reads, bounded runs, refusals, mode changes, topic and credential checks, setup pushes, a feed end to end, a low tank aborting a feed with alerts, auto-feed and its cooldown, one feed per tent, MCP listing and a tool call, outbox drain. `apps/hub/test/setup.test.ts`: delete cascades and 409s.
- `apps/client`: shell rendering and the formatting helpers.
- Not covered: real drivers on a Pi, browser tests of the client, accessibility checks with a tool, long outages and reboots on a device.
