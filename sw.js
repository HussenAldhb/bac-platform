const CACHE_NAME = 'bac-platform-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/404.html',
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
  '/pages/ma.html',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// تثبيت Service Worker وتخزين الملفات في الكاش
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ تم فتح الكاش');
        return cache.addAll(urlsToCache);
      })
  );
});

// استرجاع الملفات من الكاش عند الطلب (إذا كانت متوفرة)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا وجد الملف في الكاش، أرجعه، وإلا أرسل الطلب للإنترنت
        return response || fetch(event.request);
      })
      .catch(() => {
        // إذا فشل كل شيء (مثلاً لا يوجد اتصال ولا ملف في الكاش)، أعد توجيه لصفحة 404
        if (event.request.mode === 'navigate') {
          return caches.match('/404.html');
        }
      })
  );
});

// تنظيف الكاش القديم عند تحديث الإصدار
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});