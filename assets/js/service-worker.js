// service-worker.js
self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('elbayoumi-cache-v1').then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/assets/css/style.css',
          '/assets/js/main.js',
          '/assets/img/logo.svg'
        ]);
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
  