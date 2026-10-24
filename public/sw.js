// Tech Infinix Admin PWA Service Worker
const CACHE_NAME = "ti-admin-pwa-v1";
const STATIC_ASSETS = [
  "/manifest.json",
  "/icon.png",
  "/apple-icon.png",
  "/favicon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Let Next.js dynamic API routes and WebSockets stream in real time without caching
  const url = new URL(event.request.url);
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/ws") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  // Network-first for HTML pages to guarantee fresh lead and sales data
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return caches.match("/manifest.json");
        });
      })
  );
});
