const CACHE = 'bc-cache-v6';
const ASSETS = [
  '/', 
  '/index.html',
  '/style.css',
  '/assets/bc-mark.svg',
  '/pages/about.html',
  '/pages/colophon.html'
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
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).catch(() => {
        // Handle offline navigation
        if (e.request.mode === 'navigate') {
          const url = new URL(e.request.url);

          // Map pretty URLs to cached HTML files
          if (url.pathname === '/about') return caches.match('/pages/about.html');
          if (url.pathname === '/colophon') return caches.match('/pages/colophon.html');

          // Generic offline fallback
          return new Response(
            `<html><body><h2>Offline</h2><p>You appear to be offline. Please try again later.</p></body></html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }

        // Non-navigation fallback
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
