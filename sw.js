const CACHE_NAME = 'bac-platform-v1';
const urlsToCache = [
  '/bac-platform/',
  '/bac-platform/index.html',
  '/bac-platform/404.html',
  '/bac-platform/manifest.json',
  '/bac-platform/assets/icons/icon-192.png',
  '/bac-platform/assets/icons/icon-512.png',
  '/bac-platform/css/main.css',
  '/bac-platform/css/home.css',
  '/bac-platform/css/pages.css',
  '/bac-platform/js/main.js',
  '/bac-platform/js/home.js',
  '/bac-platform/js/progress-tracker.js',
  '/bac-platform/js/subjects-data.js',
  '/bac-platform/pages/che.html',
  '/bac-platform/pages/phy.html',
  '/bac-platform/pages/ar.html',
  '/bac-platform/pages/sci.html',
  '/bac-platform/pages/isl.html',
  '/bac-platform/pages/en.html',
  '/bac-platform/pages/fr.html',
  '/bac-platform/pages/ma.html'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // التفعيل الفوري
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // تجاهل طلبات المتصفح الداخلية
  if (event.request.url.includes('chrome-extension')) return;

  // معالجة طلبات التنقل (الصفحات)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => response)
        .catch(() => caches.match('/bac-platform/index.html'))
    );
    return;
  }

  // باقي الطلبات (الملفات الثابتة) من الكاش أولاً
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});
