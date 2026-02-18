const CACHE_NAME = 'bac-platform-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/404.html',
  '/manifest.json',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/css/main.css',
  '/css/home.css',
  '/css/pages.css',
  '/js/main.js',
  '/js/home.js',
  '/js/progress-tracker.js',
  '/js/subjects-data.js',
  '/pages/che.html',
  '/pages/phy.html',
  '/pages/ar.html',
  '/pages/sci.html',
  '/pages/isl.html',
  '/pages/en.html',
  '/pages/fr.html',
  '/pages/ma.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});
