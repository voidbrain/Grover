# B-015: calendar fields no longer overlap (owner check)

Owner check for B-015-T02. The fix changes only the client's styles; the hub serves the client, so the hub must run a `main` that contains the fix (PR named in [B-015](../BACKLOG.md#b-015)).

## A. On the Mac, without Calvary (quick)

```bash
cd ~/Projects/Grover && git checkout main && git pull --ff-only && npm ci && npm run build
rm -rf data/dev && npm run dev
```

Open http://127.0.0.1:8080/setup, under **Grow calendars** click **Default photoperiod**.

Expected: in **1. Seedling** (and every other phase), the fields under **Dose, mL per 10 L** (Grow, Micro, Bloom, Ripen, pH down) sit side by side, each box inside its own column, with a gap between them; the **Days** and **Light hours per day** boxes do not run into each other; under **Target ranges** each min and max pair stays inside its column. Narrow the window to phone width: the fields wrap to fewer columns and still do not overlap. `Ctrl-C` stops the dev stack.

## B. On the hub (Calvary), after it is updated

Calvary has no DNS right now, so the hub updates only from a git bundle over SSH, as at the last update. The agent does not do this step.

```bash
# on the Mac: a bundle of main
git -C ~/Projects/Grover fetch origin && git -C ~/Projects/Grover bundle create /tmp/grover.bundle origin/main
scp /tmp/grover.bundle <calvary-ssh-address>:/tmp/grover.bundle
```

```bash
# on Calvary
cd ~/Grover && git pull --ff-only /tmp/grover.bundle main && npm ci && npm run build && sudo systemctl restart grover-hub
systemctl is-active grover-hub
```

Expected: `active`. Then open https://raspberrypi.taildea7a.ts.net → **Setup** → **Grow calendars** → **Default photoperiod** and check the same as in A: the dose fields and the range pairs do not overlap at desktop or phone width.

If anything still overlaps: take a screenshot, note the browser and window width, and add it to B-015.
