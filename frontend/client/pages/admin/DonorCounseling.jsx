// src/pages/admin/DonorCounseling.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AllCounselings from "./AllCounselings";
import { api } from "../../lib/api"; // uses the api helper

export default function DonorCounseling() {
  const location = useLocation();
  const navigate = useNavigate();
  const pre = location.state || {};

  const [activeTab, setActiveTab] = useState("counseling");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    donor_id: pre.donor_id ?? "",
    centre_id: pre.centre_id ?? "",
    camp_id: pre.camp_id ?? "",
    // keep "counselling_date" (backend appears to use this key)
    counselling_date: new Date().toISOString(), 
    height: "",
    weight: "",
    hb_level: "",
    previous_donation_date: "",
    drunk_last_12hrs: false,
    well_today: true,
    under_medication: false,
    fever_in_2_weeks: false,
    recently_delivered: false,
    pregnancy: false,
    surgery: false,
    disease_history: "",
  });

  useEffect(() => {
    if (pre.donor_id || pre.centre_id || pre.camp_id) {
      setForm((f) => ({
        ...f,
        donor_id: pre.donor_id ?? f.donor_id,
        centre_id: pre.centre_id ?? f.centre_id,
        camp_id: pre.camp_id ?? f.camp_id,
      }));
      // optionally show history first if desired
      // if (pre.donor_id) setActiveTab("all");
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      // Use the shared api helper - it handles base URL, headers and JSON parsing
      const payload = { ...form };
      const res = await api.createCounseling(payload);

      // success
      setMessage("Counseling saved.");
      setActiveTab("all");
    } catch (err) {
      // Better error message reading - api.js attaches body + status on thrown Error
      console.error("Save error:", err);
      const serverMessage =
        (err && err.body && (err.body.message || err.body.error || err.body)) ||
        err.message ||
        "Failed to save.";
      setMessage(typeof serverMessage === "string" ? serverMessage : JSON.stringify(serverMessage));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({
      donor_id: "",
      centre_id: "",
      camp_id: "",
      counselling_date: new Date().toISOString(),
      height: "",
      weight: "",
      hb_level: "",
      previous_donation_date: "",
      drunk_last_12hrs: false,
      well_today: true,
      under_medication: false,
      fever_in_2_weeks: false,
      recently_delivered: false,
      pregnancy: false,
      surgery: false,
      disease_history: "",
    });
  };

  return (
    <div className="p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Donor Counseling</h2>
        <button onClick={() => navigate(-1)} className="px-3 py-2 bg-gray-800 text-gray-200 rounded">Back</button>
      </div>

      <div className="mb-4 flex gap-2">
        <button onClick={() => setActiveTab("counseling")} className={`px-4 py-2 rounded ${activeTab === "counseling" ? "bg-gray-200 text-black" : "bg-transparent text-gray-300 border border-gray-700"}`}>Counseling</button>
        <button onClick={() => setActiveTab("all")} className={`px-4 py-2 rounded ${activeTab === "all" ? "bg-gray-200 text-black" : "bg-transparent text-gray-300 border border-gray-700"}`}>All Counselings</button>
      </div>

      {message && <div className="mb-3 px-3 py-2 rounded bg-gray-800 text-green-300">{message}</div>}

      {activeTab === "counseling" && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900 p-4 rounded border border-gray-700">
          {/* IDs */}
          <input className="p-2 rounded bg-gray-800 border border-gray-700 text-white" name="donor_id" placeholder="Donor ID" value={form.donor_id} onChange={handleChange}/>
          <input className="p-2 rounded bg-gray-800 border border-gray-700 text-white" name="centre_id" placeholder="Centre ID" value={form.centre_id} onChange={handleChange}/>
          <input className="p-2 rounded bg-gray-800 border border-gray-700 text-white" name="camp_id" placeholder="Camp ID" value={form.camp_id} onChange={handleChange}/>
          <input className="p-2 rounded bg-gray-800 border border-gray-700 text-white" type="datetime-local" name="counselling_date" value={form.counselling_date ? form.counselling_date.slice(0,16) : ""} onChange={handleChange}/>

          {/* Measurements */}
          <input className="p-2 rounded bg-gray-800 border border-gray-700 text-white" type="number" step="0.1" name="height" placeholder="Height" value={form.height} onChange={handleChange}/>
          <input className="p-2 rounded bg-gray-800 border border-gray-700 text-white" type="number" step="0.1" name="weight" placeholder="Weight" value={form.weight} onChange={handleChange}/>
          <input className="p-2 rounded bg-gray-800 border border-gray-700 text-white" type="number" step="0.1" name="hb_level" placeholder="Hb Level" value={form.hb_level} onChange={handleChange}/>
          <input className="p-2 rounded bg-gray-800 border border-gray-700 text-white" type="date" name="previous_donation_date" value={form.previous_donation_date} onChange={handleChange}/>

          {/* History */}
          <textarea className="p-2 rounded bg-gray-800 border border-gray-700 text-white md:col-span-2" rows="3" name="disease_history" placeholder="Disease history" value={form.disease_history} onChange={handleChange}/>

          {/* Checkboxes */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {["drunk_last_12hrs","well_today","under_medication","fever_in_2_weeks","recently_delivered","pregnancy","surgery"].map(field => (
              <label key={field} className="flex items-center gap-3 text-sm text-gray-300">
                <input type="checkbox" name={field} checked={form[field]} onChange={handleChange} className="h-4 w-4"/>
                {field.replace(/_/g," ")}
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex gap-2 mt-3">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded">{saving ? "Saving..." : "Save Counseling"}</button>
            <button type="button" onClick={handleReset} className="px-4 py-2 bg-gray-700 text-white rounded">Reset</button>
            <button type="button" onClick={() => setActiveTab("all")} className="px-4 py-2 bg-blue-600 text-white rounded">View All Counselings</button>
          </div>
        </form>
      )}

      {activeTab === "all" && <AllCounselings />}
    </div>
  );
}
