const CACHE_NAME = 'missile-fleet-v2';
const urlsToCache = [
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/cake.js',
  './js/formation.js',
  './js/support.js',
  './js/weapons.js',
  './js/main.js',
  './js/levels.js',
  './js/ship.js',
  './js/math.js',
  './js/explosion.js',
  './js/player.js',
  './js/touch_controls.js',
  './js/projectile.js',
  './js/fullscreen.js',
  './js/level.js',
  './js/controlled_node.js',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Cache resources one by one to avoid failing if one resource is missing
        return Promise.allSettled(
          urlsToCache.map(url =>
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
              return Promise.resolve();
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200) {
            return response;
          }

          // Only cache successful responses (but allow opaque responses for CORS)
          if (response.type === 'basic' || response.type === 'cors') {
            // Clone the response
            const responseToCache = response.clone();

            // Cache the new resource
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        }).catch(() => {
          // Provide context-specific offline fallbacks
          if (event.request.destination === 'document') {
            // For HTML requests, try to return cached index page
            return caches.match('./index.html').then(cachedResponse => {
              return cachedResponse || new Response('Offline - Please visit while online first', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
          }
          // For other resources, just indicate offline
          return new Response('', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});
