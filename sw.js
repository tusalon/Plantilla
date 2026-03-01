// sw.js - Service Worker mejorado para PWA

const CACHE_NAME = 'pwa-reservas-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  '/admin-login.html',
  '/setup-wizard.html',
  '/editar-negocio.html',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('📦 Service Worker instalando...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache creado:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación - limpiar caches antiguos
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Estrategia de caché: Stale-While-Revalidate para HTML, Cache First para assets
self.addEventListener('fetch', event => {
  // Ignorar peticiones que no sean http/https
  if (!event.request.url.startsWith('http')) return;
  
  // Ignorar peticiones a Supabase (API)
  if (event.request.url.includes('supabase.co')) return;
  
  // Ignorar peticiones a ntfy.sh (notificaciones)
  if (event.request.url.includes('ntfy.sh')) return;
  
  // Ignorar peticiones a CDNs externos
  if (event.request.url.includes('cdn.') || 
      event.request.url.includes('unpkg.com') || 
      event.request.url.includes('trickle.so')) {
    return;
  }

  // Para archivos HTML: Stale-While-Revalidate
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Actualizar caché
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);
        
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Para assets (CSS, JS, imágenes): Cache First
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        // Solo cachear si es una respuesta válida y método GET
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});

// Escuchar mensajes para actualizaciones
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
      });
    });
  }
});

console.log('✅ Service Worker de PWA configurado');