# Trying the app on the dev stack

Owner checks of features that are built and merged but not yet tried by the owner. Everything runs **on the Mac**, in the Grover clone, on a simulated rig (mock drivers: no hardware moves). Say in the record what felt wrong; "fine" is a valid answer.

## Start

On the Mac, in a terminal, in your Grover clone (replace `<grover-clone>` with its folder):

```bash
cd <grover-clone> && git checkout main && git pull --ff-only
nvm use && npm install
rm -rf data/dev && npm run dev
```

Expected: the terminal prints `hub  http://127.0.0.1:8080  (MCP at /mcp)` and `agent pi-1 with mock drivers`. Open http://127.0.0.1:8080 in a browser: the dashboard shows the demo tent with four pots. Leave the terminal running; `Ctrl-C` stops it.

## Setup pages

1. Open http://127.0.0.1:8080/setup.
2. Add a probe to the demo tent, save it, edit its name, delete it.
3. Open the default calendar, change one phase's EC range, save, then put it back.

Expected: each save shows the change at once; a wrong value (an empty name, an EC range whose low end is above its high end) shows a message next to the field and saves nothing.

## Lights and Switch to bloom

1. On the dashboard, read the tent's line that starts with `Light:`.
2. On pot 3 (NL5xHaze gen 2) press **Switch to bloom**.

Expected: before, `Light: 18 h from 06:00 · <a veg phase> …`; within a second after, `Light: 12 h from 06:00 · <a bloom phase> of NL5xHaze gen 2 (most advanced)`. **Start flush** on the same pot moves it to the flush phase the same way.

## A feed

1. On pot 1 press **Preview feed**.
2. Press **Feed now**.
3. While it runs, press **Feed now** on pot 2, then **Stop all**.

Expected: the preview lists water, nutrients and pH down in ml with the reason for the feed; the feed shows its steps (mixing, settling, transfer) and the supply tank levels fall; the second feed is refused because one is running; Stop all ends the feed and every pump shows off.

## Plant cycle

1. On pot 3 press **Take cuttings** and answer `2` to "How many cuttings".
2. Press **Harvest** on pot 3.
3. Open **Setup → Plants and strains**: under "Growing elsewhere", one of the two cuttings; press **Place in pot** and choose pot 3.

Expected: step 1 lists two new plants of the next generation with pot 3's plant as mother; step 2 frees pot 3 and lists the plant under "Harvested"; step 3 puts the cutting in pot 3, and placing a second plant in an occupied pot is refused. Each pot card shows its own plant's phase.

## Plant page

1. On pot 3's card, open the plant's name (NL5xHaze gen 2).
2. Switch the range between Today, Last week, Last month and From start.

Expected: a header with strain, generation, mother and dates; four charts (level, EC, pH, water temperature) with the phase's band and markers for feeds; totals of water and nutrients; a log of feeds. Each range redraws the charts.

## Rig map

1. On the dashboard, press **Map** next to the tent's name.
2. Press **Run** on a supply tank's pump.
3. Look at it in a narrow window (or on a phone through `npm run client`), then switch the system to dark mode.

Expected: six supply tanks, the mixing tank, four pots with their pumps, loops, levels, EC, pH and plants, and the tent's lights, fan and air temperature; Run turns to waiting, then running, then back, and stays disabled meanwhile; no sideways scroll at phone width; text stays readable in light and dark.

## Weekday schedules

1. Open http://127.0.0.1:8080/setup, the demo tent, and edit one of the fan's schedules.
2. Under **Days** press **Weekend**, save; then **Weekdays**, save; then **Every day**, save.
3. Untick every day and try to save.

Expected: the editor shows Monday to Friday apart from Saturday and Sunday; after each save the schedule list names its days; with no day ticked nothing is saved and a message says why.

## Nutrient colours

1. Open http://127.0.0.1:8080/setup, the demo tent, and find **Nutrient colours**.
2. Give each supply tank the colour of your product (a suggestion from the palette or your own), save.
3. Back on the dashboard and on the **Map**, look at the tanks and their pumps; open the plant page of pot 3 and look at the dose bars; switch the system to dark mode.

Expected: each tank, its pump and its dose bar show the colour you chose; labels next to the colours stay readable in light and dark.
