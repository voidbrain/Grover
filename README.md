# Grover

A local-first controller for a home hydroponic grow: it runs a tent's lights and fan on schedule, watches the supply tanks, and feeds each pot: it mixes a batch of water, nutrients and pH down for the pot's grow phase and its EC and pH, then pumps it into the pot, learning from each feed. It raises alerts when a tank runs low or a feed cannot run. Everything runs at home on a Raspberry Pi; you reach it from anywhere over Tailscale. [NERV](https://github.com/voidbrain/nerv) can drive it through MCP.

- **Hub** (`apps/hub`): API, live updates, SQLite history, feed planning, alerts, MQTT broker, MCP. Serves the client.
- **Agent** (`apps/agent`): one per Pi; drives the hardware and keeps it safe, also when the hub is down.
- **Client** (`apps/client`): Angular dashboard.

How it works: [docs/DESIGN.md](docs/DESIGN.md). The previous version (PHP server, Angular 18 client, Node device) is at the `legacy-v1` tag.

## Run it

Node 24 (`nvm use`).

```bash
npm install
npm run dev        # hub + one agent on a simulated rig (tent, 6 supply tanks, mixing tank, 4 pots); http://127.0.0.1:8080
npm run client     # optional: Angular dev server on :4200 with live reload, proxying to the dev hub
npm test           # backend suites, including hub + agent end to end over MQTT
npm run test:client
npm run build      # client build the hub serves
```

`npm run dev` keeps its state in `data/dev/`; delete it to start over.

## Deploying on a Raspberry Pi

One Pi runs the hub and the agent as two services (so the agent's safety does not depend on the hub).

1. Raspberry Pi OS (Bookworm or later), Node 24, Tailscale (`tailscale up`). Enable 1-Wire and I²C with `raspi-config` if you use them.
2. Clone, `npm ci`, `npm run build`. On the Pi, `npm install i2c-bus` builds the I²C driver.
3. Copy [`deploy/grover-hub.service`](deploy/grover-hub.service) and [`deploy/grover-agent.service`](deploy/grover-agent.service) to `/etc/systemd/system/`, adjust the paths and user, then `sudo systemctl enable --now grover-hub`.
4. Register the agent: on the Setup page, "Register" `pi-1` (or `curl -X POST localhost:8080/api/agents/pi-1/token`); the token is shown once. Put `GROVER_AGENT_ID=pi-1`, `GROVER_AGENT_TOKEN=…` and `GROVER_DRIVERS=hardware` in `/etc/grover/agent.env`, then `sudo systemctl enable --now grover-agent`.
5. Open the client's **Setup** page: add the room, its probes, pumps and switches with their wiring, and schedules. (The same is possible through the API, `PUT /api/<rooms|probes|actuators|schedules>/<id>` with the bodies in `packages/contracts/src/domain.ts`; `apps/hub/src/seed.ts` is a full example.)
6. Publish the hub on your tailnet: `sudo tailscale serve --bg 8080`, and put `GROVER_ALLOWED_HOSTS=<pi-name>.<tailnet>.ts.net` in `/etc/grover/hub.env` (the hub refuses host names it does not know). Open `https://<pi-name>.<tailnet>.ts.net` from any device on the tailnet. NERV connects to `https://<pi-name>.<tailnet>.ts.net/mcp`.

The hub listens on loopback only; `tailscale serve` is what makes it reachable, and only from your tailnet. A second Pi runs only the agent, with `GROVER_HUB_MQTT=mqtt://<hub-pi>:1883` and the hub's `GROVER_MQTT_HOST` set to its Tailscale IP.

## Where things are

| Path | What |
|---|---|
| `packages/contracts` | Shared schemas, MQTT protocol, schedule rules, feed planner, dosing model |
| `apps/hub` | Hub service and its tests (`test/e2e.test.ts` runs hub + agent together) |
| `apps/agent` | Agent service, drivers, safety |
| `apps/client` | Angular client |
| `tools/dev.ts` | Local hub + simulated agent |
| `deploy/` | systemd units |
| `docs/` | Design, style guide, backlog, hardware notes from the original build |

## Working on it

Read [AGENTS.md](AGENTS.md) first (it applies to people too), then the [backlog](docs/BACKLOG.md) and its [rules](docs/BACKLOG-RULES.md). UI work follows the [style guide](docs/STYLE-GUIDE.md).
