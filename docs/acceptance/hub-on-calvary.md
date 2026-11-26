# Grover hub on Calvary (NERV-03)

Owner check for F-005-T01. Decision 2026-11-26: run the hub now on Calvary (NERV-03, a Raspberry Pi), and put the agent on a small second Pi in the tent later ([agent page](pi-deploy.md), F-005-T04). Only the hub is installed here: no agent, no wiring, no pump. Steps run **on Calvary** unless a step names another machine. The full reference is the README, "Deploying on a Raspberry Pi"; this page holds the commands to paste and what to expect.

**Shared machine.** The hub and NERV-03 run on the same Pi and share its CPU, memory, disk and Tailscale. If Calvary goes down (power, SD card, the NERV update below), NERV-03 and the hub go down together. The agent will not: it runs on the tent Pi and keeps its schedules and safety limits without the hub ([design](../DESIGN.md)).

## 1. Power on and confirm it is online (on the Mac)

Power Calvary on, wait a few minutes, then:

```bash
tailscale status | grep raspberrypi
```

Expected: the line shows no `offline`. If it stays offline, stop and report.

## 2. Model, memory, disk (on Calvary)

```bash
tr -d '\0' < /proc/device-tree/model; echo
free -h
df -h /
node --version
```

Expected: a Raspberry Pi 4 (or a Compute Module 4) with at least 4 GB of memory; free space on `/` of at least 2 GB; Node 24 (NERV already needs it). If the memory is 1 or 2 GB, stop and report: do not install. NERV's own notes call this machine a ClockworkPi DevTerm on Debian 11; the README asks for Raspberry Pi OS Bookworm, and the hub needs only Node 24. Report the model line and `cat /etc/os-release` either way.

## 3. Update NERV-03 first (on Calvary)

Follow NERV's page [B-125, "Put NERV-03 on the bound-reply format"](https://github.com/voidbrain/nerv/blob/main/docs/acceptance/b125-nerv03-update.md), step 1 (1a if `nerv update --check` works, 1b if not), and step 2 on the Mac. Never `git pull` NERV's folder by hand.

Expected: `nerv doctor` shows the current revision with skew false, and `nerv kaji list` on the Mac lists all three bases enrolled. Report anything else before going on.

## 4. Install the hub (on Calvary)

```bash
ss -ltn | grep -E ':(8080|1883)\b'   # nothing should print: NERV does not use these ports
git clone https://github.com/voidbrain/Grover.git ~/Grover && cd ~/Grover
npm ci && npm run build
sudo cp deploy/grover-hub.service /etc/systemd/system/
sudoedit /etc/systemd/system/grover-hub.service   # User= and WorkingDirectory= (your user, ~/Grover)
sudo systemctl daemon-reload && sudo systemctl enable --now grover-hub
curl -s localhost:8080/api/health
```

Expected: `npm ci` and the build end without errors (the optional `i2c-bus` build may warn: the hub does not use it; report it); the last command prints the hub's health JSON. Do not install `grover-agent.service` and do not run `npm install i2c-bus`.

## 5. Tailnet (on Calvary, then the Mac)

```bash
tailscale serve status        # note what is already served before changing it
sudo tailscale serve --bg 8080
tailscale status --self --json | grep DNSName
sudoedit /etc/grover/hub.env    # GROVER_ALLOWED_HOSTS=<the DNS name without the trailing dot>
sudo systemctl restart grover-hub
```

Then on the Mac (on the tailnet), with `<DNS>` the name above:

```bash
curl -s https://<DNS>/api/health
curl -s https://<DNS>/mcp -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"check","version":"0"}}}'
```

Expected: the health JSON, then an MCP answer naming the server. From a phone with Tailscale off, `https://<DNS>` does not load. If `tailscale serve` asks to enable HTTPS for the tailnet, report it.

## 6. NERV on the Mac running NERV

Waits on nerv:F-123-T02; F-005-T02 is done together with it. Add an MCP connection in NERV to `https://<DNS>/mcp` and list its tools.

Expected: the `grover_...` tools are listed (for example `grover_overview`, `grover_alerts`, `grover_plants`).

## 7. Reboot (on Calvary)

```bash
sudo reboot
# after it is back:
systemctl is-active grover-hub
systemctl --user is-active nerv   # NERV's own unit name may differ: check `nerv service status`
```

Expected: `active` for the hub, and NERV-03 back as before (`nerv kaji list` on the Mac).

## Stop or undo

```bash
sudo systemctl disable --now grover-hub     # stops the hub; its data stays in /var/lib/grover
sudo rm /etc/systemd/system/grover-hub.service && sudo systemctl daemon-reload
tailscale serve status                      # then remove only Grover's :8080 entry; leave anything else
```

NERV-03 is not touched by these. Report in the record what differed from these steps; the README and the service file are fixed from that (F-005-T03).
