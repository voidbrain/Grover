# Grover area notes

Detailed rules and lessons for each part of the project, kept out of AGENTS.md so that file stays short. Read the section of the area you change before you change it; AGENTS.md applies to every task. Keep this file current like AGENTS.md: a change that alters a rule here updates it in the same PR.

## Contracts

- Code: `packages/contracts/src` (`kinds.ts` zod-free, `domain.ts`, `mqtt.ts`, `api.ts`, `schedule.ts`, `dosing.ts`); tests in `packages/contracts/test`.
- Imports nothing from the apps. Relative imports carry the `.ts` extension (Node type stripping); the client compiles them with `rewriteRelativeImportExtensions`.
- Anything the browser needs at runtime goes in `kinds.ts` (no zod); the client imports the rest as types only.
- A schema change is a protocol change: check that an agent running the previous config still parses (or bump `PROTOCOL_VERSION`), and update docs/DESIGN.md.
- Lesson: one sample where a dose moved EC the wrong way dragged the fitted coefficient from 0.4 to 0.12; wrong-direction samples are now dropped (`fit: … bad data is ignored`).
- The feed planner (`feeding.ts`) is pure and owns every dosing decision; the agent never decides amounts. Change it with a case in `contracts.test.ts` ("feed: …").

## Hub

- Code: `apps/hub/src`; tests in `apps/hub/test`.
- `Store` is the only SQL. Validate with the contracts schema on write and on read of JSON columns. Telemetry inserts are idempotent.
- Deletes keep the model whole: a deleted probe or actuator takes its schedules with it (`Store.deleteEntity`); SQLite foreign-key and agent-uniqueness failures map to 409 with a plain reason.
- `Commands` runs single actions; the `Feeder` plans whole feeds and sends them as one `feed` command, one per tent at a time. HTTP errors map from `NotFound` 404, `Refused` 409, `AgentOffline` 503, `CommandTimeout` 504, `ZodError` 400.
- Any setup write republishes agent configs (`publishAllConfigs`).
- The HTTP server binds loopback by default; never change the default to a public bind. The `onRequest` guard in `http.ts` (Host, Origin, JSON bodies) is a safeguard: keep it in front of every route, MCP and the live socket included. MCP is stateless (a server per request).
- Feeds: the Feeder reserves the tent before anything is awaited and only releases its own reservation; a feed is closed when the agent goes offline, when the agent (after answering) reports it is not running it, and at hub start. Lesson (review): without that, one power cut mid-feed blocked every later feed until a hub restart.
- Alerts: raised once per key, kept while the condition lasts. A refused manual feed answers with its reason and raises nothing; automatic refusals and aborted feeds raise `feed:<pot>`.
- Lesson: per-agent sequence numbers were first used to drop replays, which would have dropped every event after an agent reinstall (counter back to 0); idempotent keys replaced them.

## Agent

- Code: `apps/agent/src`; tests in `apps/agent/test` and the hub e2e test.
- `Actuators` owns safety (see DESIGN, "Safety"); the agent ack for `run` means "queued", the actuation events report the real on/off.
- Drivers must start outputs off and must not throw from `set(false)` past a best effort. A driver that needs the device is in `hardware.ts`; anything for development is in `mock.ts`.
- State lives in `GROVER_AGENT_STATE`: `config.json` (last config) and `outbox.sqlite`.
- `FeedRunner` owns feed sequencing: checks before anything runs, a tank re-check before each supply run, transfer in short slices with level checks. A cancel (Stop all, mode change, hardware change, shutdown) must reach it before the pumps go off, or a step would start again.
- `drivers/mock.ts` simulates the rig (tank volumes, mixing, transfer, plants drinking), so feeds can be tested without hardware; keep it in step with `feeding.ts` semantics.
- Lesson: a pump run by hand (or a feed that filled the pot early) leaves liquid in the mixing tank, and the next feed rightly refuses to start (seen in the e2e test); the dashboard says so under "Pumps, by hand".
- Lesson: a pump run stopped early (stop, reload, failure) never resolved its queue slot and blocked every later pump; `release` is now settled on every off.
- Lesson (review, 2026-11-24): the first fix for that let queued runs start after Stop all, and a stop landing while `pinctrl` was still switching a relay on was lost. Every stop now bumps an epoch: queued runs and runs mid-switch-on under an older epoch never stay on (`stop drops queued runs…`, `a stop that arrives while a relay is still switching on wins`). `done` resolves false when a run never started; the feed runner aborts on it.
- Lesson (review): a feed re-check reading can take seconds; check for a cancel right before every pump run, not only before the reading (`Stop all during a tank re-check…`).
- Lesson (review): an MCP23017 writes OLAT = 0 by default, which switches active-low relays ON; pins are claimed with their off level first (`hardware.test.ts`).

## Client

- Code: `apps/client/src/app`; rules in [Angular rules](angular.md); look in [the style guide](../STYLE-GUIDE.md).
- `Hub` (service) holds the snapshot and applies live events; components derive with `computed()`. Import from `@grover/contracts` as types only, runtime helpers from `@grover/contracts/kinds`.
- Every action button is disabled when the hub socket is down, the agent is offline or the mode forbids it (switches: only lights may switch on in silent, nothing in off; switching off is always allowed); the hub refusal text is shown as is.
- Setup forms (`setup/`) edit flat drafts (`drafts.ts`), convert to entities and check them with the contracts schema before sending; the zod schemas load only in the lazy setup chunks. Every save goes through `SetupApi`, which refreshes the shared snapshot.
- Signal Forms own `min`, `max` and `required` on a `[formField]` input: put them in the form schema, never as template attributes (NG8022).
- In unit tests a select bound with `[formField]` updates on the `input` event (browsers fire it with `change`); dispatch both.
- Lesson: importing `isPump` from the main contracts entry pulled zod into the dashboard chunk (447 kB → 15 kB after moving it to `kinds`).
