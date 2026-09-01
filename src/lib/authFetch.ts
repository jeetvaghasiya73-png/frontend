"use client";

import { useAuthStore } from "./authStore";
import { API_URL } from "./config";

export const API = API_URL;

/**
 * In-flight refresh promise — prevents multiple concurrent refresh requests
 * when several API calls 401 at the same time.
 */
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refreshToken),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.access_token && data.refresh_token) {
      useAuthStore.getState().login(data.access_token, data.refresh_token);
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
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Token expired → try silent refresh + retry
  if (response.status === 401) {
    const newToken = await silentRefresh();

    if (newToken) {
      // Retry the original request with the fresh token
      headers["Authorization"] = `Bearer ${newToken}`;
      return fetch(url, { ...options, headers });
    }

    // Refresh failed → force logout
    useAuthStore.getState().logout();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
  }

  return response;
}
