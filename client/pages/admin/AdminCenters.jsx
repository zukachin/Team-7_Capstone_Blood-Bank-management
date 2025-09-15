import React, { useState, useEffect } from "react";

export default function AdminCenters() {
  const [centers, setCenters] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);

  const [formData, setFormData] = useState({
    centre_name: "",
    state_id: "",
    district_id: "",
    address: "",
  });

  // Fetch centers
  useEffect(() => {
    fetch("http://localhost:4000/api/centers")
      .then((res) => res.json())
      .then((data) => setCenters(data))
      .catch((err) => console.error("Error fetching centers:", err));
  }, []);

  // Fetch states
  useEffect(() => {
    fetch("http://localhost:4000/api/locations/states")
      .then((res) => res.json())
      .then((data) => setStates(data))
      .catch((err) => console.error("Error fetching states:", err));
  }, []);

  // Fetch all districts once
  useEffect(() => {
    fetch("http://localhost:4000/api/locations/districts")
      .then((res) => res.json())
      .then((data) => setDistricts(data))
      .catch((err) => console.error("Error fetching districts:", err));
  }, []);

  // Filter districts when state changes
  useEffect(() => {
    if (formData.state_id) {
      setFilteredDistricts(
        districts.filter((d) => d.state_id === parseInt(formData.state_id))
      );
    } else {
      setFilteredDistricts([]);
    }
  }, [formData.state_id, districts]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/api/centers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newCenter = await res.json();
        setCenters([...centers, newCenter]);
        setFormData({ centre_name: "", state_id: "", district_id: "", address: "" });
      }
    } catch (err) {
      console.error("Error creating center:", err);
    }
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <h1 className="text-2xl font-bold text-red-600">Center Management</h1>

      {/* Create Center Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <h2 className="col-span-2 text-lg font-semibold text-gray-200 mb-2">
          Create New Center
        </h2>

        {/* Center Name */}
        <input
          type="text"
          name="centre_name"
          placeholder="Center Name"
          value={formData.centre_name}
          onChange={handleChange}
          className="p-3 rounded-lg bg-black border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 col-span-2"
          required
        />

        {/* State Dropdown */}
        <select
          name="state_id"
          value={formData.state_id}
          onChange={handleChange}
          className="p-3 rounded-lg bg-black border border-gray-700 text-white focus:ring-2 focus:ring-red-500 col-span-2"
          required
        >
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={s.state_id} value={s.state_id}>
              {s.state_name}
            </option>
          ))}
        </select>

        {/* District Dropdown (depends on state) */}
        <select
          name="district_id"
          value={formData.district_id}
          onChange={handleChange}
          className="p-3 rounded-lg bg-black border border-gray-700 text-white focus:ring-2 focus:ring-red-500 col-span-2"
          required
        >
          <option value="">Select District</option>
          {filteredDistricts.map((d) => (
            <option key={d.district_id} value={d.district_id}>
              {d.district_name}
            </option>
          ))}
        </select>

        {/* Address */}
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="p-3 rounded-lg bg-black border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 col-span-2"
          required
        />

        {/* Submit */}
        <button
          type="submit"
          className="col-span-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
        >
          Create Center
        </button>
      </form>

      {/* View Centers Table */}
      <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl shadow-xl p-10">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">All Centers</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-700 text-gray-200">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">State</th>
              <th className="p-3 text-left">District</th>
              <th className="p-3 text-left">Address</th>
              <th className="p-3 text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            {centers.length > 0 ? (
              centers.map((center) => (
                <tr
                  key={center.centre_id}
                  className="border-b border-gray-700 hover:bg-gray-800/60"
                >
                  <td className="p-3">{center.centre_id}</td>
                  <td className="p-3">{center.centre_code}</td>
                  <td className="p-3">{center.centre_name}</td>
                  <td className="p-3">
                    {states.find((s) => s.state_id === center.state_id)?.state_name ||
                      center.state_id}
                  </td>
                  <td className="p-3">
                    {districts.find((d) => d.district_id === center.district_id)
                      ?.district_name || center.district_id}
                  </td>
                  <td className="p-3">{center.address}</td>
                  <td className="p-3">
                    {new Date(center.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-3 text-center text-gray-500">
                  No centers available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}