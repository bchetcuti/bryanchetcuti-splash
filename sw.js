  const CACHE = 'bc-cache-v5';
  const ASSETS = [
    '/',
    '/index.html',
    '/about',
    '/pages/about.html',
    '/colophon',
    '/pages/colophon.html',
    '/style.css',
    '/assets/bc-mark.svg'
  ];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(e.request).catch(() => {
        console.warn('Fallback triggered for:', e.request.url);
        if (e.request.mode === 'navigate') {
          return new Response(
            '<html><body><h2>Offline</h2><p>You appear to be offline. Please try again later.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
