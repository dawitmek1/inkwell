const V = 'inkwell-v4';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(V)
      .then(c => c.addAll(['./index.html', './manifest.json']))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request)
      .then(hit => hit || fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(V).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match('./index.html'))
      )
  );
});
