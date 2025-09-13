import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function CampRegistration() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    camp_name: "",
    organizer_id: "", // ← will come from profile
    state_id: "",
    district_id: "",
    centre_id: "",
    location: "",
    camp_date: "",
    camp_time: "",
    has_venue: false,
    description: "",
  });

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!api.getToken()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ✅ Load profile to get organizer_id
  useEffect(() => {
    api.getProfile()
      .then((data) => {
        setForm((prev) => ({ ...prev, organizer_id: data.id }));
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        setErr("Failed to load organizer info");
      });
  }, []);

  // ✅ Load states
  useEffect(() => {
  api.getStates()
    .then((res) => {
    //   console.log("✅ States API response:", res); // 👈 Debug here
      if (Array.isArray(res)) {
        setStates(res);
      } else if (res?.states && Array.isArray(res.states)) {
        setStates(res.states);
      } else {
        setStates([]);
      }
    })
    .catch((err) => console.error("❌ Error loading states:", err));
}, []);


  // ✅ Load districts on state change
  useEffect(() => {
  if (!form.state_id) {
    setDistricts([]);
    return;
  }

  api.getDistrictsByState(form.state_id)
    .then((res) => {
    //   console.log("✅ Districts response:", res);
      if (Array.isArray(res)) {
        setDistricts(res);
      } else if (res?.districts && Array.isArray(res.districts)) {
        setDistricts(res.districts);
      } else {
        setDistricts([]);
      }
    })
    .catch((err) => console.error("❌ Error loading districts:", err));
}, [form.state_id]);

  // ✅ Load centres on district change
  useEffect(() => {
  if (!form.district_id) {
    setCentres([]);
    return;
  }

  api.getCentresByDistrict(form.district_id)
    .then((res) => {
      console.log("✅ Centres response:", res);
      if (Array.isArray(res)) {
        setCentres(res);
      } else if (res?.centres && Array.isArray(res.centres)) {
        setCentres(res.centres);
      } else {
        setCentres([]);
      }
    })
    .catch((err) => console.error("❌ Error loading centres:", err));
}, [form.district_id]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      const payload = {
        organizer_id: Number(form.organizer_id),
        camp_name: form.camp_name,
        centre_id: Number(form.centre_id),
        state_id: Number(form.state_id),
        district_id: Number(form.district_id),
        location: form.location,
        camp_date: form.camp_date,
        camp_time: form.camp_time,
        has_venue: !!form.has_venue,
        description: form.description,
      };

      await api.createCamp(payload);
      setMsg("Camp registered successfully!");
      setForm({
        camp_name: "",
        organizer_id: form.organizer_id,
        state_id: "",
        district_id: "",
        centre_id: "",
        location: "",
        camp_date: "",
        camp_time: "",
        has_venue: false,
        description: "",
      });
    } catch (error) {
      console.error("Failed to register camp:", error);
      setErr(error.message || "Failed to register camp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-neutral-900 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-red-500">Register a Camp</h2>

        {msg && <p className="text-green-400 mb-4">{msg}</p>}
        {err && <p className="text-red-400 mb-4">{err}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField label="Camp Name" name="camp_name" value={form.camp_name} onChange={handleChange} required />
          <InputField label="Location" name="location" value={form.location} onChange={handleChange} required />

          {/* State & District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
                name="state_id"
                value={form.state_id}
                onChange={handleChange}
                required
                className="w-full bg-black border-b border-gray-600 py-2 text-white"
                >
                <option value="">-- Select State --</option>
                {states.map((s) => (
                    <option key={s.id} value={s.id}>
                    {s.name || s.state_name} {/* fallback name */}
                    </option>
                ))}
                </select>


                <select
                name="district_id"
                value={form.district_id}
                onChange={handleChange}
                required
                className="w-full bg-black border-b border-gray-600 py-2 text-white"
                >
                <option value="">-- Select District --</option>
                {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                    {d.name || d.district_name} {/* fallback name support */}
                    </option>
                ))}
                </select>


          </div>

          {/* Centre */}
            <select
                name="centre_id"
                value={form.centre_id}
                onChange={handleChange}
                required
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


          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField type="date" label="Date" name="camp_date" value={form.camp_date} onChange={handleChange} required />
            <InputField type="time" label="Time" name="camp_time" value={form.camp_time} onChange={handleChange} required />
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2">
            <input type="checkbox" name="has_venue" checked={form.has_venue} onChange={handleChange} />
            <label>Organizer provides venue</label>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1">Description (optional)</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              className="w-full bg-transparent border border-gray-600 p-2 rounded-md" />
          </div>

          <button
            type="submit"
            disabled={loading || centres.length === 0}
            className={`px-6 py-2 rounded-lg text-white transition-colors ${
                centres.length === 0
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
            >
            {loading ? "Submitting..." : "Register Camp"}
            </button>

        </form>
      </div>
    </div>
  );
}

// Reusable Input component
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

// Reusable Select component
function SelectField({ label, name, value, onChange, options = [], getLabel = (o) => o.label }) {
  return (
    <div>
      <label className="block mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent border-b border-gray-600 py-2 text-white"
      >
        <option value="">-- Select {label} --</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id} className="text-black">
            {getLabel(opt)}
          </option>
        ))}
      </select>
    </div>
  );
}
