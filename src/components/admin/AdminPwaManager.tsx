"use client";

import { useEffect } from "react";

export default function AdminPwaManager() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Inject PWA Manifest link exclusively inside the Admin Dashboard
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (!existingManifest) {
      const manifestLink = document.createElement("link");
      manifestLink.rel = "manifest";
      manifestLink.href = "/manifest.json";
      document.head.appendChild(manifestLink);
    }

    // 2. Inject mobile web app capable meta tags
    const metaTags = [
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Tech Infinix" },
      { name: "theme-color", content: "#000000" },
    ];

    metaTags.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    });

    // 3. Register Service Worker with Auto-Update Mechanism
    if ("serviceWorker" in navigator) {
      let refreshing = false;
      const hadPreviousController = Boolean(navigator.serviceWorker.controller);

      // When the service worker updates and takes control, reload so the PWA gets the latest UI instantly
      // Only reload if this is an update to an existing controller, not first-time activation
      const handleControllerChange = () => {
        if (!refreshing && hadPreviousController) {
          refreshing = true;
          window.location.reload();
        }
      };

      navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then(async (registration) => {
          // Immediately check for updates
          registration.update().catch(() => {});

          // If a new worker is waiting, activate it immediately
          if (registration.waiting) {
            registration.waiting.postMessage({ action: "skipWaiting" });
          }

          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New version available! Activate immediately
                  newWorker.postMessage({ action: "skipWaiting" });
                }
              });
            }
          });

          // Check for UI updates whenever the user switches back to the PWA app
          const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
              registration.update().catch(() => {});
            }
          };

          document.addEventListener("visibilitychange", handleVisibilityChange);

          // Periodically poll for updates every 60 seconds
          const intervalId = setInterval(() => {
            registration.update().catch(() => {});
          }, 60000);

          // Ensure WebPush subscription is actively synced with backend ONLY if authenticated
          if ("Notification" in window && Notification.permission === "granted") {
            const { useAuthStore } = await import("@/lib/authStore");
            if (useAuthStore.getState().isAuthenticated) {
              const { subscribeToPushNotifications } = await import("@/lib/pushNotifications");
              subscribeToPushNotifications().catch(() => {});
            }
          }

          return () => {
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
          };
        })
        .catch((err) => {
          console.debug("Admin PWA ServiceWorker notice:", err);
        });
    }

    // Cleanup when unmounting
    return () => {
      const m = document.querySelector('link[rel="manifest"]');
      if (m && m.parentNode) {
        m.parentNode.removeChild(m);
      }
    };
  }, []);

  return null;
}
