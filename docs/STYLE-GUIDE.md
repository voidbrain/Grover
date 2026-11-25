# Grover style guide

How the product looks and talks, and how this repository's documents are written. Read it before changing UI (templates, component styles, global styles, user-facing text). The values live in code: CSS custom properties in [`apps/client/src/styles.scss`](../apps/client/src/styles.scss) (`:root`, with a dark set under `prefers-color-scheme: dark`). When this guide and the code disagree, the code is what ships: fix whichever is wrong and record the discrepancy in the backlog if it is not fixed in the same change.

Grover is a control panel for one person tending plants, opened on a phone in the grow tent or a laptop away from home. It is calm and readable at a glance: numbers first, state second, decoration never. Green carries "in range and running"; red is kept for out-of-range values and the emergency stop.

## Documentation ownership

This guide governs the application UI and repository writing; [Backlog rules](BACKLOG-RULES.md) govern tracking. Backlog status/priority emoji are documentation cues, not app icons. README describes capabilities; AGENTS directs implementation. User instructions take precedence.

## Content and voice

- **Voice:** short, direct, addressed to the user. No "we", no exclamation marks, no emoji in the UI.
- **Sentence case** for buttons, labels and hints ("Stop all", "Suggest a correction", "Apply this dose").
- **Say what happened, then what to do.** "Agent pi-1 offline, last seen 4 min ago." "Hub unreachable: showing the last known data." Refusals from the hub are shown as the hub words them ("room grow-1 is silent: pumps only run in normal mode").
- Units and numbers: the unit after the value, small (`6.42 pH`, `1.5 mS/cm`, `21.3 °C`, `60 cm`, `5 mL`, `2 s`); at most two decimals; ranges with an en dash (`1.3–1.8`); times 24-hour (`18:00`); relative times as "2 min ago".

## Visual foundations

### Colour

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f4f6f3` | `#0f1411` | Page background |
| `--surface` | `#ffffff` | `#161d18` | Room cards, chart |
| `--surface-2` | `#f8faf7` | `#1b241e` | Probe tiles, inputs |
| `--line` | `#d9e0d6` | `#2a352d` | Borders, chart grid |
| `--text` | `#17201a` | `#e6ede7` | Body text |
| `--muted` | `#56635a` | `#9aa89e` | Secondary text, units, stale state |
| `--accent` | `#2f7d4f` | `#5cc285` | Primary buttons, selected mode, switch on, chart line, focus ring |
| `--on-accent` | `#ffffff` | `#0b1a10` | Text on accent |
| `--ok` | `#2f7d4f` | `#5cc285` | In range, agent online, target band |
| `--warn` | `#a86400` | `#e3a44a` | Offline badges |
| `--bad` | `#b3261e` | `#f2867d` | Out of range, errors, "Stop all" |

- Use tokens (`var(--…)`), never a new literal colour. A new colour is a new token, added here in the same change. Tints are `color-mix()` of a token with `transparent` or `--surface`.
- Change fill and foreground as a pair, and check contrast (WCAG AA: 4.5:1 for text, 3:1 for large text and UI parts).
- Probe health is shown by a left border colour **and** a word ("low", "high", "stale"), never colour alone.

- **Nutrient colours** (F-017) are owner data, not tokens: each supply tank's colour like its real bottle (defaults and a palette in `packages/contracts/src/kinds.ts`, chosen in Setup → the tent → Nutrient colours). They appear only as a `.swatch` (a 0.75 rem dot with a `--line` border) beside the tank's or pump's name, and as the fill of a dose bar, never behind text, so contrast never depends on them.

### Type

System UI stack (`--font`: Inter if installed, then the platform font); no web fonts are loaded. Base 16 px, line height 1.45. Probe values 1.75 rem semibold with tabular numbers; room titles 1.375 rem; section labels 0.8125 rem uppercase with 0.06 em tracking in `--muted`.

### Spacing and layout

