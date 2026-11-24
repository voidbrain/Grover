# Grover

A local-first controller for a home hydroponic grow: it reads the reservoir (pH, EC, temperature, level), runs lights, fans and dosing pumps on schedule, and suggests or applies nutrient and pH corrections from a model it fits to your own doses. Everything runs at home on a Raspberry Pi; you reach it from anywhere over Tailscale. [NERV](https://github.com/voidbrain/nerv) can drive it through MCP.

- **Hub** (`apps/hub`): API, live updates, SQLite history, dosing, MQTT broker, MCP. Serves the client.
- **Agent** (`apps/agent`): one per Pi; drives the hardware and keeps it safe, also when the hub is down.
- **Client** (`apps/client`): Angular dashboard.

How it works: [docs/DESIGN.md](docs/DESIGN.md). The previous version (PHP server, Angular 18 client, Node device) is at the `legacy-v1` tag.

## Run it

Node 24 (`nvm use`).

```bash
npm install
npm run dev        # hub + one agent with simulated hardware, demo room; http://127.0.0.1:8080
npm run client     # optional: Angular dev server on :4200 with live reload, proxying to the hub
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
4. Register the agent: `curl -X POST localhost:8080/api/agents/pi-1/token` prints its token once. Put `GROVER_AGENT_ID=pi-1`, `GROVER_AGENT_TOKEN=…` and `GROVER_DRIVERS=hardware` in `/etc/grover/agent.env`, then `sudo systemctl enable --now grover-agent`.
5. Describe the room, probes, actuators and schedules through the API (`PUT /api/rooms/<id>`, `/api/probes/<id>`, `/api/actuators/<id>`, `/api/schedules/<id>`; bodies are the schemas in `packages/contracts/src/domain.ts`). `apps/hub/src/seed.ts` is a full example.
6. Publish the hub on your tailnet: `sudo tailscale serve --bg 8080`. Open `https://<pi-name>.<tailnet>.ts.net` from any device on the tailnet. NERV connects to `https://<pi-name>.<tailnet>.ts.net/mcp`.

The hub listens on loopback only; `tailscale serve` is what makes it reachable, and only from your tailnet. A second Pi runs only the agent, with `GROVER_HUB_MQTT=mqtt://<hub-pi>:1883` and the hub's `GROVER_MQTT_HOST` set to its Tailscale IP.

## Where things are

| Path | What |
|---|---|
| `packages/contracts` | Shared schemas, MQTT protocol, schedule rules, dosing model |
| `apps/hub` | Hub service and its tests (`test/e2e.test.ts` runs hub + agent together) |
| `apps/agent` | Agent service, drivers, safety |
| `apps/client` | Angular client |
| `tools/dev.ts` | Local hub + simulated agent |
| `deploy/` | systemd units |
| `docs/` | Design, style guide, backlog, hardware notes from the original build |

## Working on it

Read [AGENTS.md](AGENTS.md) first (it applies to people too), then the [backlog](docs/BACKLOG.md) and its [rules](docs/BACKLOG-RULES.md). UI work follows the [style guide](docs/STYLE-GUIDE.md).
