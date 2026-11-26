# AGENTS.md: Grover

## Project conventions (Grover)

The project is **Grover**: a local-first controller for a home hydroponic grow (probes, lights, supply tanks, a mixing tank, per-pot feeds). The repository is `https://github.com/voidbrain/Grover`, default branch `main`, one npm workspace with three parts that share `packages/contracts`: the **hub** (`apps/hub`, Node 24 native TypeScript, SQLite, embedded MQTT broker, HTTP API, MCP), one **agent** per Raspberry Pi (`apps/agent`, drivers and safety) and the **client** (`apps/client`, Angular 22, Angular project `client`). Nothing is hosted: the hub runs on the Pi and is reached over Tailscale (`tailscale serve`), and it serves the built client from `apps/client/dist/client/browser`. [NERV](https://github.com/voidbrain/nerv) may drive Grover through the hub's MCP tools. How it all works: [docs/DESIGN.md](docs/DESIGN.md).

### Architecture

- `packages/contracts` owns every shape that crosses a boundary (domain, MQTT protocol, HTTP bodies) as zod schemas plus pure logic (schedules, the feed planner, dosing model). Hub, agent and client import it; it imports nothing of theirs. The browser imports only types and `@grover/contracts/kinds` (zod-free), so zod stays out of the client bundle.
- `packages/`, `apps/hub`, `apps/agent` and `tools/` are framework-free: no `@angular/*` (enforced by `npm run lint`, `no-restricted-imports`). Keep logic in contracts or the hub; components stay thin.
- Every input is validated with the contracts schema at the edge: HTTP bodies, MQTT payloads, SQLite JSON columns.
- Hardware moves only through `Commands` (single actions) or the `Feeder` (whole feeds) on the hub, and `Actuators` / `FeedRunner` on the agent. The agent re-checks every limit itself: never rely on the hub alone for safety.
- The agent must keep working without the hub: its config is cached in its state folder, events go through the durable outbox, schedules run locally. Feeds are planned by the hub only; the agent runs a plan and aborts it with everything off on any failed check.
- Hub inserts of readings, actuations and faults are idempotent (unique keys), so the agent may replay its outbox at any time.
- MQTT topics are per agent and authorised per client: an agent can publish only its own status/events/acks and subscribe only its own config/commands. A breaking protocol change bumps `PROTOCOL_VERSION`.
- Database changes are new entries appended to `MIGRATIONS` in `apps/hub/src/db.ts`; never edit a shipped migration.

### Style guide

- Before any UI change (templates, styles, user-facing text) read [docs/STYLE-GUIDE.md](docs/STYLE-GUIDE.md): its voice, tokens, type and spacing; `var(--…)` tokens, never a new literal colour. A new token or shared component updates it in the same change.

### Adding things

- **A probe or actuator kind**: `packages/contracts/src/kinds.ts` (id, units/limits), the `PROBE_KINDS` entry, mock behaviour in `apps/agent/src/drivers/mock.ts`, any feed role in `packages/contracts/src/feeding.ts` (and `TANK_PUMP` for a supply tank), a test in `packages/contracts/test` or the e2e test.
- **A hardware driver**: a binding variant in `ProbeBinding`/`ActuatorBinding` (`domain.ts`), its case in `apps/agent/src/drivers/hardware.ts`, a note in docs/DESIGN.md ("Hardware"). Drivers are only checked on the device: record the device check in the backlog.
- **An API route or MCP tool**: through `Commands` or the `Feeder`, never straight to `AgentLink`; a body schema in `packages/contracts/src/api.ts`; a case in `apps/hub/test/e2e.test.ts`; the MCP tool table in docs/DESIGN.md.
- **A stored entity or column**: a new migration in `db.ts`, the `Store` methods, the contracts schema.

### Checks before you finish

Before you open, update or merge a PR, read [pull requests](docs/agents/pull-requests.md).

<!-- safety:start -->
**What the agent does on its own, and what it asks first.** These rules load with this file in every session; the procedures below are read when they apply, never in place of these rules.
- On its own: branch from `main` in a separate `git worktree` (every task, single or parallel: the primary checkout stays on `main` with no edits of its own, because a running service, another session or the owner may rely on it; put worktrees in a sibling directory or under `.claude/worktrees/`; a project names what relies on its primary checkout with a project line), commit, push its branches, open PRs against `main` (then name the PR by its number in the records it touches, and push that before the checks finish), resolve conflicts on its own PRs, land its own PR through the landing queue once every check on it has passed and GitHub can merge it: one lander merges ready PRs one at a time, with at most two in CI ([parallel work](docs/agents/parallel-work.md), "Landing queue"; `node tools/merge-when-green.mjs <PR>…` waits for the checks and stops on any failing check or conflict), delete merged branches and their worktrees, reconcile and close backlog records.
- Asks first: material changes to an adopted upfront feature plan (BACKLOG-RULES, "Optional upfront feature plans"); a decision or check a record marks 🧑; repository settings (branch protection, required checks, secrets) and dismissing a code-scanning alert; rewriting published history or force-pushing; deleting what it did not create; a harness change it cannot place as project or template ("Changing a harness file").
- Never: merge with a failing or pending check, or bypass the branch protection. A project narrows this list with a project line.
- Optional push guard: `node tools/guard.mjs install` makes git refuse a push to `main`, a force-push and an archive rewrite, citing these rules (APPLY.md, "Push guard"; a Claude Code adapter does the same before the command runs). A refused operation the owner approves runs once with `HARNESS_GUARD_ALLOW=<rule>`; never set it without that approval.
- Never remove a safeguard (an ownership, evidence, privacy or safety rule) because it is old or rarely triggered, and never rewrite governing rules unattended: consolidating rules keeps every requirement ([rule review](docs/agents/rule-review.md), "Periodic rule consolidation").
- Hardware: never run a pump, switch an actuator or change a room mode on a real rig (an agent with `GROVER_DRIVERS=hardware`) to test something without the owner's go-ahead for that run; development and tests use mock drivers. <!-- project -->
- Safety layer: the agent-side limits in `apps/agent/src/actuators.ts` (pump cap, one pump at a time, watchdog, everything off on stop and shutdown) are safeguards: never loosen or bypass one without the owner's approval and a test that shows the new limit holds. <!-- project -->
<!-- safety:end -->

```bash
npm run check:freshness   # first, at session start: backlog behind main, merged branches, audit age
npm run lint              # ESLint: backend, tools and the Angular client
npm test                  # node --test: contracts, hub (incl. hub+agent end-to-end over real MQTT), agent
npm run test:client       # Angular unit tests (Vitest)
npm run build             # Angular client build (what the hub serves)
npm run typecheck         # tsc for backend and client
npm run check:backlog     # active record layout and lifecycle cues
npm run check:conventions # stack conventions (docs/agents/angular.md) and unused exports; the client through `conventions.sourceDirs` <!-- project -->
npm run format:check      # Prettier; `npm run format` fixes it
npm run check:tooling     # a formatter check and a linter exist and run in CI (required for every stack)
npm run check:fast        # pre-push bundle: format, lint, typecheck, backlog, rules <!-- project -->
npm run code:map -- <path> # exports with line ranges: read those lines, not the whole file
```

- Format and lint in CI too (`check:tooling`; a project with no source code records `tooling.exempt` with its reason).
- A failing test is evidence until shown otherwise: change its expectation only when the requirement deliberately changed, and say which; otherwise fix the code.
- A bug fix starts with a committed test that fails without the fix; the fix never edits that test to pass (BACKLOG-RULES, "A bug fix starts with a failing test").
- Replacing a feature removes its state, helpers and tests too: no dead code.
- Change what the task needs: no reformatting, refactoring or "improvements" of code the task does not touch; record an unrelated problem instead of fixing it.
- Write the least code the agreed outcome needs: no unrequested features, options or configuration, no abstraction with one use, no handling for cases that cannot occur.
- A refactor keeps behaviour: the same tests, unchanged, pass before and after. New input validation comes with tests for the invalid input.
- Node: use Node 24 (`.nvmrc`). Homebrew's `node` on the owner's Mac may be broken; use nvm's. <!-- project -->

### Changing a harness file

Before editing a file listed in `.harness.json` (`copied`, `forked`, `adapted`, or `.harness.json` itself), decide: this project only, or every project. The edit is the trigger, whatever the request's words: an "allow X" that changes how work is done is a rule.
- **This project only**: content or a setting stays here; a project line in a template section ends with `<!-- project -->`; a changed harness rule is an override (APPLY.md, "Project overrides").
- **Every project**: the template first, then reconcile here (APPLY.md, "Changing the harness from a project").
- **Unsure**: ask the user before editing. Never decide silently. (`check:freshness` lists the harness files a branch changes.)

### Procedures: read before the task

Each procedure is binding when its trigger applies: read it before the task; a short index never defers a requirement. All of them: [procedure index](docs/agents/procedures.md). `npm run check:rules` fails when a never or ask-first rule lives only in a procedure.

| Before you | Read |
|---|---|
| start a session | [session start](docs/agents/session-start.md) |
| open, update or merge a PR | [pull requests](docs/agents/pull-requests.md) |
| change Angular code (`apps/client/`) | [Angular rules](docs/agents/angular.md) |
| update or close a backlog record | [backlog rules](docs/BACKLOG-RULES.md) (it names the one file a change needs) |
| write or change documentation | [documentation](docs/backlog/documentation.md) |
| change something an output is derived from (generated pages and data, recordings, translations, guides, a value used in two places) | [change impact](docs/agents/change-impact.md); do each row `check:freshness` lists, or record why not |
| change tests or coverage | [coverage guide](docs/agents/coverage-guide.md) |
| switch tasks or hand off context | [task context](docs/agents/task-context.md) |
| work in parallel: claimed tasks, branches, model assignments | [parallel work](docs/agents/parallel-work.md) (claims inside) |
| start, change the phase of or finish a job, when `workUsage.enabled` | [job usage](docs/agents/work-usage.md) (sources, launch, effectiveness inside) |
| reassess architecture or decisions | [architecture review](docs/agents/architecture-review.md) |
| set up the project or change its stack or workflow (capability assessment) | [MCP guidance](docs/agents/mcp.md), "In short" |
| add, configure or rely on an MCP connection, or edit MCP selections | [MCP guidance](docs/agents/mcp.md) (commands inside) |
| work across repositories of a solution | [solution profile](docs/agents/solution-profile.md) (the refresh is the coordinator's: its `docs/SOLUTION.md`) |
| add or use a shared skill | [skills](docs/agents/skills.md) |
| adopt or reconcile the harness, or review maintenance evidence | [maintenance](docs/agents/maintenance.md) |
| change AGENTS.md, CLAUDE.md, BACKLOG-RULES or `docs/backlog/`; measure friction; consolidate rules | [rule review](docs/agents/rule-review.md) |
| run the agent-behaviour checks or measure a rule change, when a runner is set | [behaviour checks](docs/agents/behaviour-checks.md) |
| run an audit, or record its findings or an improvement proposal | [audit](docs/agents/audit.md) ([findings](docs/agents/audit-findings.md)) |

### Testing the joins

- A change that touches how two parts meet gets a test across both, not one per side. Unit tests on each part did not catch the bugs that reached users. Here the joins are hub↔agent (MQTT) and hub↔client/NERV (HTTP, MCP): `apps/hub/test/e2e.test.ts` runs a real hub and a real agent with mock drivers; extend it.

### Known pitfalls

- Node type stripping refuses `.ts` files under `node_modules`. Workspace packages work because npm links them and Node resolves the real path; do not install `@grover/contracts` as a copied package.
- `aedes` keeps retained messages in memory: after a hub restart the agent gets its config again only because the hub republishes on connect (`AgentLink` `client` event). Keep that.
- A pump run on the agent resolves its queue slot only when the pump goes off; every path that stops a pump must go through `Actuators.turn` (see `actuators.test.ts`, "stop releases the queue").

## Area notes

Before changing an area, read its section in [docs/agents/areas.md](docs/agents/areas.md): the rules and lessons there are as binding as this file.

| Area | Covers |
|---|---|
| Contracts | `packages/contracts`: domain, protocol, schedules, feed planner, dosing model |
| Hub | `apps/hub`: store, broker and agent link, commands, feeder, alerts, HTTP, MCP |
| Agent | `apps/agent`: drivers and the simulated rig, actuator safety, feed runner, outbox, schedule runner |
| Client | `apps/client`: Angular dashboard and probe history |

The reviewer subagents in `.claude/agents/` (mechanical, design) cover every area.

## Privacy

- Never commit secrets, agent tokens, Tailscale names or IPs, or personal data. Test data is neutral and invented. `.env` and `data/` are ignored.

## Work tracking

**At the start of every session, before other work, run `npm run check:freshness`** and do what it lists, as [session start](docs/agents/session-start.md) says.

- This backlog owns only this repository's work: reject foreign next actions and closure conditions; a master never waits on what derives from it (BACKLOG-RULES, "One repository, one backlog").
- Keep a confirmed bug, a candidate fix, an unimplemented feature and a completed check distinct: a merge is not verification, a unit test is not a visual, pointer or device check, a green CI run proves only the checks it ran. Archives and audits are dated evidence, not current status.
- A plan or promise given to the user (steps, a table to build, a later fix) becomes backlog records in the same change, and the reply names them. Nothing promised lives only in the conversation.
- When a request reads two ways that change the result, name both and ask before working; when the choice is cheap to undo, state the assumption in the record and the PR and go on. Never pick silently.
