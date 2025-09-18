// src/pages/DonorRegister.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../../lib/api";

/**
 * DonorRegister.jsx
 * - single UI Name field (donor_name backend)
 * - state/district selects via api.getStates() / api.getDistrictsByState()
 * - create only to: {ADMIN_BASE}/api/donors
 * - payload sanitized to backend validation requirements
 */

export default function DonorRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const ADMIN_BASE =
    import.meta.env.VITE_API_BASE_ADMIN ||
    import.meta.env.VITE_ADMIN_BASE_URL ||
    import.meta.env.VITE_API_BASE ||
    "";

  const initialMode = urlParams.get("mode") || "new";
  const urlDonorId = urlParams.get("donorId") || urlParams.get("id") || null;
  const prefillCentre = urlParams.get("centreId") || urlParams.get("centre_id") || "";
  const prefillCamp = urlParams.get("campId") || urlParams.get("camp_id") || "";
  const prefillMobile = urlParams.get("prefillMobile") || "";

  const [mode, setMode] = useState(initialMode);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [saving, setSaving] = useState(false);

  // states & districts lists
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  // form data (UI keeps some legacy keys but we will sanitize on send)
  const [formData, setFormData] = useState({
    name: "",
    donor_name: "",
    first_name: "",
    last_name: "",

    dob: "",
    age: "",
    mobile_no: prefillMobile || "",
    email: "",
    address: "",
    district: "", // stores selected district id in UI
    state: "", // stores selected state id in UI
    // country intentionally not sent to backend
    centre_id: prefillCentre || "",
    camp_id: prefillCamp || "",
    gender: "",
    blood_group_id: "",
    marital_status: "",
    registration_type: "",
    donated_previously: false,
    willing_future_donation: false,
    contact_preference: false,
  });

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // load states on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.getStates();
        const list = res?.states ?? res?.data ?? (Array.isArray(res) ? res : []);
        if (!active) return;
        setStates(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load states:", err);
      }
    })();
    return () => { active = false; };
  }, []);

  // load districts when state changes
  useEffect(() => {
    const stateId = formData.state;
    if (!stateId) {
      setDistricts([]);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await api.getDistrictsByState(stateId);
        const list = res?.districts ?? res?.data ?? (Array.isArray(res) ? res : []);
        if (!active) return;
        setDistricts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load districts for state", stateId, err);
        setDistricts([]);
      }
    })();
    return () => { active = false; };
  }, [formData.state]);

  // derive a human name from varied donor object shapes
  const deriveName = (o) => {
    if (!o) return "";
    if (o.donor_name) return String(o.donor_name).trim();
    if (o.donorName) return String(o.donorName).trim();
    if (o.name) return String(o.name).trim();
    if (o.full_name) return String(o.full_name).trim();
    const fn = o.first_name ?? o.firstName ?? "";
    const ln = o.last_name ?? o.lastName ?? "";
    const combined = `${fn}`.trim() + (ln ? ` ${ln}` : "");
    if (combined.trim()) return combined.trim();
    if (o.email) return String(o.email).trim();
    return (o.donor_id ?? o.id ?? "Unknown").toString();
  };

  // populate form if donorId in URL
  useEffect(() => {
    if (!urlDonorId) return;
    let active = true;
    (async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${ADMIN_BASE}/api/donors/${urlDonorId}`, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });
        if (!active) return;
        if (!res.ok) {
          console.error("Failed to fetch donor by id", res.status);
          return;
        }
        const data = await res.json();
        const payload = data?.donor ?? data ?? {};
        const name = deriveName(payload);

        const stateId = payload.state_id ?? payload.state ?? payload.stateId ?? payload.state?.id ?? "";
        const districtId = payload.district_id ?? payload.district ?? payload.districtId ?? payload.district?.id ?? "";

        setSelectedDonor(payload);
        setFormData((prev) => ({
          ...prev,
          ...payload,
          name,
          donor_name: payload.donor_name ?? name,
          first_name: payload.first_name ?? "",
          last_name: payload.last_name ?? "",
          state: stateId,
          district: districtId,
        }));
        setMode("search");
      } catch (err) {
        console.error("Error fetching donor by id param:", err);
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlDonorId, ADMIN_BASE]);

  // search donors
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    let active = true;
    (async () => {
      setSearchLoading(true);
      try {
        const token = localStorage.getItem("adminToken");
        const params = new URLSearchParams({
          mobile: debouncedQuery,
          email: debouncedQuery,
          name: debouncedQuery,
        }).toString();

        const res = await fetch(`${ADMIN_BASE}/api/donors/search?${params}`, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        if (!active) return;
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.warn("Search failed", res.status, txt);
          setResults([]);
          setSearchLoading(false);
          return;
        }

        const data = await res.json();
        const arr = data?.donors ?? data?.data ?? (Array.isArray(data) ? data : []);
        const annotated = (Array.isArray(arr) ? arr : []).map((r) => ({ ...r, __displayName: deriveName(r) }));
        setResults(annotated);
      } catch (err) {
        console.error("Search error", err);
        setResults([]);
      } finally {
        if (active) setSearchLoading(false);
      }
    })();

    return () => { active = false; };
  }, [debouncedQuery, ADMIN_BASE]);

  // handle input changes
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    if (name === "name") {
      const trimmed = value.trim();
      const parts = trimmed.split(/\s+/);
      const first = parts.shift() || "";
      const last = parts.join(" ") || "";

      setFormData((prev) => ({
        ...prev,
        name: value,
        donor_name: value,
        first_name: first,
        last_name: last,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));

    if (name === "dob" && value) {
      const dob = new Date(value);
      const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000));
      setFormData((prev) => ({ ...prev, age: String(age) }));
    }
  };

  // select donor from search results
  const handleSelectDonor = async (donor) => {
    try {
      const id = donor?.donor_id ?? donor?.id;
      if (!id) {
        const name = deriveName(donor);
        const stateId = donor.state_id ?? donor.state ?? donor.stateId ?? donor.state?.id ?? "";
        const districtId = donor.district_id ?? donor.district ?? donor.districtId ?? donor.district?.id ?? "";
        setSelectedDonor(donor);
        setFormData((prev) => ({
          ...prev,
          ...donor,
          name,
          donor_name: donor.donor_name ?? name,
          first_name: donor.first_name ?? "",
          last_name: donor.last_name ?? "",
          state: stateId,
          district: districtId,
        }));
        setMode("search");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${ADMIN_BASE}/api/donors/${id}`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("Failed to fetch donor full profile", res.status, txt);
        alert("Failed to load donor details");
        return;
      }
      const data = await res.json();
      const payload = data?.donor ?? data ?? {};
      const name = deriveName(payload);
      const stateId = payload.state_id ?? payload.state ?? payload.stateId ?? payload.state?.id ?? "";
      const districtId = payload.district_id ?? payload.district ?? payload.districtId ?? payload.district?.id ?? "";

      setSelectedDonor(payload);
      setFormData((prev) => ({
        ...prev,
        ...payload,
        name,
        donor_name: payload.donor_name ?? name,
        first_name: payload.first_name ?? "",
        last_name: payload.last_name ?? "",
        state: stateId,
        district: districtId,
      }));
      setMode("search");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("handleSelectDonor error:", err);
      alert("Error loading donor");
    }
  };

  const handleStartNew = () => {
    setSelectedDonor(null);
    setFormData({
      name: "",
      donor_name: "",
      first_name: "",
      last_name: "",
      dob: "",
      age: "",
      mobile_no: "",
      email: "",
      address: "",
      district: "",
      state: "",
      centre_id: "",
      camp_id: "",
      gender: "",
      blood_group_id: "",
      marital_status: "",
      registration_type: "",
      donated_previously: false,
      willing_future_donation: false,
      contact_preference: false,
    });
    setMode("new");
    setResults([]);
    setSearchQuery("");
    setMessage("");
  };

  // cast helpers
  const toNumberOrUndef = (v) => {
    if (v === null || v === undefined || v === "") return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  };

  // build payload matching backend validation
  const buildPayloadForSend = (data) => {
    const payload = {};

    if (data.donor_name) payload.donor_name = String(data.donor_name).trim();
    if (data.dob) payload.dob = data.dob;
    if (data.age !== undefined && data.age !== "") payload.age = toNumberOrUndef(data.age);
    if (data.gender) payload.gender = data.gender;
    if (data.mobile_no) payload.mobile_no = String(data.mobile_no).trim();
    if (data.email) payload.email = String(data.email).trim();
    if (data.blood_group_id !== undefined && data.blood_group_id !== "") payload.blood_group_id = toNumberOrUndef(data.blood_group_id);
    if (data.address) payload.address = String(data.address).trim();

    const stateId = toNumberOrUndef(data.state ?? data.state_id ?? "");
    const districtId = toNumberOrUndef(data.district ?? data.district_id ?? "");
    if (stateId !== undefined) payload.state_id = stateId;
    if (districtId !== undefined) payload.district_id = districtId;

    const centreId = toNumberOrUndef(data.centre_id ?? "");
    const campId = toNumberOrUndef(data.camp_id ?? "");
    if (centreId !== undefined) payload.centre_id = centreId;
    if (campId !== undefined) payload.camp_id = campId;

    if (data.registration_type) payload.registration_type = data.registration_type;
    if (data.donated_previously !== undefined) payload.donated_previously = !!data.donated_previously;
    if (data.willing_future_donation !== undefined) payload.willing_future_donation = !!data.willing_future_donation;
    if (data.contact_preference !== undefined) payload.contact_preference = !!data.contact_preference;

    return payload;
  };

  // submit (create or update)
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setMessage("");
    setSaving(true);

    try {
      const token = localStorage.getItem("adminToken");

      if (selectedDonor && (selectedDonor.donor_id || selectedDonor.id)) {
        // update
        const id = selectedDonor.donor_id ?? selectedDonor.id;
        const payload = buildPayloadForSend(formData);
        const res = await fetch(`${ADMIN_BASE}/api/donors/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          let errBody;
          try { errBody = await res.json(); } catch { errBody = await res.text().catch(() => null); }
          console.warn("Update failed", res.status, errBody);
          throw new Error((errBody && (errBody.msg || errBody.message)) || `Update failed: ${res.status}`);
        }
        const data = await res.json();
        const updated = data?.donor ?? data ?? {};
        const name = deriveName(updated);

        setSelectedDonor(updated);
        setFormData((prev) => ({
          ...prev,
          ...updated,
          name,
          donor_name: updated.donor_name ?? name,
          first_name: updated.first_name ?? "",
          last_name: updated.last_name ?? "",
          state: updated.state_id ?? updated.state ?? prev.state,
          district: updated.district_id ?? updated.district ?? prev.district,
        }));
        setMessage("Donor updated successfully!");
      } else {
        // create (single endpoint)
        const createUrl = `${ADMIN_BASE}/api/donors`;
        const payload = buildPayloadForSend(formData);
        let created = null;
        try {
          const res = await fetch(createUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            let errBody;
            try { errBody = await res.json(); } catch { errBody = await res.text().catch(() => null); }
            console.warn("Create failed", res.status, errBody);
            throw new Error((errBody && (errBody.msg || errBody.message)) || `Create failed: ${res.status}`);
          }

          const data = await res.json();
          created = data?.donor ?? data ?? {};
        } catch (err) {
          console.error("Create attempt failed", createUrl, err);
          throw err;
        }

        if (!created) throw new Error("Failed to create donor; check backend endpoints.");
        const name = deriveName(created);
        setSelectedDonor(created);
        setFormData((prev) => ({
          ...prev,
          ...created,
          name,
          donor_name: created.donor_name ?? name,
          first_name: created.first_name ?? "",
          last_name: created.last_name ?? "",
          state: created.state_id ?? created.state ?? prev.state,
          district: created.district_id ?? created.district ?? prev.district,
        }));
        setMessage("Donor registered successfully!");
      }
    } catch (err) {
      console.error("Save error:", err);
      setMessage(err?.message || "Failed to save donor");
    } finally {
      setSaving(false);
    }
  };

  // Replace the handleSaveAndProceed function in DonorRegister.jsx
const handleSaveAndProceed = async () => {
  setSaving(true);
  setMessage("");
  
  try {
    // First save the donor
    const saveEvent = { preventDefault: () => {} };
    await handleSubmit(saveEvent);
    
    // Wait a moment for state to update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const id =
      selectedDonor?.donor_id ??
      selectedDonor?.id ??
      formData?.donor_id ??
      formData?.id ??
      null;

    if (id) {
      console.log("Navigating to counseling with donor_id:", id);
      // Navigate with donor_id in state to prefill the counseling form
      navigate(`/admin/donors/counseling`, {
        state: {
          donor_id: String(id),
          centre_id: formData.centre_id || "",
          camp_id: formData.camp_id || ""
        }
      });
      return;
    }

    // fallback: lookup by mobile after save
    if (formData.mobile_no) {
      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams({ mobile: formData.mobile_no }).toString();
      const res = await fetch(`${ADMIN_BASE}/api/donors/search?${params}`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const arr = data?.donors ?? data ?? [];
        if (Array.isArray(arr) && arr.length > 0) {
          const found = arr[0];
          const foundId = found.donor_id ?? found.id;
          console.log("Found donor via search:", foundId);
          navigate(`/admin/donors/counseling`, {
            state: {
              donor_id: String(foundId),
              centre_id: formData.centre_id || "",
              camp_id: formData.camp_id || ""
            }
          });
          return;
        }
      }
    }

    setMessage("Could not determine donor ID after save. Please manually navigate to counseling.");
  } catch (err) {
    console.error("Save & proceed error", err);
    setMessage(err?.message || "Failed to save & proceed to counseling");
  } finally {
    setSaving(false);
  }
};
  const getItemId = (o) => o?.id ?? o?.state_id ?? o?.district_id ?? o?._id ?? o;
  const getItemLabel = (o) => o?.name ?? o?.state_name ?? o?.district_name ?? o?.title ?? String(o);

  // Render
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-red-500">
        {formData.name ? `Edit Donor — ${formData.name}` : "Register Donor"}
      </h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded text-center font-medium ${
            message.toLowerCase().includes("success") ? "bg-green-700 text-green-200" : "bg-red-700 text-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex gap-6">
        {/* Search panel */}
        <div className="w-80 bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by mobile, email or name"
              className="flex-1 bg-black border border-gray-700 rounded-lg p-2 text-sm placeholder-gray-400"
            />
            <button
              onClick={() => {
                setSearchQuery("");
                setResults([]);
              }}
              title="Clear"
              className="px-2 py-1 rounded bg-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="mb-2 text-xs text-gray-400">Quick results (click to select)</div>

          <div className="h-64 overflow-auto">
            {searchLoading ? (
              <div className="text-sm text-gray-300">Searching...</div>
            ) : results.length === 0 ? (
              <div className="text-sm text-gray-400">No results</div>
            ) : (
              <ul className="space-y-2">
                {results.map((r) => {
                  const id = r.donor_id ?? r.id;
                  const selId = selectedDonor && (selectedDonor.donor_id ?? selectedDonor.id);
                  const selected = selId === id;
                  const displayName = r.__displayName ?? deriveName(r) ?? r.email ?? "Unknown";
                  return (
                    <li
                      key={id}
                      onClick={() => handleSelectDonor(r)}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer ${
                        selected ? "bg-red-700/40 ring-2 ring-red-600" : "hover:bg-gray-700"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold">
                        {((displayName || "D").match(/\b\w/g) || ["D"]).slice(0, 2).join("").toUpperCase()}
                      </div>

                      <div className="flex-1">
                        <div className="font-semibold">{displayName}</div>
                        <div className="text-xs text-gray-400">
                          {r.mobile_no ?? ""} {r.email ? `• ${r.email}` : ""}
                        </div>
                      </div>

                      <div>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            handleSelectDonor(r);
                          }}
                          className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                        >
                          Select
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mt-4">
            <button onClick={handleStartNew} className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
              New Register
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2 text-gray-300">Name</label>
            <input
              name="name"
              type="text"
              value={formData.name}
              placeholder="Full name"
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:outline-none transition"
            />
          </div>

          {/* DOB / Age */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Date of Birth</label>
            <input
              name="dob"
              type="date"
              value={formData.dob ?? ""}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Age</label>
            <input
              name="age"
              type="number"
              value={formData.age ?? ""}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm"
            />
          </div>

          {/* Mobile / Email */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Mobile No</label>
            <input
              name="mobile_no"
              type="text"
              value={formData.mobile_no ?? ""}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email ?? ""}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2 text-gray-300">Address</label>
            <input
              name="address"
              type="text"
              value={formData.address ?? ""}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm"
            />
          </div>

          {/* State select */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">State</label>
            <select
              name="state"
              value={formData.state ?? ""}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm"
            >
              <option value="">Select state</option>
              {states.map((s) => {
                const id = getItemId(s);
                const label = getItemLabel(s);
                return (
                  <option key={id} value={id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* District select */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">District</label>
            <select
              name="district"
              value={formData.district ?? ""}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm"
              disabled={!formData.state}
            >
              <option value="">Select district</option>
              {districts.map((d) => {
                const id = getItemId(d);
                const label = getItemLabel(d);
                return (
                  <option key={id} value={id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Centre / Camp */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Centre ID</label>
            <input
              name="centre_id"
              type="text"
              value={formData.centre_id ?? ""}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Camp ID</label>
            <input
              name="camp_id"
              type="text"
              value={formData.camp_id ?? ""}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm"
            />
          </div>

          {/* Gender / Blood group */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Gender</label>
            <select
              name="gender"
              value={formData.gender ?? ""}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm"
            >
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Blood Group</label>
            <select
              name="blood_group_id"
              value={formData.blood_group_id ?? ""}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm"
            >
              <option value="">Select blood group</option>
              <option value="1">A+</option>
              <option value="2">A-</option>
              <option value="3">B+</option>
              <option value="4">B-</option>
              <option value="5">AB+</option>
              <option value="6">AB-</option>
              <option value="7">O+</option>
              <option value="8">O-</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Marital Status</label>
            <select
              name="marital_status"
              value={formData.marital_status ?? ""}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm"
            >
              <option value="">Select status</option>
              <option>Single</option>
              <option>Married</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Registration Type</label>
            <select
              name="registration_type"
              value={formData.registration_type ?? ""}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm"
            >
              <option value="">Select type</option>
              <option value="Centre">Centre</option>
              <option value="Camp">Camp</option>
            </select>
          </div>

          {/* checkboxes */}
          {[
            { name: "donated_previously", label: "Donated Previously" },
            { name: "willing_future_donation", label: "Willing for Future Donation" },
            { name: "contact_preference", label: "Allow Contact" },
          ].map((cb, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="checkbox"
                name={cb.name}
                checked={!!formData[cb.name]}
                onChange={handleChange}
                className="w-5 h-5 accent-red-600 hover:scale-110 transition-transform"
              />
              <label className="text-gray-300">{cb.label}</label>
            </div>
          ))}

          {/* buttons */}
          <div className="md:col-span-2 flex justify-center gap-4 mt-4">
            <button
              type="submit"
              className="bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={handleSaveAndProceed}
              className="bg-red-700 text-white font-bold py-3 px-6 rounded-lg"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save & Proceed to Counseling"}
            </button>

            <button
              type="button"
              onClick={handleStartNew}
              className="bg-gray-700 text-white font-medium py-3 px-4 rounded-lg"
              disabled={saving}
            >
              Reset / New
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// helpers outside component so minified bundle doesn't repeat them
function getItemId(o) {
  return o?.id ?? o?.state_id ?? o?.district_id ?? o?._id ?? o;
}
function getItemLabel(o) {
  return o?.name ?? o?.state_name ?? o?.district_name ?? o?.title ?? String(o);
}