`--space-1` 0.25 rem · `--space-2` 0.5 rem · `--space-3` 0.75 rem · `--space-4` 1 rem · `--space-5` 1.5 rem · `--space-6` 2.5 rem. Content max width 72 rem with a 1 rem gutter. Probe tiles in an auto-fill grid (min 11 rem); control sections in an auto-fit grid (min 16 rem), so phones get one column without breakpoints.

### Borders, radii, shadows

`--radius` 10 px (tiles, buttons, inputs), `--radius-lg` 16 px (room cards). 1 px `--line` borders; no shadows.

### States and motion

- Hover, active, selected, disabled and focus each have one treatment. Focus is a 2 px `--accent` outline, always visible. Disabled is 45 % opacity with a not-allowed cursor.
- No motion yet. If any is added, respect `prefers-reduced-motion`.

## Components

- **Room card** (`apps/client/src/app/room/room-card.*`): header (name, phase and day, auto-feed, the light line when it follows the calendar, e.g. "Light: 12 h from 06:00 · Early bloom of NL5xHaze gen 2 (most advanced)", agent status, mode, Stop all), alerts (left border `--warn`, or `--bad` for a stopped feed or offline agent), tent probe tiles, tank levels (compact tiles; a low tank gets a `--bad` border and "Low: refill"), pot cards (level, pH, EC tiles, shared probes marked "(shared)", last feed line, feed preview, "Feed now"), switches, manual pump runs. Actions disable when the hub or the agent is unreachable, or the mode does not allow them.
- **Segmented control** (global `.segmented`): a `fieldset` of radio inputs with a hidden legend; used for mode and chart range.
- **Buttons** (global `button`): primary (accent fill), `.ghost` (outline), `.danger` (red outline, only for Stop all), `.small`.
- **Switch** (global `.toggle` with `role="switch"` and `aria-checked`): lights, fans, water loop.
- **Pump control** (`apps/client/src/app/room/pump-control.ts`): the pump's state (off, waiting, running in `--accent`), an amount (mL when calibrated, else s) and Run, disabled while it waits or runs; on the room card and the rig map.
- **Setup pages** (`apps/client/src/app/setup/`): a table per kind of thing with an "Edit" button per row and an "Add …" button above; the editor opens inline under its row (`.editor`, accent border) and closes on save or cancel. Labels sit above fields (`.field`), errors under them in `--bad` once the field is touched, schema or hub refusals in a `.form-errors` list above the buttons. Save is the primary button, Cancel `.ghost`, Delete `.danger` and always asks first. Ids are made from the name when something is created and never edited.
- **Plants and strains page** (`apps/client/src/app/setup/plants-setup.*`, `plant-editors.ts`): plants first (harvested ones hidden behind a toggle), then strains ("Bred from" joined with ×, genetics as "70 % sativa / 30 % indica"), then breeders. Origin is written "from seed", "1st cutting", "2nd cutting"…, with "of <mother>" when recorded. On the pot card the plant name links to this page, its facts on one muted line, with Switch to bloom (until its bloom date is set), Start flush (after it), Take cuttings and Harvest; an empty pot offers Place in pot (a select of plants growing elsewhere); the pot's phase and day follow, marked "(tent calendar)" when the pot has no plant. The page groups plants as In the tent, Growing elsewhere (with age) and Harvested (behind a toggle).
- **Schedule days** (`schedule-editor.ts`, F-016): a "Days" fieldset of weekday checkboxes, Mon–Fri and Sat–Sun in two groups with space between, and Every day / Weekdays / Weekend shortcuts; none ticked says "Pick at least one day." The schedule list adds the days after the rule: three or more days in a row as a range, weekdays and the weekend apart ("on 06:00–00:00, Mon–Fri"; "Sat, Sun"; "Mon, Wed · Sat").
- **Form fields** (global): text, number, date, time inputs and selects share one look (`--surface-2`, `--line` border, `--bad` border when invalid); `.form-grid` lays them out in an auto-fill grid (min 12 rem); `.field.check` for a checkbox with its label; `.hint` for help text.
- **Rig map** (`apps/client/src/app/map/`, linked as "Map" next to the room name): the tent drawn from its setup, top to bottom as the water flows. Tent (switches, air and shared probes), the supply tanks in a row over a manifold line (level, "Low: refill" with a `--bad` border, its pump control), a pipe to the mixing tank (level, "Feeding <pot>: <step>" or Idle), a pipe to the pots (plant link, phase and day, its alerts, feed pump control, loop switch, level/pH/EC/temperature tiles with Read, Feed now). Parts are `--surface` nodes with a 4 px left border: `--warn` or `--bad` for an alert on that part (a low tank is `--bad`), with the alert's words in the node; `--accent` border on the pot being fed. Alerts not on a part are listed above. One pump per supply tank and one feed pump and loop per pot are drawn; any other switch or pump is listed under "Other parts" with its control. Controls follow the room card's rules (Stop all at once, Read off when the tent is off).
- **Probe chart** (`apps/client/src/app/probe-page.ts`): inline SVG line with the phase target band and five value ticks.
- **Plant page** (`apps/client/src/app/plant/`): header (name, strain · breeder · genetics · THC, origin with its line of mothers, pot, current phase and day, dates), the pot's open alerts, "In the tent" tiles (days, feeds, L given, EC and pH in range, yield), nutrient bars (mL per tank, `--accent` on `--surface-2`), the range control (Today, Last week, Last month, From start), four charts and a log (newest first). Plant names on the pot card and the plants page link to it.
- **Plant chart** (`plant-chart.ts`): like the probe chart, with one target band per phase (each over its own days) and dashed `--muted` markers for feeds, placing, bloom, flush and harvest; the latest value in the caption.

