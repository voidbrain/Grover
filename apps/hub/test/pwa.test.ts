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

// Review of #31: the worker's fetch handling, run for real against fake caches and a fake network.
const ORIGIN = 'https://grover.example';
function worker(network: (req: Request) => Promise<Response>) {
  const listeners: Record<string, (ev: any) => void> = {};
  const stores = new Map<string, Map<string, Response>>();
  const key = (k: string | Request) => (typeof k === 'string' ? new URL(k, ORIGIN).href : k.url);
  const open = async (name: string) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const m = stores.get(name)!;
    return {
      put: async (k: string | Request, res: Response) => void m.set(key(k), res),
      match: async (k: string | Request) => m.get(key(k))?.clone(),
      keys: async () => [...m.keys()].map((u) => new Request(u)),
      delete: async (k: string | Request) => m.delete(key(k)),
      addAll: async (list: string[]) => {
        for (const u of list) m.set(key(u), await network(new Request(key(u))));
      },
    };
  };
  const caches = {
    open,
    keys: async () => [...stores.keys()],
    delete: async (n: string) => stores.delete(n),
    match: async (k: string | Request) => {
      for (const m of stores.values()) if (m.has(key(k))) return m.get(key(k))!.clone();
      return undefined;
    },
  };
  const self: Record<string, unknown> = {
    location: { origin: ORIGIN },
    addEventListener: (t: string, f: (ev: any) => void) => void (listeners[t] = f),
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
  };
  const fetchFn = (r: string | Request, init?: RequestInit) =>
    network(typeof r === 'string' ? new Request(new URL(r, ORIGIN).href, init) : new Request(r.url));
  runInNewContext(readFileSync(join(pub, 'sw.js'), 'utf8'), {
    self,
    URL,
    Request,
    Response,
    caches,
    fetch: fetchFn,
    Promise,
    Set,
    Map,
  });
  const run = async (type: string, request?: Request) => {
    const waits: Promise<unknown>[] = [];
    let answer: Promise<Response> | undefined;
    listeners[type]!({
      request,
      respondWith: (p: Promise<Response>) => (answer = p),
      waitUntil: (p: Promise<unknown>) => waits.push(p),
    });
    const res = await answer;
    await Promise.all(waits);
    return res;
  };
  // Node's Request refuses mode 'navigate' (only a browser makes one): a request-like object stands in for it.
  const page = (path = '/') => ({ url: ORIGIN + path, method: 'GET', mode: 'navigate' }) as unknown as Request;
  return { run, page, stores, file: (p: string) => new Request(ORIGIN + p) };
}
const html = (main: string) =>
  new Response(`<link rel="stylesheet" href="styles-1.css"><script src="${main}"></script>`, {
    headers: { 'content-type': 'text/html' },
  });
const js = (body: string) => new Response(body, { headers: { 'content-type': 'text/javascript' } });

test('after a rebuild, a script the hub answers with its page is not kept as the script', async () => {
  let build = 'main-OLD.js';
  let restarted = false;
  const w = worker(async (req) => {
    const p = new URL(req.url).pathname;
    if (p === '/') return html(build);
    if (p === '/main-NEW.js' && !restarted) return html(build); // the hub indexed its files before the build
    if (p.endsWith('.js')) return js(`// ${p}`);
    if (p.endsWith('.css')) return new Response('a{}', { headers: { 'content-type': 'text/css' } });
    return new Response('x', { headers: { 'content-type': 'image/png' } });
  });
  await w.run('install');
  build = 'main-NEW.js';
  await w.run('fetch', w.page('/'));
  restarted = true;
  const script = await w.run('fetch', w.file('/main-NEW.js'));
  assert.equal(script!.headers.get('content-type'), 'text/javascript');
  assert.equal(await script!.text(), '// /main-NEW.js');
});

test('a hub that answers 502 (tailscale up, hub down) gets the kept page; a non-page navigation does not replace it', async () => {
  let down = false;
  const w = worker(async (req) => {
    const p = new URL(req.url).pathname;
    if (down) return new Response('bad gateway', { status: 502 });
    if (p === '/') return html('main-A.js');
    if (p === '/icon-512.png') return new Response('png', { headers: { 'content-type': 'image/png' } });
    return js('ok');
  });
  await w.run('install');
  await w.run('fetch', w.page('/icon-512.png'));
  down = true;
  const res = await w.run('fetch', w.page('/rooms/grow-1/map'));
  assert.equal(res!.status, 200);
  assert.match(await res!.text(), /main-A\.js/);
});

test("a new build drops the files of the old one; the hub's data is never answered", async () => {
  let build = 'main-OLD.js';
  const w = worker(async (req) => {
    const p = new URL(req.url).pathname;
    if (p === '/') return html(build);
    return new Response('x', {
      headers: {
        'content-type': p.endsWith('.js') ? 'text/javascript' : p.endsWith('.css') ? 'text/css' : 'image/png',
      },
    });
  });
  await w.run('install');
  build = 'main-NEW.js';
  await w.run('fetch', w.page('/'));
  const kept = [...[...w.stores.values()][0]!.keys()].map((u) => new URL(u).pathname);
  assert.ok(kept.includes('/main-NEW.js'));
  assert.ok(!kept.includes('/main-OLD.js'), kept.join(' '));
  assert.equal(await w.run('fetch', w.file('/api/snapshot')), undefined, 'left to the network');
});

test('the hub answers a missing file with 404, not with the page', async () => {
  const res = await fetch(`${base}/main-MISSING.js`);
  assert.equal(res.status, 404);
  assert.equal((await fetch(`${base}/rooms/grow-1/map`)).status, 200, 'app routes still get the page');
});
