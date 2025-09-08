// BADGEBOX Service Worker - STEP 8
// PWA offline support con caching sicuro

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `badgebox-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `badgebox-runtime-${CACHE_VERSION}`;

// Assets da pre-cachare (app shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/utenti.html', 
  '/storico.html',
  '/ex-dipendenti.html',
  '/offline.html',
  '/manifest.json',
  '/style.css',
  // Icone PWA essenziali
  '/assets/icons/badgenode-192.png',
  '/assets/icons/badgenode-512.png',
  '/assets/icons/bnapp.png',
  '/assets/icons/bagdenodelogo.png',
  // Icone UI comuni
  '/assets/icons/calendario.png',
  '/assets/icons/freccia-sinistra.png',
  '/assets/icons/matita-colorata.png',
  '/assets/icons/orologio.png',
  '/assets/icons/pdf.png',
  '/assets/icons/esporta.png'
];

// Install: precache degli asset statici
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[SW] Pre-cache failed:', error);
        // Non bloccare l'install per errori di cache
      })
  );
  
  // Forza l'attivazione del nuovo SW
  self.skipWaiting();
});

// Activate: pulizia cache vecchie
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
  
  // Prendi controllo di tutti i client immediatamente
  self.clients.claim();
});

// Fetch: strategie di cache per diversi tipi di risorsa
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // ESCLUDERE SEMPRE Supabase da qualsiasi cache
  if (url.hostname.includes('supabase.co') || 
      url.pathname.includes('/rest/v1/') ||
      url.pathname.includes('/storage/v1/')) {
    console.log('[SW] Network-only for Supabase:', url.pathname);
    return; // Lascia che vada direttamente alla rete
  }
  
  // Navigazioni HTML: Network-First → fallback offline.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache la risposta se è una pagina HTML principale
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Offline: ritorna la pagina offline
          console.log('[SW] Navigate offline, serving offline.html');
          return caches.match('/offline.html')
            .then((offlineResponse) => offlineResponse || new Response('Offline'));
        })
    );
    return;
  }
  
  // Asset statici fingerprintati (/assets/): Cache-First
  if (url.pathname.startsWith('/assets/') && 
      (url.pathname.includes('.js') || url.pathname.includes('.css'))) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => cache.put(request, responseClone));
              }
              return response;
            });
        })
        .catch(() => {
          // Fallback vuoto per asset mancanti
          return new Response('', { status: 404 });
        })
    );
    return;
  }
  
  // Icone (/assets/icons/): Stale-While-Revalidate
  if (url.pathname.startsWith('/assets/icons/')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => cache.put(request, responseClone));
              }
              return response;
            })
            .catch(() => null);
          
          // Ritorna cache se disponibile, altrimenti aspetta network
          return cachedResponse || fetchPromise;
        })
    );
    return;
  }
  
  // HTML statici: Cache-First con network fallback
  if (request.url.includes('.html') || request.url.includes('manifest.json')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          return cachedResponse || fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => cache.put(request, responseClone));
              }
              return response;
            });
        })
        .catch(() => {
          // Per errori di rete, ritorna offline.html se è una navigazione
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return new Response('Offline', { status: 503 });
        })
    );
    return;
  }
});

// Gestione messaggi dal main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded');