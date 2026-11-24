# First install on the Raspberry Pi

Owner check that the hub and agent install, start at boot and are reachable only through the tailnet. Steps run **on the Pi** unless a step names another machine. The full reference is the README, "Deploying on a Raspberry Pi"; this page holds the commands to paste and what to expect. Do not wire pumps to their tanks yet: the agent starts with real drivers.

## 1. Install (on the Pi)

```bash
git clone https://github.com/voidbrain/Grover.git ~/Grover && cd ~/Grover
nvm install 24 && nvm use 24
npm ci && npm run build && npm install i2c-bus
```

Expected: no errors; `apps/client/dist/client/browser/index.html` exists.

## 2. Services (on the Pi)

```bash
sudo cp deploy/grover-hub.service deploy/grover-agent.service /etc/systemd/system/
sudoedit /etc/systemd/system/grover-hub.service /etc/systemd/system/grover-agent.service   # paths and user
sudo systemctl daemon-reload && sudo systemctl enable --now grover-hub
curl -s -X POST localhost:8080/api/agents/pi-1/token
```

Expected: the last command prints a JSON with a `token`. Put it in the agent's environment, then start the agent:

```bash
sudo mkdir -p /etc/grover && sudoedit /etc/grover/agent.env
# GROVER_AGENT_ID=pi-1
# GROVER_AGENT_TOKEN=<the token>
# GROVER_DRIVERS=hardware
sudo systemctl enable --now grover-agent
journalctl -u grover-agent -n 20 --no-pager
```

Expected: no repeated `fault` or connection errors in the agent log, and the Setup page (step 4) shows agent `pi-1` online.

## 3. Tailnet (on the Pi)

```bash
sudo tailscale serve --bg 8080
tailscale status --self --json | grep DNSName
sudoedit /etc/grover/hub.env    # GROVER_ALLOWED_HOSTS=<the DNS name without the trailing dot>
sudo systemctl restart grover-hub
```

## 4. Reach it (on the phone)

With the phone on the tailnet, open `https://<the DNS name>`. Then turn Tailscale off on the phone and reload.

Expected: the dashboard opens with Tailscale on; with it off the page does not load.

## 5. Reboot (on the Pi)

```bash
sudo reboot
# after it is back:
systemctl is-active grover-hub grover-agent
```

Expected: `active` twice.

## 6. NERV (on the Mac running NERV)

Add an MCP connection in NERV to `https://<the DNS name>/mcp` and list its tools.

Expected: the `grover_…` tools are listed (for example `grover_overview`, `grover_alerts`, `grover_plants`).

Report in the record what differed from these steps; the README and the service files are fixed from that.
