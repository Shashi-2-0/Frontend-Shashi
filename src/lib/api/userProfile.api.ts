export type UserProfilePayload = {
  height: number;
  weight: number;
  chest: number;
  waist: number;
  bodyType: string;
  fitPreference: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://65.1.135.224:3001";

function getAuthToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("shahsi_token")
  );
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `Request failed with ${response.status}`
    );
  }

  return data;
}

export async function getUserProfile() {
  return request<any>("/user-profile", {
    method: "GET",
  });
}

export async function createUserProfile(payload: UserProfilePayload) {
  return request<any>("/user-profile", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUserProfile(payload: UserProfilePayload) {
  return request<any>("/user-profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateMeasurementsOnly(payload: Partial<UserProfilePayload>) {
  return request<any>("/user-profile/measurements", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}