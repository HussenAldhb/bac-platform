/**
 * منصة البكالوريا الذكية - Service Worker
 * @version 2.0.0
 * @description يدعم التطبيق والموقع معاً
 */

const CACHE_NAME = 'bac-platform-v2'; // تغيير الإصدار للتحديث

const urlsToCache = [
  // الصفحات الرئيسية
  '/bac-platform/',
  '/bac-platform/index.html',
  '/bac-platform/app.html',           // 🆕 صفحة التطبيق الجديدة
  '/bac-platform/404.html',
  '/bac-platform/manifest.json',
  
  // الأيقونات
  '/bac-platform/assets/icons/icon-192.png',
  '/bac-platform/assets/icons/icon-512.png',
  
  // ملفات CSS
  '/bac-platform/css/main.css',
  '/bac-platform/css/home.css',
  '/bac-platform/css/pages.css',
  
  // ملفات JavaScript
  '/bac-platform/js/main.js',
  '/bac-platform/js/home.js',
  '/bac-platform/js/app.js',           // 🆕 كود التطبيق الجديد
  '/bac-platform/js/progress-tracker.js',
  '/bac-platform/js/subjects-data.js',
  
  // صفحات المواد (كل المواد)
  '/bac-platform/pages/che.html',
  '/bac-platform/pages/phy.html',
  '/bac-platform/pages/ar.html',
  '/bac-platform/pages/sci.html',
  '/bac-platform/pages/isl.html',
  '/bac-platform/pages/en.html',
  '/bac-platform/pages/fr.html',
  '/bac-platform/pages/ma.html'
];

// ============================================
// مرحلة التثبيت - تخزين الملفات
// ============================================
self.addEventListener('install', event => {
  console.log('🔄 Service Worker: جاري التثبيت...');
  
  // التفعيل الفوري دون انتظار
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Service Worker: تم فتح الكاش');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: تم تخزين جميع الملفات');
      })
      .catch(error => {
        console.error('❌ Service Worker: فشل في تخزين بعض الملفات', error);
      })
  );
});

// ============================================
// مرحلة التنشيط - تنظيف الكاش القديم
// ============================================
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker: جاري التنشيط...');
  
  event.waitUntil(
    Promise.all([
      // السيطرة على جميع الصفحات المفتوحة فوراً
      self.clients.claim(),
      
      // حذف الكاش القديم
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log(`🗑️ Service Worker: حذف الكاش القديم ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ]).then(() => {
      console.log('✅ Service Worker: جاهز للعمل');
    })
  );
});

// ============================================
// مرحلة التعامل مع الطلبات - استراتيجية ذكية
// ============================================
self.addEventListener('fetch', event => {
  // تجاهل طلبات المتصفح الداخلية والإضافات
  if (event.request.url.includes('chrome-extension') || 
      event.request.url.includes('googleapis') ||
      event.request.url.includes('gstatic')) {
    return;
  }

  // استراتيجية مختلفة حسب نوع الطلب
  const requestUrl = new URL(event.request.url);
  
  // ===== استراتيجية 1: صفحات HTML =====
  if (event.request.mode === 'navigate' || 
      requestUrl.pathname.endsWith('.html') ||
      requestUrl.pathname === '/bac-platform/' ||
      requestUrl.pathname === '/bac-platform') {
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // إذا نجح الطلب، خزّن نسخة منه
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // إذا فشل الاتصال، حاول من الكاش
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // إذا لم نجد الصفحة المطلوبة، نعرض الصفحة الرئيسية
            if (requestUrl.pathname.includes('/pages/')) {
              return caches.match('/bac-platform/app.html');
            }
            return caches.match('/bac-platform/index.html');
          });
        })
    );
    return;
  }
  
  // ===== استراتيجية 2: الملفات الثابتة (CSS, JS, images) =====
  if (requestUrl.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|json)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // إذا كان في الكاش، أعطه مع تحديث في الخلفية
          if (cachedResponse) {
            // تحديث الكاش في الخلفية
            fetch(event.request)
              .then(response => {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, response);
                });
              })
              .catch(() => {});
            
            return cachedResponse;
          }
          
          // إذا لم يكن في الكاش، حمّله من الشبكة
          return fetch(event.request)
            .then(response => {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
              return response;
            })
            .catch(error => {
              console.log('❌ فشل تحميل الملف:', event.request.url, error);
              // إذا فشل كل شيء، نعيد استجابة فارغة
              return new Response('', { status: 404, statusText: 'Not Found' });
            });
        })
    );
    return;
  }
  
  // ===== استراتيجية 3: باقي الطلبات (API, fonts, etc) =====
  event.respondWith(
    fetch(event.request)
      .then(response => response)
      .catch(() => caches.match(event.request))
  );
});

// ============================================
// التعامل مع الإشعارات (Push Notifications)
// ============================================
self.addEventListener('push', event => {
  console.log('📬 Service Worker: استقبال إشعار', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'منصة البكالوريا',
        body: event.data.text(),
        icon: '/bac-platform/assets/icons/icon-192.png'
      };
    }
  }
  
  const options = {
    body: data.body || 'حان وقت الدراسة!',
    icon: data.icon || '/bac-platform/assets/icons/icon-192.png',
    badge: '/bac-platform/assets/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/bac-platform/app.html'
    },
    actions: [
      {
        action: 'open',
        title: '📚 فتح التطبيق'
      },
      {
        action: 'close',
        title: '⏰ لاحقاً'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'منصة البكالوريا',
      options
    )
  );
});

// ============================================
// التفاعل مع الإشعارات عند النقر عليها
// ============================================
self.addEventListener('notificationclick', event => {
  console.log('🔔 Service Worker: نقر على إشعار', event);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // فتح التطبيق
  const urlToOpen = event.notification.data?.url || '/bac-platform/app.html';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(windowClients => {
      // إذا كان هناك نافذة مفتوحة للتطبيق، استخدمها
      for (let client of windowClients) {
        if (client.url.includes('/bac-platform/') && 'focus' in client) {
          return client.focus();
        }
      }
      // وإلا افتح نافذة جديدة
      return clients.openWindow(urlToOpen);
    })
  );
});

// ============================================
// مزامنة الخلفية (Background Sync)
// ============================================
self.addEventListener('sync', event => {
  console.log('🔄 Service Worker: مزامنة خلفية', event);
  
  if (event.tag === 'sync-reminders') {
    event.waitUntil(syncReminders());
  }
});

// دالة مساعدة لمزامنة التذكيرات
async function syncReminders() {
  try {
    // هنا يمكن إضافة منطق المزامنة مع السحابة مستقبلاً
    console.log('✅ تمت مزامنة التذكيرات');
  } catch (error) {
    console.error('❌ فشلت مزامنة التذكيرات', error);
  }
}

// ============================================
// دالة مساعدة للتحقق من وجود ملف في الكاش
// ============================================
async function isCached(url) {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(url);
  return response !== undefined;
}

console.log('🚀 Service Worker: الإصدار 2.0.0 جاهز');
