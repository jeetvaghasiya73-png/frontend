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
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "TI Admin" }
    ];

    metaTags.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        meta.setAttribute("content", content);
        document.head.appendChild(meta);
      }
    });

    // 3. Register Service Worker exclusively for the Admin Dashboard
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/dashboard" })
        .catch((err) => {
          console.debug("Admin PWA ServiceWorker notice:", err);
        });
    }

    // Cleanup when unmounting from admin section
    return () => {
      const m = document.querySelector('link[rel="manifest"]');
      if (m && m.parentNode) {
        m.parentNode.removeChild(m);
      }
    };
  }, []);

  return null;
}
