// client/lib/api.js
const AUTH_BASE = import.meta.env.VITE_API_BASE_AUTH || "http://localhost:4000";
const ADMIN_BASE = import.meta.env.VITE_API_BASE_ADMIN || "http://localhost:4001";

// Token Helpers
function setToken(token) {
  try {
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");
  } catch (e) { }
}
function getToken() {
  try {
    return localStorage.getItem("auth_token");
  } catch (e) {
    return null;
  }
}
function setAdminToken(token) {
  try {
    if (token) localStorage.setItem("adminToken", token);
    else localStorage.removeItem("adminToken");
  } catch (e) { }
}
function getAdminToken() {
  try {
    return localStorage.getItem("adminToken");
  } catch (e) {
    return null;
  }
}

// Helper: Capitalize first letter (e.g. "pending" => "Pending")
function capitalizeStatus(status) {
  if (!status || typeof status !== "string") return status;
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

// ✅ Auth header returns correct token based on base URL
function authHeader(base = AUTH_BASE) {
  const token = base === ADMIN_BASE ? getAdminToken() : getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Core request
async function request(base, path, options = {}) {
  const url = `${base}/api${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text().catch(() => "");
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const msg = json.message || (json.error && json.error.message) || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = json;
    throw err;
  }

  return json;
}

// Request methods
const get = (base, path, headers) => request(base, path, { method: "GET", headers });
const post = (base, path, body, headers) =>
  request(base, path, {
    method: "POST",
    body: JSON.stringify(body || {}),
    headers,
  });
const patch = (base, path, body, headers) =>
  request(base, path, {
    method: "PATCH",
    body: JSON.stringify(body || {}),
    headers,
  });
const del = (base, path, headers) => request(base, path, { method: "DELETE", headers });

// API
export const api = {
  // Token helpers
  setToken,
  getToken,
  setAdminToken,
  getAdminToken,

  // Auth (AUTH_BASE)
  register: (payload) => post(AUTH_BASE, "/auth/register", payload),
  verifyOtp: (payload) => post(AUTH_BASE, "/auth/verify-otp", payload),
  resendOtp: (payload) => post(AUTH_BASE, "/auth/resend-otp", payload),
  login: (payload) => post(AUTH_BASE, "/auth/login", payload),
  forgotPassword: (payload) => post(AUTH_BASE, "/auth/forgot-password", payload),
  resetPassword: (payload) => post(AUTH_BASE, "/auth/reset-password", payload),
  getBloodGroups: () => get(AUTH_BASE, "/blood-groups"),

  // Profile (AUTH_BASE)
  getProfile: () => get(AUTH_BASE, "/profile", authHeader(AUTH_BASE)),
  updateProfile: (payload) => patch(AUTH_BASE, "/profile", payload, authHeader(AUTH_BASE)),

  // Locations (AUTH_BASE)
  getStates: () => get(AUTH_BASE, "/locations/states"),
  getDistrictsByState: (stateId) => get(AUTH_BASE, `/locations/states/${stateId}/districts`),

  // Admin Auth (ADMIN_BASE)
  adminLogin: (payload) => post(ADMIN_BASE, "/auth/login", payload),
  // Admin-only camps
  getAdminCamps: (stateId) => {
    const params = new URLSearchParams();
    if (stateId) params.append("state_id", stateId);
    return get(ADMIN_BASE, `/camps/admin/camps?${params.toString()}`, authHeader(ADMIN_BASE));
  },

  // Admin Camp Status Update
  updateCampStatus: (campId, action) =>
    patch(ADMIN_BASE, `/camps/admin/camps/${campId}/status`, { action }, authHeader(ADMIN_BASE)),

  getAdminProfile: () => {
    return get(ADMIN_BASE, "/admins", authHeader(ADMIN_BASE));
  },

  // Centres & Camps (ADMIN_BASE)
  getCentresByDistrict: (districtId) =>
    get(ADMIN_BASE, `/centres/public/by-district?district_id=${encodeURIComponent(districtId)}`),
  registerOrganizer: (payload) =>
    post(ADMIN_BASE, "/camps/organizers", payload, authHeader(AUTH_BASE)),

  getOrganizerProfile: async function () {
    const response = await fetch("http://localhost:4001/api/camps/organizers/me", {
      headers: {
        Authorization: `Bearer ${this.getToken()}`, // or api.getToken() depending on your context
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404) {
        const error = new Error("Organizer record not found");
        error.status = 404;
        throw error;
      }
      throw new Error(errorText || "Failed to fetch organizer profile");
    }

    return await response.json();
  },

  getOrganizerCamps: () => get(ADMIN_BASE, "/camps/organizers/me/camps", authHeader(AUTH_BASE)),
  createCamp: (payload) => post(ADMIN_BASE, "/camps/camps", payload, authHeader(AUTH_BASE)),

  searchApprovedCamps: ({ state_id, district_id, camp_date }) => {
    const params = new URLSearchParams();
    if (state_id) params.append("state_id", state_id);
    if (district_id) params.append("district_id", district_id);
    if (camp_date) params.append("camp_date", camp_date);
    return get(ADMIN_BASE, `/camps/public/search?${params.toString()}`);
  },

  // Appointments
  createAppointment: (payload) => post(ADMIN_BASE, "/appointments", payload, authHeader(AUTH_BASE)),
  getMyAppointments: () => get(ADMIN_BASE, "/userappointments/mine", authHeader(AUTH_BASE)),
  deleteAppointment: (id) => del(ADMIN_BASE, `/appointments/${id}`, authHeader(AUTH_BASE)),

  // Admin-only Appointments
  getAdminAppointments: (status = "All") => {
    return get(ADMIN_BASE, `/appointments/admin?status=${encodeURIComponent(status)}`, authHeader(ADMIN_BASE));
  },


  updateAppointmentStatus: (id, payload) =>
    patch(ADMIN_BASE, `/appointments/${id}/status`, payload, authHeader(ADMIN_BASE)),
  deleteAdminAppointment: (id) => del(ADMIN_BASE, `/appointments/${id}`, authHeader(ADMIN_BASE)),

  // Notifications
  getDonorNotifications: async (location) => {
    const params = new URLSearchParams(location);
    const res = await fetch(`${ADMIN_BASE}/admin/notifications?${params}`, {
      headers: authHeader(ADMIN_BASE),
    });
    return res.json();
  },

  getAdminNotificationCount: async (location) => {
    const params = new URLSearchParams(location);
    const res = await fetch(`${ADMIN_BASE}/admin/notifications/count?${params}`, {
      headers: authHeader(ADMIN_BASE),
    });
    return res.json(); // { registrations: 2, appointments: 3 }
  },

  acceptDonorNotification: async (donorId) => {
    const res = await fetch(`${ADMIN_BASE}/admin/notifications/${donorId}/accept`, {
      method: "POST",
      headers: authHeader(ADMIN_BASE),
    });
    return res.json();
  },

  getDonorProfile: async (donorId) => {
    const res = await fetch(`${ADMIN_BASE}/admin/donors/${donorId}`, {
      headers: authHeader(ADMIN_BASE),
    });
    return res.json();
  },

  acknowledgeAppointmentNotification: async (appointmentId) => {
    const res = await fetch(`${ADMIN_BASE}/admin/notifications/appointments/${appointmentId}/acknowledge`, {
      method: "POST",
      headers: authHeader(ADMIN_BASE),
    });
    return res.json();
  }
};
