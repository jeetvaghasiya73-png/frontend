"use client";

import { useAuthStore } from "./authStore";
import { API_URL, ADMIN_PATH } from "./config";

export const API = API_URL;

/**
 * In-flight refresh promise — prevents multiple concurrent refresh requests
 * when several API calls 401 at the same time.
 */
let refreshPromise: Promise<string | null> | null = null;

// High-speed client memory cache for GET responses (15s fresh TTL)
interface CachedResponse {
  body: string;
  status: number;
  statusText: string;
  headers: [string, string][];
  timestamp: number;
}

const _apiCache = new Map<string, CachedResponse>();

export function clearAuthFetchCache(pattern?: string): void {
  if (!pattern) {
    _apiCache.clear();
    return;
  }
  for (const key of _apiCache.keys()) {
    if (key.includes(pattern)) {
      _apiCache.delete(key);
    }
  }
}

async function doRefresh(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState();

  try {
    const res = await fetch(`${API}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Send server-side HttpOnly cookie
      body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
    });

    if (!res.ok) {
      try {
        const errData = await res.json();
        const detailStr = String(errData?.detail || "").toLowerCase();
        if (detailStr.includes("another device") || detailStr.includes("concurrent")) {
          useAuthStore.getState().logout();
          if (typeof window !== "undefined") {
            window.location.href = `${ADMIN_PATH}/login?reason=concurrent_session`;
          }
        }
      } catch {}
      return null;
    }

    const data = await res.json();
    if (data.access_token) {
      useAuthStore.getState().login(data.access_token, data.refresh_token || refreshToken || "");
      return data.access_token;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Attempt to silently refresh the access token.
 * De-duplicates concurrent refresh attempts so only one network call is made.
 */
async function silentRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Authenticated fetch wrapper.
 * - Attaches the Bearer token from the auth store.
 * - On 401, silently refreshes the access token and retries once.
 * - If refresh also fails, logs out and redirects to login.
 * - Returns the fetch Response for further processing.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = (options.method || "GET").toUpperCase();

  // Invalidate read cache on data-mutating requests (POST, PUT, DELETE, PATCH)
  if (method !== "GET" && method !== "HEAD") {
    _apiCache.clear();
  }

  // Fast-path memory cache for GET requests (<0.1ms instant render)
  const isCacheable = method === "GET" && !(options.headers as any)?.["Cache-Control"];
  if (isCacheable) {
    const cached = _apiCache.get(url);
    if (cached && Date.now() - cached.timestamp < 15_000) {
      return new Response(cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers: new Headers(cached.headers),
      });
    }
  }

  const { accessToken } = useAuthStore.getState();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Only set default Content-Type: application/json if body is NOT FormData
  if (typeof window !== "undefined" && options.body instanceof FormData) {
    delete headers["Content-Type"];
  } else if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include", // Always include cookies for session security
      headers,
    });

    // Populate cache on successful GET response
    if (isCacheable && response.ok) {
      response.clone().text().then((text) => {
        _apiCache.set(url, {
          body: text,
          status: response.status,
          statusText: response.statusText,
          headers: Array.from(response.headers.entries()),
          timestamp: Date.now(),
        });
      }).catch(() => {});
    }

    // Token expired or invalid → check session concurrency or try silent refresh
    if (response.status === 401) {
      let isConcurrentSession = false;
      try {
        const errJson = await response.clone().json();
        const detailStr = String(errJson?.detail || "").toLowerCase();
        if (
          detailStr.includes("another device") ||
          detailStr.includes("session has been terminated") ||
          detailStr.includes("concurrent")
        ) {
          isConcurrentSession = true;
        }
      } catch {}

      if (isConcurrentSession) {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = `${ADMIN_PATH}/login?reason=concurrent_session`;
        }
        return response;
      }

      const newToken = await silentRefresh();

      if (newToken) {
        // Retry the original request with the fresh token
        headers["Authorization"] = `Bearer ${newToken}`;
        try {
          const retriedResponse = await fetch(url, { ...options, credentials: "include", headers });
          if (isCacheable && retriedResponse.ok) {
            retriedResponse.clone().text().then((text) => {
              _apiCache.set(url, {
                body: text,
                status: retriedResponse.status,
                statusText: retriedResponse.statusText,
                headers: Array.from(retriedResponse.headers.entries()),
                timestamp: Date.now(),
              });
            }).catch(() => {});
          }
          return retriedResponse;
        } catch {
          return new Response(JSON.stringify({ detail: "Network error connecting to API backend." }), {
            status: 503,
            headers: { "Content-Type": "application/json" }
          });
        }
      }

      // Refresh failed → force logout
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = `${ADMIN_PATH}/login`;
      }
    }
    return response;
  } catch {
    return new Response(JSON.stringify({ detail: "API backend is currently offline or unreachable." }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }
}
