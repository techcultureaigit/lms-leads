const ENV_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Browser calls go to the Next server (`/api/...`), which proxies to port 5000.
 * That keeps create-user and the rest working even when the browser cannot open port 5000 directly.
 */
export function resolveApiUrl() {
  if (typeof window === "undefined") return ENV_API_URL;
  return "";
}

const TOKEN_KEY = "tc_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${resolveApiUrl()}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Cannot reach the API. Make sure the backend is running on port 5000, then try again.",
      0,
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      (data as { message?: string }).message || "Request failed",
      res.status,
    );
  }

  return data as T;
}

export const API_URL = ENV_API_URL;
