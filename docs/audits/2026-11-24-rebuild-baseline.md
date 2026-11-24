# Rebuild baseline audit

Scoped review, 2026-11-24, of the v2 rebuild on branch `rebuild/v2` before its first commit. Baseline commit: `master` at `5d96c918a010f6d2d63ff295f321725b89d509e0` (the pre-rebuild code, tagged `legacy-v1`), plus the uncommitted rebuild tree.

## Scope and method

The whole new tree was written in this session and read in full while writing: `packages/contracts`, `apps/hub`, `apps/agent`, `apps/client`, `tools/dev.ts`, docs. Checks run locally on Node 24.19.0 (macOS):

| Check | Result |
|---|---|
| `npm run typecheck` (backend and client) | pass |
| `npm test` (25 tests: contracts, agent safety, hub+agent e2e over MQTT, MCP) | pass |
| `npm run test:client` (3 tests) | pass |
| `npm run build` | pass; initial 271 kB, dashboard chunk 15 kB |
| `npm run lint`, `npm run format:check` | pass |
| `npm run dev` smoke: health, probe read, pump run, dose suggestion, client served | pass |

The old code (PHP server, Angular 18 client, Node device) was not audited: it was removed and kept at `legacy-v1`.

## Areas

- **Code, logic**: checked. Findings fixed during the session, each with the test that now covers it: wrong-direction dose samples skewed the model; a pump stopped early blocked the pump queue; dosing on a missing EC reading; sequence-based replay filtering would have dropped events after an agent reinstall (replaced by idempotent inserts).
- **Tests**: checked. Gaps recorded: no device tests (F-003), no browser or accessibility tests (F-009).
- **Documentation**: checked against the code (README, DESIGN, STYLE-GUIDE, AGENTS, areas).
- **Harness**: checked; `check:conventions` cannot see the client in this layout (B-002).
- **Security**: checked by design review only. The hub binds loopback and relies on Tailscale for who can reach HTTP and MCP; agents authenticate to MQTT with per-agent tokens (hashed) and are confined to their own topics (e2e test). No login on the HTTP API or MCP beyond tailnet membership: accepted for a single-owner tailnet, revisit if the tailnet is shared.
- **Backlog**: checked; seeded with F-001 to F-010 and B-001, B-002.
- **Delivery**: blocked. Nothing has run on the Pi yet (F-003, F-005) and the PR's CI has not run.

## Limits

No hardware, no Raspberry Pi, no Tailscale or NERV connection were available. Security review was not a penetration test.
