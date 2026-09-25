const ENV_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** When the app is opened via a LAN IP, localhost would point at the device, not this PC. */
export function resolveApiUrl() {
  if (typeof window === "undefined") return ENV_API_URL;
  try {
    const pageHost = window.location.hostname;
    if (!pageHost || pageHost === "localhost" || pageHost === "127.0.0.1") {
      return ENV_API_URL;
    }
    const url = new URL(ENV_API_URL);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      url.hostname = pageHost;
      return url.origin;
    }
  } catch {
    /* keep env URL */
  }
  return ENV_API_URL;
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
