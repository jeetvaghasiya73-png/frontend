const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const BASE_API_URL = rawUrl.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
export const API_URL = BASE_API_URL;
export const API_V1_URL = `${BASE_API_URL}/api/v1`;

