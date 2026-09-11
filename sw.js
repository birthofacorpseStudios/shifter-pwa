const CACHE = 'shifter-v50-offline-final';
const FILES = [
  '/index.html',
  '/manifest.webmanifest',
  '/shifter-icon-192.png',
  '/shifter-icon-512.png',
  '/shifter-icon-512-maskable.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(FILES).then(() => {
        // Also cache / as index.html so start_url works offline
        return fetch('/index.html').then(r => cache.put('/', r.clone())).catch(()=>{});
      });
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(()=> self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request).then(r => {
        // save good version
        if (r.ok) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return r;
      }).catch(() => {
        return caches.match('/index.html').then(r => r || caches.match('/').then(rr => rr || caches.match(e.request)));
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && e.request.method === 'GET' && e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
