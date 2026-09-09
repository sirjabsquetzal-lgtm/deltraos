// DeltraOS — minimal offline app-shell cache.
// Paths are resolved against this script's own scope so the same file works
// whether the app is served from the site root or a subpath (GitHub Pages).
//
// Vite fingerprints every built JS/CSS file with a content hash, so those
// files are safe to cache-first forever — a given hash never changes.
// index.html is NOT safe to cache-first: it's the file that references
// those hashes, and it gets overwritten on every deploy. Serving a stale
// cached index.html after a redeploy sends the browser looking for a JS
// bundle that no longer exists on the server (404), and the app never
// mounts — a blank white screen. So HTML/navigation requests go
// network-first, with the cache only as an offline fallback.
const CACHE = 'deltraos-v4';
const BASE = new URL('./', self.location).href;
const SHELL = [BASE, BASE + 'index.html', BASE + 'manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // Network-first: a redeploy is visible on the very next load.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match(BASE + 'index.html')))
    );
    return;
  }

  // Fingerprinted assets and other static files: cache-first is safe and fast.
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.ok && req.url.startsWith(self.location.origin)) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
