// Service Worker for offline play
const CACHE_NAME = 'coliseo-v3.0.2';
const urlsToCache = [
  'index.html',
  'style.css',
  'modules/index.js',
  'modules/game-state.js',
  'modules/combat-engine.js',
  'modules/ui-renderer.js',
  'modules/roguelike-system.js',
  'modules/ads-manager.js',
  'modules/reward-screen.js',
  'modules/analytics.js',
  'assets/warrior.jpg',
  'assets/orc.jpg',
  'assets/background.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
