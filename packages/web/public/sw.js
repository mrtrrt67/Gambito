// Gambito Service Worker - Aggiornamenti Automatici e Supporto Offline
const CACHE_NAME = 'gambito-v1.1';

// Installazione: attiva subito il nuovo service worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Attivazione: ripulisci vecchie cache e prendi il controllo dei client
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategia Network-First per HTML (così gli aggiornamenti arrivano subito), Cache-First per static assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Per navigazioni / documenti HTML: prova la rete prima, per garantire gli aggiornamenti del programma
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return response;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Per gli asset statici (JS/CSS/Font/Icone): prova la cache, altrimenti rete e metti in cache
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((response) => {
        if (response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return response;
      });
    })
  );
});
