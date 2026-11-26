import { mkdtempSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

/**
 * `npm run e2e`: builds the client, starts `npm run dev` (hub + simulated agent) on a free port with a fresh data
 * folder, and runs the browser tests against it, headless. Workers load this file again: the environment carries the
 * port and folder chosen by the first load, so they all reach the same dev stack.
 */
async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolve(typeof address === 'object' && address ? address.port : 0));
    });
  });
}

const port = (process.env['GROVER_E2E_PORT'] ??= String(await freePort()));
const dataDir = (process.env['GROVER_E2E_DATA'] ??= mkdtempSync(join(tmpdir(), 'grover-e2e-')));
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: '.',
  forbidOnly: !!process.env['CI'],
  retries: 0,
  reporter: [['list']],
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    cwd: join(import.meta.dirname, '..'),
    url: `${baseURL}/api/snapshot`,
    reuseExistingServer: false,
    timeout: 60_000,
    gracefulShutdown: { signal: 'SIGINT', timeout: 5_000 },
    env: { GROVER_HTTP_PORT: port, GROVER_MQTT_PORT: '0', GROVER_DEV_DIR: dataDir },
  },
});
