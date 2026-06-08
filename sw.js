const CACHE_NAME = 'phys-quiz-v4';
const ASSETS = [
  './',
  './index.html',
  './calculator.html',
  './periodic-table.html',
  './manifest.json',
  './questions.json',
  './subscribers.json'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(c) {
      return c.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var fetchPromise = fetch(e.request).then(function(response) {
        if (response && response.status === 200 && response.headers.get('Content-Type') && 
            (response.headers.get('Content-Type').includes('text') || 
             response.headers.get('Content-Type').includes('application/json'))) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, copy); });
        }
        return response;
      }).catch(function() { return cached; });
      return cached || fetchPromise;
    })
  );
});
