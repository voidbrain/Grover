# Grover agent on the tent Pi

Owner check for F-005-T04, **later**: the agent on a small second Raspberry Pi in the tent, wired to the sensors and relays. The hub is already running on Calvary (NERV-03, [hub page](hub-on-calvary.md), F-005-T01); the agent connects to it over the tailnet. The hardware bring-up ([guide](../guides/hardware-bring-up.md), F-003) follows on this Pi, with the owner's go-ahead for each run (AGENTS.md, Hardware). Steps run **on the tent Pi** unless a step names another machine. Do not wire pumps to their tanks yet: the agent starts with real drivers.

## What the tent Pi needs (as the README documents it)

- A Raspberry Pi with Raspberry Pi OS (Bookworm or later), Node 24, Tailscale joined to the same tailnet, 1-Wire and I2C enabled with `raspi-config` when used, and the build tools `i2c-bus` needs. The README names no minimum model or memory: a Pi Zero 2 W (512 MB) or a Pi 4 are the owner's candidates; the first install here decides and the result goes in F-005-T03. The agent needs no hub, MQTT broker or client build.
- Power supply, SD card, and the wiring the bring-up guide lists (sensors, relays, pumps).

## 1. Install (on the Pi)

```bash
git clone https://github.com/voidbrain/Grover.git ~/Grover && cd ~/Grover
nvm install 24 && nvm use 24
npm ci
npm ls i2c-bus   # optional dependency: expected installed; report if not
```

Expected: no errors, and `i2c-bus` listed. (The client build is the hub's; the agent does not need it.)

## 2. Open the hub's broker to the tailnet (on Calvary)

The hub listens on loopback only. The README's second-Pi step: set the broker's host to Calvary's Tailscale address.

```bash
tailscale ip -4
sudoedit /etc/grover/hub.env    # add GROVER_MQTT_HOST=<that address>
sudo systemctl restart grover-hub
curl -s -X POST localhost:8080/api/agents/pi-1/token
```

Expected: the last command prints a JSON with a `token` (shown once). Keep the address and the token out of Git.

## 3. Agent service (on the tent Pi)

```bash
sudo cp deploy/grover-agent.service /etc/systemd/system/
sudoedit /etc/systemd/system/grover-agent.service   # paths and user
sudo mkdir -p /etc/grover && sudoedit /etc/grover/agent.env
# GROVER_AGENT_ID=pi-1
# GROVER_AGENT_TOKEN=<the token>
# GROVER_DRIVERS=hardware
# GROVER_HUB_MQTT=mqtt://<Calvary's Tailscale address>:1883
sudo systemctl daemon-reload && sudo systemctl enable --now grover-agent
journalctl -u grover-agent -n 20 --no-pager
```

Expected: no repeated `fault` or connection errors in the agent log, and the hub's Setup page (open as in the hub page, step 5) shows agent `pi-1` online. Stop the agent with `sudo systemctl stop grover-agent`: everything on the rig goes off.

## 4. Reboot (on the tent Pi)

```bash
sudo reboot
# after it is back:
systemctl is-active grover-agent
```

Expected: `active`, and `pi-1` online again on the hub. Then turn Tailscale off on the tent Pi for a minute: the agent keeps running its schedules and reconnects when it is back.

Report in the record what differed from these steps; the README and the service files are fixed from that (F-005-T03). The bring-up on this Pi continues with the [hardware guide](../guides/hardware-bring-up.md) (F-003-T02); its commands that use `localhost:8080` run on Calvary or against its tailnet name, since the hub is there.
