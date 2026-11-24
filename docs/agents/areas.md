# Grover area notes

Detailed rules and lessons for each part of the project, kept out of AGENTS.md so that file stays short. Read the section of the area you change before you change it; AGENTS.md applies to every task. Keep this file current like AGENTS.md: a change that alters a rule here updates it in the same PR.

## Contracts

- Code: `packages/contracts/src` (`kinds.ts` zod-free, `domain.ts`, `mqtt.ts`, `api.ts`, `schedule.ts`, `dosing.ts`); tests in `packages/contracts/test`.
- Imports nothing from the apps. Relative imports carry the `.ts` extension (Node type stripping); the client compiles them with `rewriteRelativeImportExtensions`.
- Anything the browser needs at runtime goes in `kinds.ts` (no zod); the client imports the rest as types only.
- A schema change is a protocol change: check that an agent running the previous config still parses (or bump `PROTOCOL_VERSION`), and update docs/DESIGN.md.
- Lesson: one sample where a dose moved EC the wrong way dragged the fitted coefficient from 0.4 to 0.12; wrong-direction samples are now dropped (`fit: … bad data is ignored`).
- Lesson: with EC unknown the model suggested pH-down, which the next nutrient step would undo; a correction now needs both readings (`correction: pH down when EC is fine; …`).

## Hub

- Code: `apps/hub/src`; tests in `apps/hub/test`.
- `Store` is the only SQL. Validate with the contracts schema on write and on read of JSON columns. Telemetry inserts are idempotent.
- Deletes keep the model whole: a deleted probe or actuator takes its schedules with it (`Store.deleteEntity`); SQLite foreign-key and agent-uniqueness failures map to 409 with a plain reason.
- `Commands` is the only path to hardware; `Control` calls it too. HTTP errors map from `NotFound` 404, `Refused` 409, `AgentOffline` 503, `CommandTimeout` 504, `ZodError` 400.
- Any setup write republishes agent configs (`publishAllConfigs`).
- The HTTP server binds loopback by default; never change the default to a public bind. MCP is stateless (a server per request).
- Lesson: per-agent sequence numbers were first used to drop replays, which would have dropped every event after an agent reinstall (counter back to 0); idempotent keys replaced them.

## Agent

- Code: `apps/agent/src`; tests in `apps/agent/test` and the hub e2e test.
- `Actuators` owns safety (see DESIGN, "Safety"); the agent ack for `run` means "queued", the actuation events report the real on/off.
- Drivers must start outputs off and must not throw from `set(false)` past a best effort. A driver that needs the device is in `hardware.ts`; anything for development is in `mock.ts`.
- State lives in `GROVER_AGENT_STATE`: `config.json` (last config) and `outbox.sqlite`.
- Lesson: a pump run stopped early (stop, reload, failure) never resolved its queue slot and blocked every later pump; `release` is now settled on every off (`stop releases the queue…`, `reloading the config…`).

## Client

- Code: `apps/client/src/app`; rules in [Angular rules](angular.md); look in [the style guide](../STYLE-GUIDE.md).
- `Hub` (service) holds the snapshot and applies live events; components derive with `computed()`. Import from `@grover/contracts` as types only, runtime helpers from `@grover/contracts/kinds`.
- Every action button is disabled when the hub socket is down, the agent is offline or the mode forbids it; the hub refusal text is shown as is.
- Setup forms (`setup/`) edit flat drafts (`drafts.ts`), convert to entities and check them with the contracts schema before sending; the zod schemas load only in the lazy setup chunks. Every save goes through `SetupApi`, which refreshes the shared snapshot.
- Signal Forms own `min`, `max` and `required` on a `[formField]` input: put them in the form schema, never as template attributes (NG8022).
- In unit tests a select bound with `[formField]` updates on the `input` event (browsers fire it with `change`); dispatch both.
- Lesson: importing `isPump` from the main contracts entry pulled zod into the dashboard chunk (447 kB → 15 kB after moving it to `kinds`).
