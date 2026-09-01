let resolvedApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

if (typeof window !== "undefined") {
  const hostname = window.location.hostname;
  if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
    resolvedApi = `http://${hostname}:8000`;
  }
}

export const API_URL = resolvedApi;
