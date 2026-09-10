
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open('shifter-v47').then(c => c.addAll(['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png']))); });
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