## Bricks mapping (F-020)

The client is moving to 🧱 bricks (`@voidbrain/bricks`, [F-020](BACKLOG.md#f-020)). Checked on 2026-11-25 against the published 0.1.0 (F-020-T01). What 0.1.0 exports: `@voidbrain/bricks/tokens` (`SEMANTIC_TOKENS`, `COMPONENT_TOKENS`, `cssVar`), `/themes` (`THEMES` base, plain, eva; `THEME_ATTRIBUTE` `data-bx-theme`; `applyTheme`, `isThemeName`), `/foundations` (`SPACE_STEPS`, `TYPE_STEPS`, `space`, `fontSize`), `/components` (`BxBadge` `bx-badge`, `BxCard` `bx-card`), `/patterns` (`PATTERNS`, empty: none has landed), `/surfaces` (NERV's genUI cards) and `/styles/*` (`tokens.css`, `foundations.css`, `themes/*.css`, `bricks.css`). It needs Angular ^22.3. Grover restyles by theme only, never by overriding a bricks component.

| Client piece | Bricks 0.1.0 | Note |
|---|---|---|
| `--bg` · `--surface` · `--surface-2` · `--line` | `--bx-surface` · `--bx-surface-raised` · `--bx-surface-sunken` · `--bx-border` | Semantic tokens, set by a Grover theme |
| `--text` · `--muted` | `--bx-text` · `--bx-text-muted` | |
| `--accent` · `--on-accent` | `--bx-accent` · `--bx-on-accent`, and `--bx-focus` for the focus ring | |
| `--ok` · `--warn` · `--bad` | `--bx-ok` · `--bx-warn` · `--bx-danger` | Bricks adds `--bx-info` and `--bx-on-status` (text on a status fill); the Grover theme sets them |
| `--radius` (10 px) | `--bx-radius` (theme sets 10 px) and `--bx-radius-badge` | |
| `--radius-lg` (16 px) | none | No large-radius semantic token; `bx-card` reads `--bx-radius`. Grover-only for now |
| `--space-1`…`--space-4` (4–16 px) | `--bx-space-1`…`--bx-space-4` | Same values on the 4 px grid |
| `--space-5` (24 px) | `--bx-space-6` | Same value, different step |
| `--space-6` (40 px) | none | Bricks stops at `--bx-space-8` (32 px) |
| `--font` | `--bx-font` (theme) | |
| Font sizes (0.75–1.75 rem) | `--bx-font-size-xs`…`-2xl` (11–23 px) | Primitive scale; not a one-to-one match, so sizes move only when their component does |
| `:focus-visible` (2 px accent) | `foundations.css`: 3 px `--bx-focus`, 2 px offset | Inside `[data-bx-theme]` |
| Base `body` (colour, background, font) | `foundations.css` on `[data-bx-theme]` | Bricks sets 14 px body text; Grover keeps 16 px (read on a phone in the tent) |
| Reduced motion | `foundations.css` | Grover has no motion yet |
| `.sr-only`, `.skip`, box sizing, `a` colour | none | Not in bricks foundations; Grover-only for now |
| `button` (primary, `.ghost`, `.danger`, `.small`) | none | Planned in bricks as F-003-T01 |
| Text, number, date, time inputs; `select` | none | bricks F-003-T01 |
| `.toggle` switch | none | bricks F-003-T01 |
| Agent and connection status (`.dot`, `.conn`) | `BxBadge` (`tone` accent, ok, warn, danger, info; `live`) | |
| `.field`, `.hint`, `field-error`, `.form-errors` | none | bricks F-003-T02 (form field) |
| Room, pot and plant cards; setup `.editor` | `BxCard` (`label`) | `bx-card` pads 20 px with a 12 px gap and `--bx-radius` corners |
| `confirm()` before harvest, bloom, flush and delete | none | bricks F-003-T04 (dialog) |
| Setup `.table`, `.table-wrap` | none | bricks F-003-T06 (data table) |
| Alert lines (left border `--warn`/`--bad`) | none | bricks F-003-T05 (status row) |
| `.empty` | none | bricks F-003-T05 (empty state) |
| `.segmented` (mode, chart range) | none | Not planned in bricks: contributed in F-020-T07 |
| Probe and tank tiles (value, unit, label, tone) | none | Not planned in bricks: contributed in F-020-T07 |
| Pump control, rig map, probe and plant charts, nutrient bars and `.swatch`, schedule-days fieldset, `.form-grid` | none | Grover-only: hardware- and grow-specific, or one layout |
| genUI surfaces (`BxSurface` and the four cards) | — | Not used: the client has no model output to render |

## Accessibility

- Every interactive element is reachable and operable by keyboard, with a visible focus and an accessible name (`.sr-only` labels on pump amounts and switches).
- Colour never carries meaning alone. Text meets WCAG AA contrast on its real background.
- Connection state and errors use `role="status"` and `role="alert"`. A skip link jumps to `main`.

## Assets

`apps/client/public/` holds the favicon, the app icon (`icon.svg`, a white sprout and pot on the light theme's `--accent` #2f7d4f with 96/512 rounded corners; `icon-192.png` and `icon-512.png` rendered from it), the web app manifest and the service worker (F-019). The manifest's `theme_color` and `background_color`, and the page's `theme-color` metas (`--accent` light, `--bg` dark), are the tokens' values written out: neither can read tokens, so change them together. `icon-maskable-512.png` is the same icon without rounded corners, for launchers that crop. Hardware photos and diagrams from the original build live in `docs/hardware/img/` and are documentation, not app assets.

## Writing in this repository

- Plain English, short sentences, active voice. Say what is, not what might be.
- Name things as the code names them: files, functions, commands in backticks, linked when they are paths.
- Dates are absolute (`2026-11-24`), never "yesterday" or "last week".
- One owner per fact: link to it rather than restating it. AGENTS for how to work, the backlog for status, this guide for look and voice, README for what the product does, DESIGN for how it works.

## Keeping it in step

A change that adds or alters a token, a text style, a shared component or the voice updates this guide in the same PR. A design doc that disagrees with the code becomes a backlog record.
