import { resolve } from 'node:path';

export interface AgentEnv {
  agentId: string;
  token: string;
  /** mqtt://<hub tailscale name or IP>:1883 */
  hubUrl: string;
  stateDir: string;
  /** 'mock' forces simulated drivers for every binding (development); 'hardware' uses the bindings. */
  drivers: 'mock' | 'hardware';
  version: string;
}

export function loadEnv(overrides: Partial<AgentEnv> = {}): AgentEnv {
  const e = process.env;
  const out: AgentEnv = {
    agentId: e['GROVER_AGENT_ID'] ?? '',
    token: e['GROVER_AGENT_TOKEN'] ?? '',
    hubUrl: e['GROVER_HUB_MQTT'] ?? 'mqtt://127.0.0.1:1883',
    stateDir: resolve(e['GROVER_AGENT_STATE'] ?? 'data/agent'),
    drivers: e['GROVER_DRIVERS'] === 'hardware' ? 'hardware' : 'mock',
    version: '2.0.0-dev',
    ...overrides,
  };
  if (!out.agentId || !out.token)
    throw new Error(
      'GROVER_AGENT_ID and GROVER_AGENT_TOKEN are required (issue a token on the hub: POST /api/agents/<id>/token)',
    );
  return out;
}
