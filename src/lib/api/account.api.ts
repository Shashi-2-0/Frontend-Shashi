export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type UserProfilePayload = {
  height: number;
  weight: number;
  chest: number;
  waist: number;
  bodyType: string;
  fitPreference: string;
};

const API_BASE = "/api/proxy";

export function getSavedToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("shahsi_token")
  );
}

export function saveTokenFromResponse(response: any) {
  const token =
    response?.access_token ||
    response?.accessToken ||
    response?.token ||
    response?.jwt ||
    response?.data?.access_token ||
    response?.data?.accessToken ||
    response?.data?.token ||
    response?.data?.jwt ||
    response?.user?.access_token ||
    response?.user?.accessToken ||
    response?.user?.token;

  if (token && typeof window !== "undefined") {
    localStorage.setItem("token", token);
    return token;
  }

  console.log("Token not found in login response:", response);
  return null;
}

export function clearSavedToken() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("authToken");
  localStorage.removeItem("shahsi_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getSavedToken();

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
      data?.message ||
        data?.error ||
        data?.details ||
        `Request failed with ${response.status}`
    );
  }

  return data;
}

export async function loginUser(payload: LoginPayload) {
  return request<any>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registerUser(payload: RegisterPayload) {
  return request<any>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  return request<any>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser() {
  return request<any>("/auth/me", {
    method: "GET",
  });
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

export async function updateMeasurementsOnly(
  payload: Partial<UserProfilePayload>
) {
  return request<any>("/user-profile/measurements", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export type ResetPasswordPayload = {
  token: string;
  newPassword: string;
};

export async function resetPassword(payload: ResetPasswordPayload) {
  return request<any>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}