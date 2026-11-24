/*
 * Grover's service worker (F-019): the installed app opens without the hub. It keeps the app's own files (the page,
 * its scripts and styles, icons) and never answers for the hub: /api, /mcp and the live socket always go to the
 * network, so a reading or a command is never served from a cache. The last snapshot shown offline comes from the
 * client's own cache, not from here.
 */
const SHELL = 'grover-shell-v1';
const START = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/icon.svg'];

/** What to do with a request: 'network' (leave it alone), 'page' (network first, the cached page offline), 'file'. */
function route(url, method, mode) {
  const u = new URL(url);
  if (method !== 'GET' || u.origin !== self.location.origin) return 'network';
  if (u.pathname.startsWith('/api/') || u.pathname === '/api' || u.pathname.startsWith('/mcp')) return 'network';
  if (mode === 'navigate') return 'page';
  return 'file';
}
self.groverRoute = route;

/** The scripts and styles a page names (hashed by the build, so the right ones for that page). */
function pageFiles(html) {
  // Each once: the build names its stylesheet twice, and addAll refuses a list with a repeat.
  const paths = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(
    (m) => new URL(m[1], self.location.origin).pathname,
  );
  return [...new Set(paths)];
}
self.groverPageFiles = pageFiles;

const isPage = (res) => (res.headers.get('content-type') || '').includes('text/html');

/** Fetches a file and keeps it if it is what was asked for: never the page (a hub may answer unknown names with it). */
async function keepFile(cache, request) {
  const res = await fetch(request);
  if (res.ok && !isPage(res)) await cache.put(request, res.clone());
  return res;
}

/**
 * Keeps a page and the files it names. A page naming other files is a new build: the old build's files (hashed
 * names) are dropped, so the cache does not grow and a broken entry cannot outlive a deploy.
 */
async function keepPage(html, headers) {
  const cache = await caches.open(SHELL);
  const old = await cache.match('/');
  const files = pageFiles(html);
  if (old && pageFiles(await old.text()).join() !== files.join()) {
    const keep = new Set([...START, ...files].map((p) => new URL(p, self.location.origin).href));
    for (const k of await cache.keys()) if (!keep.has(k.url)) await cache.delete(k);
  }
  await cache.put('/', new Response(html, { headers }));
  for (const f of files) if (!(await cache.match(f))) await keepFile(cache, f).catch(() => {});
}

/** Keeps the page and everything it needs to start, so it opens without the hub. */
async function keepShell() {
  const page = await fetch('/', { cache: 'no-store' });
  if (!page.ok || !isPage(page)) throw new Error(`page ${page.status}`);
  await keepPage(await page.text(), page.headers);
  const cache = await caches.open(SHELL);
  for (const f of START.filter((p) => p !== '/')) await keepFile(cache, f);
}

self.addEventListener('install', (event) => {
  event.waitUntil(keepShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const kind = route(event.request.url, event.request.method, event.request.mode);
  if (kind === 'network') return;
  if (kind === 'page') {
    // The newest page when the hub answers with one; the kept page when it cannot be reached or fails (a proxy's
    // 502 while the hub restarts). Anything else (an icon opened in a tab) is passed on and never kept as the page.
    event.respondWith(
      fetch(event.request)
        .then(async (res) => {
          if (res.ok && isPage(res)) {
            const html = await res.clone().text();
            event.waitUntil(keepPage(html, res.headers).catch(() => {}));
            return res;
          }
          if (res.status >= 500) return (await caches.match('/')) ?? res;
          return res;
        })
        .catch(async () => (await caches.match('/')) ?? Response.error()),
    );
    return;
  }
  // Scripts and styles have hashed names: a kept copy is the right one; fetch and keep what is missing.
  event.respondWith(
    caches.match(event.request).then(async (hit) => hit ?? keepFile(await caches.open(SHELL), event.request)),
  );
});
