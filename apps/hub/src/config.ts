import { resolve } from 'node:path';

export interface HubConfig {
  dbPath: string;
  /** HTTP API, live WebSocket, MCP and the client build. Loopback by default: expose it with `tailscale serve`. */
  httpHost: string;
  httpPort: number;
  /** MQTT for agents. Loopback by default; set to the Tailscale IP (or 0.0.0.0) when agents run on other machines. */
  mqttHost: string;
  mqttPort: number;
  /** Built Angular client, served at /. */
  clientDir: string;
  timezone: string;
  /**
   * Host names the HTTP API answers to besides loopback, e.g. the Pi's `pi.tailnet.ts.net` behind `tailscale serve`.
   * Anything else is refused, against DNS rebinding.
   */
  allowedHosts: string[];
  /** Browser origins allowed besides the hub's own (e.g. the Angular dev server). */
  allowedOrigins: string[];
  /** How long a command waits for the agent's ack. */
  commandTimeoutMs: number;
}

const env = (name: string): string | undefined => process.env[name] || undefined;
const list = (value: string | undefined): string[] =>
  (value ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

export function loadConfig(overrides: Partial<HubConfig> = {}): HubConfig {
  return {
    dbPath: resolve(env('GROVER_DB') ?? 'data/hub.sqlite'),
    httpHost: env('GROVER_HTTP_HOST') ?? '127.0.0.1',
    httpPort: Number(env('GROVER_HTTP_PORT') ?? 8080),
    mqttHost: env('GROVER_MQTT_HOST') ?? '127.0.0.1',
    mqttPort: Number(env('GROVER_MQTT_PORT') ?? 1883),
    clientDir: resolve(env('GROVER_CLIENT_DIR') ?? 'apps/client/dist/client/browser'),
    timezone: env('GROVER_TZ') ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    allowedHosts: list(env('GROVER_ALLOWED_HOSTS')),
    allowedOrigins: list(env('GROVER_ALLOWED_ORIGINS')),
    commandTimeoutMs: Number(env('GROVER_COMMAND_TIMEOUT_MS') ?? 10_000),
    ...overrides,
  };
}
