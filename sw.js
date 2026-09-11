const CACHE = 'shifter-v48-offline';
const FILES = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/shifter-icon-192.png',
  '/shifter-icon-512.png',
  '/shifter-icon-512-maskable.png',
  '/assetlinks.json'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES)).catch(err => console.log('cache fail', err))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // For navigation requests, serve index.html offline
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html')).then(r => r || caches.match('/'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      // cache new files
      if (res.ok && e.request.method === 'GET' && e.request.url.startsWith(self.location.origin)) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => cached))
  );
});
