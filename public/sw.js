// Tech Infinix Admin PWA Auto-Updating Service Worker
const CACHE_NAME = "ti-admin-pwa-v" + Date.now();
const STATIC_ASSETS = [
  "/manifest.json",
  "/icon.png",
  "/icon-192.png",
  "/notification-icon.png",
  "/notification-badge.png",
  "/apple-icon.png",
  "/favicon.png"
];

// Force instant installation & skip waiting
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Purge all old caches and claim clients immediately so new UI takes effect
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
    }).then(() => self.clients.claim())
  );
});

// Message listener for skipWaiting trigger
self.addEventListener("message", (event) => {
  if (event.data && (event.data.action === "skipWaiting" || event.data.type === "SKIP_WAITING")) {
    self.skipWaiting();
  }
});

// Network-first strategy: Always fetch fresh code & UI from server
// Only fall back to cache when offline
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Bypass API calls, WebSockets, and non-GET requests
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/ws") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  // Network-first for all HTML, JavaScript, and CSS so UI updates immediately
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful GET responses for static assets
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (url.pathname.endsWith(".png") || url.pathname.endsWith(".ico") || url.pathname === "/manifest.json")
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
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

// ── Web Push Notifications (Background & Offline PWA Delivery) ────────────────
self.addEventListener("push", (event) => {
  let data = {
    title: "🔔 Tech Infinix Alert",
    body: "New notification received in Tech Infinix CRM.",
    icon: "/notification-icon.png",
    badge: "/notification-badge.png",
    data: { url: "/admin/dashboard" }
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (err) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/notification-icon.png",
    badge: data.badge || "/notification-badge.png",
    vibrate: [200, 100, 200, 100, 200],
    data: data.data || { url: "/admin/dashboard" },
    tag: data.tag || "leadflow-notification",
    renotify: true,
    requireInteraction: true,
    actions: [
      { action: "open", title: "Open App 🚀" },
      { action: "dismiss", title: "Dismiss" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// User taps on the push notification banner
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const destinationUrl = event.notification.data?.url || "/admin/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // If an existing PWA window is open, focus it and navigate
      for (const client of windowClients) {
        if ("focus" in client) {
          if (client.url.includes("/admin/dashboard")) {
            client.navigate(destinationUrl);
            return client.focus();
          }
        }
      }
      // If no window is open, launch a new window with destination URL
      if (clients.openWindow) {
        return clients.openWindow(destinationUrl);
      }
    })
  );
});
