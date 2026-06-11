const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://65.1.135.224:3001";

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return "/api/proxy";
  }

  return BACKEND_API_URL;
}

function getToken() {
  if (typeof window === "undefined") return null;

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("access_token");

  return token?.replace(/^Bearer\s+/i, "").trim() || null;
}

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const token = options.token ?? getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const text = await response.text();

  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    console.error("API Error:", {
      status: response.status,
      endpoint,
      data,
    });

const errorMessage =
  typeof data === "string"
    ? data
    : data?.message ||
      data?.error ||
      data?.errors?.[0]?.message ||
      "";

throw new Error(
  errorMessage ||
    `API failed: ${options.method || "GET"} ${endpoint} returned ${response.status}`
);
  }

  return data as T;
}