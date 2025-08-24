// client/lib/api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001/api";

async function post(path, data, extraHeaders = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

export const api = {
  register: (payload) => post("/users/register", payload),
  verifyOtp: (payload) => post("/users/verify-otp", payload),
  login: (payload) => post("/users/login", payload),
  resendOtp: (userId) => post("/users/resend-otp", { userId }),
};

// export function setAuthToken(token) {
//   localStorage.setItem("auth_token", token);
// }
// export function getAuthToken() {
//   return localStorage.getItem("auth_token");
// }
// export function authHeader() {
//   const t = getAuthToken();
//   return t ? { Authorization: `Bearer ${t}` } : {};
// }


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