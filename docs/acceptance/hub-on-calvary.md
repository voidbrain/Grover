# Grover hub on Calvary (NERV-03)

Owner check for F-005-T01. Decision 2026-11-26: run the hub now on Calvary (NERV-03, a Raspberry Pi), and put the agent on a small second Pi in the tent later ([agent page](pi-deploy.md), F-005-T04). Only the hub is installed here: no agent, no wiring, no pump. Steps run **on Calvary** unless a step names another machine. The full reference is the README, "Deploying on a Raspberry Pi"; this page holds the commands to paste and what to expect.

**Shared machine.** The hub and NERV-03 run on the same Pi and share its CPU, memory, disk and Tailscale. If Calvary goes down (power, SD card, the NERV update below), NERV-03 and the hub go down together. The agent will not: it runs on the tent Pi and keeps its schedules and safety limits without the hub ([design](../DESIGN.md)).

## 1. Power on and confirm it is online (on the Mac) (done 2026-11-26)

Power Calvary on, wait a few minutes, then:

```bash
tailscale status | grep raspberrypi
```

Expected: the line shows no `offline`. If it stays offline, stop and report.

## 2. Model, memory, disk (on Calvary) (done 2026-11-26)

```bash
tr -d '\0' < /proc/device-tree/model; echo
free -h
df -h /
node --version
```

Expected: a Raspberry Pi 4 (or a Compute Module 4) with at least 4 GB of memory; free space on `/` of at least 2 GB; Node 24 (NERV already needs it). If the memory is 1 or 2 GB, stop and report: do not install. NERV's own notes call this machine a ClockworkPi DevTerm on Debian 11; the README asks for Raspberry Pi OS Bookworm, and the hub needs only Node 24. Report the model line and `cat /etc/os-release` either way.

## 3. Update NERV-03 first (on Calvary) (done 2026-11-26)

Follow NERV's page [B-125, "Put NERV-03 on the bound-reply format"](https://github.com/voidbrain/nerv/blob/main/docs/acceptance/b125-nerv03-update.md), step 1 (1a if `nerv update --check` works, 1b if not), and step 2 on the Mac. Never `git pull` NERV's folder by hand.

Expected: `nerv doctor` shows the current revision with skew false, and `nerv kaji list` on the Mac lists all three bases enrolled. Report anything else before going on.

## 4. Install the hub (on Calvary) (done 2026-11-26)

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

## 5. Tailnet (on Calvary, then the Mac) (done 2026-11-26)

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

## 6. NERV on the Mac running NERV (done 2026-11-26, F-005-T02)

Done together with nerv:F-123-T02. Add an MCP connection in NERV to `https://<DNS>/mcp` and list its tools.

Expected: the `grover_...` tools are listed (for example `grover_overview`, `grover_alerts`, `grover_plants`).

## 7. Reboot (on Calvary) (done 2026-11-26)

```bash
sudo reboot
# after it is back:
systemctl is-active grover-hub
systemctl --user is-active nerv   # NERV's own unit name may differ: check `nerv service status`
```

Expected: `active` for the hub, and NERV-03 back as before (`nerv kaji list` on the Mac).

## Evidence, 2026-11-26 (about 19:30Z), steps 1 to 5

Done by the agent over SSH as the user `db`, not by the owner at the keyboard: the owner authorised it in chat ("run the hub now [on Calvary]", then SSH access for `db`) and updated NERV-03 himself (step 3).

- **Machine (step 2):** Raspberry Pi Compute Module 4 Rev 1.1 (a ClockworkPi DevTerm), Debian 11 bullseye (the README asks for Bookworm; the hub ran fine), 3.7 GiB memory (about 2.7 GiB available with the hub running), 29 GB disk (20 GB free), Node v24.22.3.
- **NERV-03 (step 3):** active at 89d67918.
- **Install (step 4):** Grover at 3ac705a cloned to `/home/db/Grover`; `npm ci` and `npm run build` ended without errors (the `i2c-bus` install script was not run: expected, the hub does not use it). `/etc/systemd/system/grover-hub.service` from `deploy/` with `User=db` and `WorkingDirectory=/home/db/Grover`; enabled and active. It listens on `127.0.0.1:8080` (API) and `127.0.0.1:1883` (MQTT). No `grover-agent` service installed.
- **Tailnet (step 5):** no earlier `tailscale serve` config; `tailscale serve --bg 8080` publishes `https://<calvary>.ts.net/` (tailnet only; the real name stays out of Git). `/etc/grover/hub.env` has `GROVER_ALLOWED_HOSTS=<calvary>.ts.net`. From the Mac: `/api/health` gave `{"ok":true,"agents":[]}`; the MCP `initialize` answered `serverInfo` grover 2.0.0 with a tools capability.

**Differences from this page** (input for F-005-T03): the agent ran the steps over SSH instead of the owner at the keyboard (owner-authorised); the `sudoedit` steps were done with `sed` and `tee`; the machine is Debian 11, not Bookworm. Not checked here: that the page is unreachable from a phone with Tailscale off (the serve is tailnet-only by design).

**Reboot (step 7), about 20:30Z:** owner OK in chat ("yep"); the agent ran `sudo systemctl reboot` over SSH. After boot (uptime 0 min): `grover-hub` active, NERV-03 active, `tailscale serve` restored (tailnet only, proxy to `127.0.0.1:8080`), and `/api/health` from the Mac gave `{"ok":true,"agents":[]}`.

**NERV lists the tools (step 6), 2026-11-26 about 20:37Z:** the owner ran `nerv tools add grover https://<calvary>.ts.net/mcp` on NERV-01, then `nerv tools`: `grover · https://<calvary>.ts.net/mcp · 19 tool(s)`, each marked read-only or not, `grover_run_pump` marked destructive, none granted. With the hub stopped on Calvary, `nerv tools` showed `could not list its tools: MCP server <calvary>.ts.net answered initialize with HTTP 502.`; started again, it listed 19 tools. (The same session granted `grover/grover_alerts`; NERV answered "no active alarms" through it, see nerv:F-123-T02.)

## Stop or undo

```bash
sudo systemctl disable --now grover-hub     # stops the hub; its data stays in /var/lib/grover
sudo rm /etc/systemd/system/grover-hub.service && sudo systemctl daemon-reload
tailscale serve status                      # then remove only Grover's :8080 entry; leave anything else
```

NERV-03 is not touched by these. Report in the record what differed from these steps; the README and the service file are fixed from that (F-005-T03).
