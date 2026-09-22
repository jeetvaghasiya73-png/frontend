"use client";

import { useAuthStore } from "./authStore";
import { API_URL, ADMIN_PATH } from "./config";

export const API = API_URL;

/**
 * In-flight refresh promise — prevents multiple concurrent refresh requests
 * when several API calls 401 at the same time.
 */
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState();

  try {
    const res = await fetch(`${API}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Send server-side HttpOnly cookie
      body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
    });

    if (!res.ok) return null;

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

    // Token expired → try silent refresh + retry
    if (response.status === 401) {
      const newToken = await silentRefresh();

      if (newToken) {
        // Retry the original request with the fresh token
        headers["Authorization"] = `Bearer ${newToken}`;
        try {
          return await fetch(url, { ...options, credentials: "include", headers });
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
