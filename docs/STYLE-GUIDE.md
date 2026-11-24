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
- **Switch** (`.toggle` with `role="switch"` and `aria-checked`): lights, fans, water loop.
- **Setup pages** (`apps/client/src/app/setup/`): a table per kind of thing with an "Edit" button per row and an "Add …" button above; the editor opens inline under its row (`.editor`, accent border) and closes on save or cancel. Labels sit above fields (`.field`), errors under them in `--bad` once the field is touched, schema or hub refusals in a `.form-errors` list above the buttons. Save is the primary button, Cancel `.ghost`, Delete `.danger` and always asks first. Ids are made from the name when something is created and never edited.
- **Plants and strains page** (`apps/client/src/app/setup/plants-setup.*`, `plant-editors.ts`): plants first (harvested ones hidden behind a toggle), then strains ("Bred from" joined with ×, genetics as "70 % sativa / 30 % indica"), then breeders. Origin is written "from seed", "1st cutting", "2nd cutting"…, with "of <mother>" when recorded. On the pot card the plant name links to this page, its facts on one muted line, with Switch to bloom (until its bloom date is set), Start flush (after it), Take cuttings and Harvest; an empty pot offers Place in pot (a select of plants growing elsewhere); the pot's phase and day follow, marked "(tent calendar)" when the pot has no plant. The page groups plants as In the tent, Growing elsewhere (with age) and Harvested (behind a toggle).
- **Form fields** (global): text, number, date, time inputs and selects share one look (`--surface-2`, `--line` border, `--bad` border when invalid); `.form-grid` lays them out in an auto-fill grid (min 12 rem); `.field.check` for a checkbox with its label; `.hint` for help text.
- **Probe chart** (`apps/client/src/app/probe-page.ts`): inline SVG line with the phase target band and five value ticks.

## Accessibility

- Every interactive element is reachable and operable by keyboard, with a visible focus and an accessible name (`.sr-only` labels on pump amounts and switches).
- Colour never carries meaning alone. Text meets WCAG AA contrast on its real background.
- Connection state and errors use `role="status"` and `role="alert"`. A skip link jumps to `main`.

## Assets

`apps/client/public/` holds the favicon only. Hardware photos and diagrams from the original build live in `docs/hardware/img/` and are documentation, not app assets.

## Writing in this repository

- Plain English, short sentences, active voice. Say what is, not what might be.
- Name things as the code names them: files, functions, commands in backticks, linked when they are paths.
- Dates are absolute (`2026-11-24`), never "yesterday" or "last week".
- One owner per fact: link to it rather than restating it. AGENTS for how to work, the backlog for status, this guide for look and voice, README for what the product does, DESIGN for how it works.

## Keeping it in step

A change that adds or alters a token, a text style, a shared component or the voice updates this guide in the same PR. A design doc that disagrees with the code becomes a backlog record.
