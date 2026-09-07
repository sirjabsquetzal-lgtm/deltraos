/* DeltraOS service worker — app-shell cache so the PWA installs and keeps
   working offline. Bump CACHE_NAME on every deploy so clients pick up the
   new files instead of serving stale ones forever. */
const CACHE_NAME = 'deltraos-v1';
const SHELL = [
  './',
  './index.html',
  './app.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png',
  './assets/dreams/house.png',
  './assets/dreams/school.png',
  './assets/dreams/truck.png',
  './assets/dreams/studio.png',
  './assets/dreams/venue.png',
  './assets/dreams/flight.png',
  './assets/dreams/desk.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res && res.ok && req.url.startsWith(self.location.origin)) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
