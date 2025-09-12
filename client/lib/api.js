const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  console.log("👉 Request:", `${BASE_URL}/api${path}`, options);
  console.log("👉 Status:", res.status);

  const json = await res.json().catch(() => ({}));
  console.log("👉 Response:", json);

  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

async function get(path, extraHeaders = {}) {
  return request(path, { method: "GET", headers: extraHeaders });
}

async function post(path, data, extraHeaders = {}) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

async function put(path, data, extraHeaders = {}) {
  return request(path, {
    method: "PUT",
    headers: extraHeaders,
    body: JSON.stringify(data),
  });
}

async function patch(path, data, extraHeaders = {}) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}


const TOKEN_KEY = "auth_token";

export function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function authHeader() {
  const t = getAuthToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export const api = {
  // auth
  register: (payload) => post("/auth/register", payload),
  verifyOtp: (payload) => post("/auth/verify-otp", payload),
  resendOtp: (payload) => post("/auth/resend-otp", payload),
  login: (payload) => post("/auth/login", payload),
  forgotPassword: (payload) => post("/auth/forgot-password", payload),
  resetPassword: (payload) => post("/auth/reset-password", payload),

  // profile
  getProfile: () => get("/profile", authHeader()),
  updateProfile: (data, token) =>
    patch("/profile", data, { Authorization: `Bearer ${token}` }),
};
