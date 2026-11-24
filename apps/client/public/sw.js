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

/** Keeps the page and everything it needs to start, so it opens without the hub. */
async function keepShell() {
  const cache = await caches.open(SHELL);
  const page = await fetch('/', { cache: 'no-store' });
  if (!page.ok) throw new Error(`page ${page.status}`);
  const html = await page.clone().text();
  await cache.put('/', page);
  await cache.addAll([...START.filter((p) => p !== '/'), ...pageFiles(html)]);
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
    // The newest page when the hub answers (it names the newest scripts); the kept one otherwise.
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          // A new page names new scripts: keep them too before the hub goes away.
          if (res.ok)
            event.waitUntil(
              res
                .clone()
                .text()
                .then((html) =>
                  caches
                    .open(SHELL)
                    .then((c) =>
                      Promise.all([
                        c.put('/', new Response(html, { headers: res.headers })),
                        c.addAll(pageFiles(html)),
                      ]),
                    ),
                )
                .catch(() => {}),
            );
          return res;
        })
        .catch(() => caches.match('/')),
    );
    return;
  }
  // Scripts and styles have hashed names: a kept copy is the right one; fetch and keep what is missing.
  event.respondWith(
    caches.match(event.request).then(
      (hit) =>
        hit ??
        fetch(event.request).then((res) => {
          if (res.ok) event.waitUntil(caches.open(SHELL).then((c) => c.put(event.request, res.clone())));
          return res;
        }),
    ),
  );
});
