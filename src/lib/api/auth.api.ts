import { apiRequest } from "./client";

export type AuthUser = {
  id?: string;
  userId?: string;
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
};

export type AuthResponse = {
  success?: boolean;
  message?: string;
  error?: any;

  token?: string;
  accessToken?: string;
  authToken?: string;
  access_token?: string;
  jwt?: string;

  user?: AuthUser;
  data?: any;

  countryCode?: string;
  phoneNumber?: string;
  phoneOtpSent?: boolean;
  providerError?: string;
  phoneVerified?: boolean;
};

export type RegisterPayload = {
  name: string;
  countryCode: string;
  phoneNumber: string;
  emailType: string;
  userSubType: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

function findTokenDeep(value: any): string {
  if (!value || typeof value !== "object") return "";

  const possibleKeys = [
    "token",
    "accessToken",
    "authToken",
    "access_token",
    "jwt",
    "idToken",
  ];

  for (const key of possibleKeys) {
    if (typeof value[key] === "string" && value[key].length > 20) {
      return value[key];
    }
  }

  for (const key of Object.keys(value)) {
    const result = findTokenDeep(value[key]);
    if (result) return result;
  }

  return "";
}

function cleanToken(token: string) {
  return token.replace(/^Bearer\s+/i, "").trim();
}

export function saveAuth(response: AuthResponse) {
  const rawToken = findTokenDeep(response);
  const token = cleanToken(rawToken);

  if (token && typeof window !== "undefined") {
    localStorage.setItem("token", token);
    localStorage.setItem("accessToken", token);
  }

  const user = response.user || response.data?.user || response.data;

  if (user && typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return token;
}

export function getLoggedInUser() {
  if (typeof window === "undefined") return null;

  const rawUser = localStorage.getItem("user");

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export function logoutUser() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("authToken");
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}

export async function signupUser(payload: RegisterPayload) {
  const response = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });

  saveAuth(response);

  return response;
}

export async function loginUser(payload: LoginPayload) {
  const response = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });

  const token = saveAuth(response);

  if (!token) {
    console.warn("Login successful but token not found in response:", response);
  }

  return response;
}

export async function resendEmailOtp(payload: { email: string }) {
  return apiRequest<AuthResponse>("/auth/resend-email-otp", {
    method: "POST",
    body: payload,
  });
}

// Old import compatibility ke liye rakha hai.
export async function sendEmailOtp(payload: { email: string }) {
  return resendEmailOtp(payload);
}

export async function verifyEmailOtp(payload: { email: string; otp: string }) {
  const response = await apiRequest<AuthResponse>("/auth/verify-email-otp", {
    method: "POST",
    body: payload,
  });

  saveAuth(response);

  return response;
}

export async function sendPhoneOtp(payload: {
  countryCode: string;
  phoneNumber: string;
}) {
  return apiRequest<AuthResponse>("/auth/send-phone-otp", {
    method: "POST",
    body: payload,
  });
}

export async function verifyPhoneOtp(payload: {
  countryCode: string;
  phoneNumber: string;
  otp: string;
}) {
  const response = await apiRequest<AuthResponse>("/auth/verify-phone-otp", {
    method: "POST",
    body: payload,
  });

  saveAuth(response);

  return response;
}

export async function forgotPassword(payload: { email: string }) {
  return apiRequest<AuthResponse>("/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

export async function resetPassword(payload: {
  token?: string;
  email?: string;
  otp?: string;
  newPassword: string;
}) {
  return apiRequest<AuthResponse>("/auth/reset-password", {
    method: "POST",
    body: payload,
  });
}



export async function getMe() {
  return apiRequest<AuthResponse>("/auth/me");
}





