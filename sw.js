// Keeps Crescent Field working offline once it has been opened.
// Change VERSION whenever any file below changes, so installed copies pick up the update.
const VERSION = 'crescent-field-20261123-112122';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== VERSION).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

// The page itself: the latest version when online, the saved copy when not.
// Everything else: the saved copy first, as those files change only with a new VERSION.
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request)
      .then(response => {
        if (response.ok) { const copy = response.clone(); caches.open(VERSION).then(cache => cache.put('./', copy)); }
        return response;
      })
      .catch(() => caches.match('./')));
    return;
  }
  event.respondWith(caches.match(request).then(hit => hit || fetch(request)));
});
