function resolveApiUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // When accessed from localhost or local Wi-Fi / LAN IP (e.g. mobile testing at 192.168.x.x)
    const isLocalOrLan =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host);

    if (isLocalOrLan) {
      // Return empty string to use same-origin proxy via Next.js rewrites
      // This guarantees 100% reliable mobile connectivity without CORS, firewall, or IP change issues
      return "";
    }
  }

  const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  return rawUrl.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
}

export const BASE_API_URL = resolveApiUrl();
export const API_URL = BASE_API_URL;
export const API_V1_URL = `${BASE_API_URL}/api/v1`;

// Secret Admin Path Configuration
export const ADMIN_SLUG = process.env.NEXT_PUBLIC_ADMIN_SLUG || "techinfinix-console-77";
export const ADMIN_PATH = `/${ADMIN_SLUG}`;
