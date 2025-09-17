import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

// You may use a UI library modal or build your own simple one
function ConfirmModal({ visible, title, message, onConfirm, onCancel }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50"
      role="alert"
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-3 font-bold hover:text-gray-200"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

export default function CampRegistration() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    camp_name: "",
    organizer_id: "", // Will be set from fetched organizer profile
    state_id: "",
    district_id: "",
    centre_id: "",
    location: "",
    camp_date: "",
    camp_time: "",
    has_venue: false,
    description: "",
  });

  const [organizer, setOrganizer] = useState(null);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [centres, setCentres] = useState([]);
  const [existingCamps, setExistingCamps] = useState([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!api.getToken()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Load organizer profile
  useEffect(() => {
    api
      .getOrganizerProfile()
      .then((data) => {
        if (data?.organizer) {
          setOrganizer(data.organizer);
          setForm((prev) => ({
            ...prev,
            organizer_id: data.organizer.organizer_id,
          }));
          setErr("");
          fetchExistingCamps();
        } else {
          const m = "Organizer profile not found. Please register your organizer profile first.";
          setOrganizer(null);
          setErr(m);
          setToastMessage(m);
        }
      })
      .catch((error) => {
        if (error.status === 404) {
          const m = "Organizer profile not found. Please register your organizer profile first.";
          setErr(m);
          setToastMessage(m);
          setOrganizer(null);
        } else {
          console.error("Failed to fetch organizer profile:", error);
          setErr("Failed to load organizer profile");
          setToastMessage("Failed to load organizer profile. Please try again later.");
          setOrganizer(null);
        }
      });
  }, []);

  const fetchExistingCamps = async () => {
    try {
      const response = await fetch(
        "http://localhost:4001/api/camps/organizers/me/camps",
        {
          headers: {
            Authorization: `Bearer ${api.getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch camps");

      const data = await response.json();
      setExistingCamps(data.camps || []);
    } catch (error) {
      console.error("Error fetching existing camps:", error);
    }
  };

  useEffect(() => {
    api
      .getStates()
      .then((res) => {
        if (Array.isArray(res)) {
          setStates(res);
        } else if (res?.states && Array.isArray(res.states)) {
          setStates(res.states);
        } else {
          setStates([]);
        }
      })
      .catch((error) => console.error("Error loading states:", error));
  }, []);

  useEffect(() => {
    if (!form.state_id) {
      setDistricts([]);
      return;
    }
    api
      .getDistrictsByState(form.state_id)
      .then((res) => {
        if (Array.isArray(res)) {
          setDistricts(res);
        } else if (res?.districts && Array.isArray(res.districts)) {
          setDistricts(res.districts);
        } else {
          setDistricts([]);
        }
      })
      .catch((error) => console.error("Error loading districts:", error));
  }, [form.state_id]);

  useEffect(() => {
    if (!form.district_id) {
      setCentres([]);
      return;
    }
    api
      .getCentresByDistrict(form.district_id)
      .then((res) => {
        if (Array.isArray(res)) {
          setCentres(res);
        } else if (res?.centres && Array.isArray(res.centres)) {
          setCentres(res.centres);
        } else {
          setCentres([]);
        }
      })
      .catch((error) => console.error("Error loading centres:", error));
  }, [form.district_id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Show confirmation before actual submit
    setConfirmVisible(true);
  };

  const confirmSubmit = async () => {
    setConfirmVisible(false);
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      let formattedTime = form.camp_time;
      if (formattedTime && formattedTime.split(":").length === 2) {
        formattedTime += ":00";
      }

      const payload = {
        organizer_id: Number(form.organizer_id),
        camp_name: form.camp_name,
        centre_id: Number(form.centre_id),
        state_id: Number(form.state_id),
        district_id: Number(form.district_id),
        location: form.location,
        camp_date: form.camp_date,
        camp_time: formattedTime,
        has_venue: !!form.has_venue,
        description: form.description,
      };

      const response = await api.createCamp(payload);

      // Toast or notification
      setToastMessage("Camp registered successfully! Status: Pending.");

      setMsg("Camp registered successfully!");

      // Reset form except organizer_id
      setForm((prev) => ({
        ...prev,
        camp_name: "",
        state_id: "",
        district_id: "",
        centre_id: "",
        location: "",
        camp_date: "",
        camp_time: "",
        has_venue: false,
        description: "",
      }));

      setCentres([]);
      setDistricts([]);

      fetchExistingCamps();

      // TODO: Backend should send email to organizer here
      // e.g. server side: sendEmail(organizer.email, "Your camp has been registered and is pending approval", ...)

    } catch (error) {
      console.error("Failed to register camp:", error);
      setErr(error.message || "Failed to register camp");
      setToastMessage(error.message || "Failed to register camp");
    } finally {
      setLoading(false);
    }
  };

  const cancelSubmit = () => {
    setConfirmVisible(false);
  };

  const organizerProfileMissing = !organizer && err === "Organizer profile not found.";

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-neutral-900 p-8 rounded-xl shadow-lg relative">
        <h2 className="text-2xl font-bold mb-6 text-red-500">Register a Camp</h2>

        {organizer && (
          <p className="mb-4 text-sm text-gray-300">
            Organizer:{" "}
            <span className="font-semibold text-white">{organizer.organization_name}</span>
          </p>
        )}

        {organizerProfileMissing && (
          <p className="mb-4 text-yellow-400 font-semibold">
            Organizer profile not found. Please register your organizer profile first.
          </p>
        )}

        {msg && <p className="text-green-400 mb-4">{msg}</p>}
        {err && !organizerProfileMissing && <p className="text-red-400 mb-4">{err}</p>}

        {existingCamps.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-yellow-400">
              Your Existing Camps
            </h3>
            <div className="max-h-72 overflow-y-auto space-y-4">
              {existingCamps.map((camp) => (
                <div
                  key={camp.camp_id}
                  className="p-4 rounded-md bg-gray-800 shadow-md border border-gray-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold">{camp.camp_name}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        camp.status === "approved"
                          ? "bg-green-600 text-green-100"
                          : camp.status === "pending"
                          ? "bg-yellow-500 text-yellow-900"
                          : camp.status === "rejected"
                          ? "bg-red-600 text-red-100"
                          : "bg-gray-600 text-gray-100"
                      }`}
                    >
                      {camp.status.charAt(0).toUpperCase() +
                        camp.status.slice(1)}
                    </span>
                  </div>
                  <p>
                    <strong>Location:</strong> {camp.location}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(camp.camp_date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong> {camp.camp_time}
                  </p>
                  {camp.rejection_reason && (
                    <p className="mt-2 text-red-400 font-medium">
                      <strong>Rejection Reason:</strong> {camp.rejection_reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          style={{
            pointerEvents: organizerProfileMissing ? "none" : "auto",
            opacity: organizerProfileMissing ? 0.6 : 1,
          }}
        >
          <InputField
            label="Camp Name"
            name="camp_name"
            value={form.camp_name}
            onChange={handleChange}
            required
            disabled={organizerProfileMissing}
          />
          <InputField
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            disabled={organizerProfileMissing}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="state_id"
              value={form.state_id}
              onChange={handleChange}
              required
              disabled={organizerProfileMissing}
              className="w-full bg-black border-b border-gray-600 py-2 text-white"
            >
              <option value="">-- Select State --</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.state_name}
                </option>
              ))}
            </select>

            <select
              name="district_id"
              value={form.district_id}
              onChange={handleChange}
              required
              disabled={organizerProfileMissing}
              className="w-full bg-black border-b border-gray-600 py-2 text-white"
            >
              <option value="">-- Select District --</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name || d.district_name}
                </option>
              ))}
            </select>
          </div>

          <select
            name="centre_id"
            value={form.centre_id}
            onChange={handleChange}
            required
            disabled={organizerProfileMissing}
            className="w-full bg-black border-b border-gray-600 py-2 text-white"
          >
            <option value="">-- Select Centre --</option>
            {centres.length === 0 ? (
              <option disabled value="">
                ❌ No centres available for this district
              </option>
            ) : (
              centres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.centre_name || c.name}
                </option>
              ))
            )}
          </select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              type="date"
              label="Date"
              name="camp_date"
              value={form.camp_date}
              onChange={handleChange}
              required
              disabled={organizerProfileMissing}
            />
            <InputField
              type="time"
              label="Time"
              name="camp_time"
              value={form.camp_time}
              onChange={handleChange}
              required
              disabled={organizerProfileMissing}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="has_venue"
              checked={form.has_venue}
              onChange={handleChange}
              id="has_venue"
              disabled={organizerProfileMissing}
            />
            <label htmlFor="has_venue">Organizer provides venue</label>
          </div>

          <div>
            <label className="block mb-1">Description (optional)</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full bg-transparent border border-gray-600 p-2 rounded-md"
              disabled={organizerProfileMissing}
            />
          </div>

          <button
            type="submit"
            disabled={loading || centres.length === 0 || organizerProfileMissing}
            className={`px-6 py-2 rounded-lg text-white transition-colors ${
              centres.length === 0 || organizerProfileMissing
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Submitting..." : "Register Camp"}
          </button>
        </form>

        {/* Confirmation Modal */}
        <ConfirmModal
          visible={confirmVisible}
          title="Confirm Registration"
          message="Are you sure you want to register this camp? Once registered it will be in pending status."
          onConfirm={confirmSubmit}
          onCancel={cancelSubmit}
        />

        {/* Toast popup */}
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage("")} />
        )}
      </div>
    </div>
  );
}

function InputField({ label, name, type = "text", value, onChange, ...props }) {
  return (
    <div>
      <label className="block mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent border-b border-gray-600 py-2"
        {...props}
      />
    </div>
  );
}
