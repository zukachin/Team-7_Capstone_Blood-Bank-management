// client/lib/api.js
const AUTH_BASE = import.meta.env.VITE_API_BASE_AUTH || "http://localhost:4000";
const ADMIN_BASE = import.meta.env.VITE_API_BASE_ADMIN || "http://localhost:4001";

// Token Helpers
function setToken(token) {
  try {
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");
  } catch (e) {}
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
  } catch (e) {}
}
function getAdminToken() {
  try {
    return localStorage.getItem("adminToken");
  } catch (e) {
    return null;
  }
}

// Auth header returns correct token based on base URL
function authHeader(base = AUTH_BASE) {
  const token = base === ADMIN_BASE ? getAdminToken() : getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Core request with cache-busting for GET requests
async function request(base, path, options = {}) {
  let url = `${base}/api${path}`;
  
  // Add cache-busting parameter for GET requests
  if (options.method === "GET" || !options.method) {
    const separator = path.includes('?') ? '&' : '?';
    url += `${separator}_t=${Date.now()}`;
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
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

  // Admin Profile
  getAdminProfile: () => get(ADMIN_BASE, "/admin/profile", authHeader(ADMIN_BASE)),

  // Centres & Camps (ADMIN_BASE)
  getCentresByDistrict: (districtId) =>
    get(ADMIN_BASE, `/centres/public/by-district?district_id=${encodeURIComponent(districtId)}`),
  registerOrganizer: (payload) =>
    post(ADMIN_BASE, "/camps/organizers", payload, authHeader(ADMIN_BASE)),
  getOrganizerProfile: () => get(ADMIN_BASE, "/camps/organizers/me", authHeader(ADMIN_BASE)),
  createCamp: (payload) => post(ADMIN_BASE, "/camps/camps", payload, authHeader(ADMIN_BASE)),

  searchApprovedCamps: ({ state_id, district_id, camp_date }) => {
    const params = new URLSearchParams();
    if (state_id) params.append("state_id", state_id);
    if (district_id) params.append("district_id", district_id);
    if (camp_date) params.append("camp_date", camp_date);
    return get(ADMIN_BASE, `/camps/public/search?${params.toString()}`);
  },

  // Counseling endpoints with cache-busting
 getAllCounselings: () => get(ADMIN_BASE, "/counseling", authHeader(ADMIN_BASE)),
getCounselingsByCamp: (camp_id) => 
  get(ADMIN_BASE, `/counseling?camp_id=${encodeURIComponent(camp_id)}`, authHeader(ADMIN_BASE)),
// New method for filtering by donor_id or other parameters
getCounselingsWithFilter: (queryString) => 
  get(ADMIN_BASE, `/counseling?${queryString}`, authHeader(ADMIN_BASE)),
createCounseling: (payload) => post(ADMIN_BASE, "/counseling/", payload, authHeader(ADMIN_BASE)),

// inside export const api = { ... }

  // Collections (Admin)
// Add these methods to your existing api.js file

// Collections endpoints
// Add these to your api.js file - with debug logging

// Collections endpoints
// Add these updated methods to your api.js file

// Collections endpoints (UPDATED)
getCollections: (queryString = "") => {
  console.log(`API Call: GET ${ADMIN_BASE}/collections?${queryString}`);
  return get(ADMIN_BASE, `/collections?${queryString}`, authHeader(ADMIN_BASE));
},

createCollection: (payload) => {
  console.log(`API Call: POST ${ADMIN_BASE}/collections`, payload);
  return post(ADMIN_BASE, "/collections", payload, authHeader(ADMIN_BASE));
},

getCollectionById: (collection_id) => {
  console.log(`API Call: GET ${ADMIN_BASE}/collections/${collection_id}`);
  return get(ADMIN_BASE, `/collections/${collection_id}`, authHeader(ADMIN_BASE));
},

// Testing endpoints (UPDATED with better error handling)
listTesting: (queryString = "") => {
  console.log(`API Call: GET ${ADMIN_BASE}/testing?${queryString}`);
  return get(ADMIN_BASE, `/testing?${queryString}`, authHeader(ADMIN_BASE));
},

getTestingById: (test_id) => {
  console.log(`API Call: GET ${ADMIN_BASE}/testing/${test_id}`);
  return get(ADMIN_BASE, `/testing/${test_id}`, authHeader(ADMIN_BASE));
},

// This should create OR update test results for a collection
updateTesting: (collection_id, payload) => {
  console.log(`API Call: PATCH ${ADMIN_BASE}/testing/${collection_id}`, payload);
  return patch(ADMIN_BASE, `/testing/${collection_id}`, payload, authHeader(ADMIN_BASE));
},

// NEW: Method to get test by collection_id instead of test_id
getTestingByCollection: (collection_id) => {
  console.log(`API Call: GET ${ADMIN_BASE}/testing?collection_id=${collection_id}`);
  return get(ADMIN_BASE, `/testing?collection_id=${collection_id}`, authHeader(ADMIN_BASE));
},

// NEW: Method to create a new test
createTesting: (payload) => {
  console.log(`API Call: POST ${ADMIN_BASE}/testing`, payload);
  return post(ADMIN_BASE, "/testing", payload, authHeader(ADMIN_BASE));
},
// Inventory endpoints (add to your api object)
getInventorySummary: () => get(ADMIN_BASE, "/inventory/summary", authHeader(ADMIN_BASE)),
getInventoryList: (queryString = "") => get(ADMIN_BASE, `/inventory?${queryString}`, authHeader(ADMIN_BASE)),
getInventoryById: (inventory_id) => get(ADMIN_BASE, `/inventory/${inventory_id}`, authHeader(ADMIN_BASE)),
getLowStockInventory: (threshold = 10) => get(ADMIN_BASE, `/inventory/low-stock?threshold=${threshold}`, authHeader(ADMIN_BASE)),
exportInventoryCSV: async () => {
  const response = await fetch(`${ADMIN_BASE}/api/inventory/export.csv`, {
    headers: authHeader(ADMIN_BASE),
  });
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventory_export_${Date.now()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
},




  // Appointments
  createAppointment: (payload) => post(ADMIN_BASE, "/appointments", payload, authHeader(AUTH_BASE)),
  getMyAppointments: () => get(ADMIN_BASE, "/userappointments/mine", authHeader(AUTH_BASE)),
  deleteAppointment: (id) => del(ADMIN_BASE, `/appointments/${id}`, authHeader(AUTH_BASE)),

  // Admin-only Appointments
  getAdminAppointments: () => get(ADMIN_BASE, "/appointments/admin", authHeader(ADMIN_BASE)),
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
};