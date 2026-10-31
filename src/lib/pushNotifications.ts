"use client";

import { authFetch } from "./authFetch";
import { API_URL } from "./config";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getPushSubscriptionState(): Promise<{
  supported: boolean;
  permission: NotificationPermission | "unsupported";
  isSubscribed: boolean;
}> {
  if (!isPushNotificationSupported()) {
    return { supported: false, permission: "unsupported", isSubscribed: false };
  }

  const permission = Notification.permission;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return {
      supported: true,
      permission,
      isSubscribed: !!sub
    };
  } catch {
    return { supported: true, permission, isSubscribed: false };
  }
}

import { useAuthStore } from "./authStore";

export async function subscribeToPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;

  // Never attempt push subscription or backend sync if unauthenticated
  const { isAuthenticated, accessToken } = useAuthStore.getState();
  if (!isAuthenticated || !accessToken) return false;

  try {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return false;

    // Fetch VAPID public key from backend
    const keyRes = await fetch(`${API_URL}/api/v1/push/vapid-public-key`);
    if (!keyRes.ok) return false;
    const { publicKey } = await keyRes.json();
    if (!publicKey) return false;

    const reg = await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      const convertedKey = urlBase64ToUint8Array(publicKey);
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource
      });
    }

    const subJson = subscription.toJSON();
    if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
      return false;
    }

    const res = await authFetch(`${API_URL}/api/v1/push/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth
        },
        user_agent: navigator.userAgent
      })
    });

    return res.ok;
  } catch (err) {
    console.warn("Failed to subscribe to push notifications:", err);
    return false;
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await authFetch(`${API_URL}/api/v1/push/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint })
      });
    }
    return true;
  } catch (err) {
    console.warn("Failed to unsubscribe push:", err);
    return false;
  }
}
