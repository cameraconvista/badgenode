/* BADGENODE Service Worker - navigation fallback + asset caching */
const CACHE_VERSION = 'v4';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;
const PRECACHE_URLS = [
  '/',              // start_url
  '/offline.html',  // fallback pagina offline
  '/manifest.json',
  '/favicon.ico',   // evita errori in console offline
  // Nota: gli asset fingerprintati verranno presi runtime con cache-first
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
        .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* Strategie:
   - HTML: network-first con fallback offline.html
   - Asset fingerprintati (css/js/png/webp… in /assets/): cache-first
   - Icone (png, svg, ico nella root): stale-while-revalidate
   - Supabase: network-only (bypass SW)
*/
const ASSETS_REGEX = /^\/assets\/.+\.(?:js|css|png|webp|jpg|svg|ico)$/i;
const ROOT_ICONS_REGEX = /^\/(?:favicon\.ico|.*\.png|.*\.svg)$/i;
const SUPABASE_REGEX = /^https?:\/\/([a-z0-9-]+\.)*supabase\.co\//i;

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Bypassa Supabase completamente
  if (SUPABASE_REGEX.test(request.url)) return;

  // Navigazioni (HTML)
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const net = await fetch(request);
        // Cache "page shell" in background (best-effort)
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, net.clone()).catch(()=>{});
        return net;
      } catch (_) {
        // Fallback: pagina visitata in cache o offline.html
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        const precached = await caches.open(STATIC_CACHE);
        return (await precached.match('/offline.html')) || Response.error();
      }
    })());
    return;
  }

  // Asset fingerprintati in /assets -> cache-first
  const url = new URL(request.url);
  if (url.origin === self.location.origin && ASSETS_REGEX.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const net = await fetch(request);
        cache.put(request, net.clone()).catch(()=>{});
        return net;
      } catch (_) {
        return cached || Response.error();
      }
    })());
    return;
  }

  // Icone root -> stale-while-revalidate
  if (url.origin === self.location.origin && ROOT_ICONS_REGEX.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const netPromise = fetch(request).then(res => {
        cache.put(request, res.clone()).catch(()=>{});
        return res;
      }).catch(()=>null);
      return cached || (await netPromise) || Response.error();
    })());
    return;
  }

  // Default: passa rete
});