// client/lib/api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";

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

// async function patch(path, data, extraHeaders = {}) {
//   return request("/api/profile", {
//     method: "PATCH",   // 👈 PATCH instead of PUT
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify(profile), // 👈 send only changed fields
//   });
// }

async function patch(path, data, token, extraHeaders = {}) {
  return request(path, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...extraHeaders,
    },
    body: JSON.stringify(data), //  use data argument
  });
}


// const get = (path, headers = {}) => request(path, { method: "GET", headers });
// const post = (path, data, headers = {}) =>
//   request(path, { method: "POST", headers, body: JSON.stringify(data) });
// const put = (path, data, headers = {}) =>
//   request(path, { method: "PUT", headers, body: JSON.stringify(data) });
// const patch = (path, data, headers = {}) =>
//   request(path, { method: "PATCH", headers, body: JSON.stringify(data) });


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
  register: (payload) => post("/users/register", payload),
  verifyOtp: (payload) => post("/users/verify-otp", payload),
  login: (payload) => post("/users/login", payload),
  resendOtp: (userId) => post("/users/resend-otp", { userId }),

  // profile
  // getProfile: (token) => get("/users/profile", { Authorization: `Bearer ${token}` }),
  // updateProfile: (payload, token) =>
  //   patch("/users/profile", payload, { Authorization: `Bearer ${token}` }),
  getProfile: () => get("/profile", authHeader()),
  updateProfile: (payload) => patch("/profile", payload, authHeader()),
};