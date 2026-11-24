import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { loadConfig } from '../src/config.ts';
import { startHub, type RunningHub } from '../src/hub.ts';

// F-019: the installable app. The client's public files, as the hub serves them from the built client.
const pub = join(import.meta.dirname, '../../client/public');
let hub: RunningHub;
let base: string;

before(async () => {
  const dir = mkdtempSync(join(tmpdir(), 'grover-client-'));
  cpSync(pub, dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), '<!doctype html><title>Grover</title>');
  hub = await startHub(loadConfig({ dbPath: ':memory:', httpPort: 0, mqttPort: 0, clientDir: dir, timezone: 'UTC' }));
  base = `http://127.0.0.1:${hub.httpPort}`;
});
after(() => hub.close());

test('the hub serves the manifest, the service worker and the icons, with their types', async () => {
  const manifest = await fetch(`${base}/manifest.webmanifest`);
  assert.equal(manifest.status, 200);
  assert.match(manifest.headers.get('content-type') ?? '', /json/);
  const m = (await manifest.json()) as { start_url: string; display: string; icons: { src: string }[] };
  assert.equal(m.display, 'standalone');
  for (const icon of m.icons) {
    assert.ok(existsSync(join(pub, icon.src)), icon.src);
    assert.equal((await fetch(`${base}/${icon.src}`)).status, 200, icon.src);
  }
  const sw = await fetch(`${base}/sw.js`);
  assert.equal(sw.status, 200);
  assert.match(sw.headers.get('content-type') ?? '', /javascript/);
});

test('the service worker never answers for the hub: data and commands always go to the network', () => {
  const self: Record<string, unknown> = { location: { origin: 'https://grover.example' }, addEventListener() {} };
  runInNewContext(readFileSync(join(pub, 'sw.js'), 'utf8'), { self, URL, caches: {}, fetch });
  const route = self['groverRoute'] as (url: string, method: string, mode: string) => string;
  const at = (p: string) => `https://grover.example${p}`;
  assert.equal(route(at('/api/snapshot'), 'GET', 'cors'), 'network');
  assert.equal(route(at('/api/live'), 'GET', 'websocket'), 'network');
  assert.equal(route(at('/api/actuators/pump-grow/run'), 'POST', 'cors'), 'network');
  assert.equal(route(at('/mcp'), 'POST', 'cors'), 'network');
  assert.equal(route('https://elsewhere.example/x.js', 'GET', 'no-cors'), 'network');
  assert.equal(route(at('/rooms/grow-1/map'), 'GET', 'navigate'), 'page');
  assert.equal(route(at('/main-ABC123.js'), 'GET', 'cors'), 'file');
  const files = self['groverPageFiles'] as (html: string) => string[];
  assert.deepEqual(
    [
      ...files(
        // The build names its stylesheet twice (a preload and the link): kept once, or addAll refuses the lot.
        '<link rel="preload" href="styles-X1.css" as="style"><link rel="stylesheet" href="styles-X1.css"><script src="main-Y2.js" type="module"></script><link rel="icon" href="favicon.ico">',
      ),
    ],
    ['/styles-X1.css', '/main-Y2.js'],
    'the scripts and styles the page names are kept at install',
  );
});
