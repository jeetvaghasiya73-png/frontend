"use client";

import { create } from "zustand";

interface AuthUser {
  id: number;
  username: string;
  is_superadmin: boolean;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

/** Decode a JWT payload without verifying the signature (client-side only). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    // Pad base64url to standard base64
    const padded = base64.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function buildUser(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return {
    id: Number(payload.sub) || 0,
    username: (payload.username as string) || "",
    is_superadmin: Boolean(payload.is_superadmin),
  };
}

const getLocal = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

export const useAuthStore = create<AuthState>((set) => {
  const initialToken = getLocal("nexora_access_token");
  const initialRefresh = getLocal("nexora_refresh_token");

  return {
    accessToken: initialToken,
    refreshToken: initialRefresh,
    isAuthenticated: !!initialToken,
    user: initialToken ? buildUser(initialToken) : null,

    login: (accessToken: string, refreshToken: string) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("nexora_access_token", accessToken);
        localStorage.setItem("nexora_refresh_token", refreshToken);
      }
      set({
        accessToken,
        refreshToken,
        isAuthenticated: true,
        user: buildUser(accessToken),
      });
    },

    logout: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("nexora_access_token");
        localStorage.removeItem("nexora_refresh_token");
      }
      set({ accessToken: null, refreshToken: null, isAuthenticated: false, user: null });
    },
  };
});
