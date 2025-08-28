import React, { useState } from "react";

export default function DonationCamps() {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [date, setDate] = useState("");
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ state, district, date }).toString();
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const url = `${baseUrl}/api/donation-camps/camps${query ? "?" + query : ""}`;

      const res = await window.fetch(url, { method: "GET" }); // 👈 force native fetch
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setCamps(data);
    } catch (err) {
      console.error("Error fetching camps:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Title */}
      <h2
        className="text-3xl font-bold text-white-dark mb-6"
        style={{
          fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif",
        }}
      >
        Camp Schedule
      </h2>
      <hr className="mb-6 border-gray-300" />

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-md shadow">
        {/* Header */}
        <div className="bg-red-700 text-white font-bold px-6 py-3 rounded-t-md">
          Camp Schedules
        </div>

        {/* Form */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-900">
          {/* State */}
          <div className="relative">
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700"
            >
              <option value="" disabled hidden>
                Select State
              </option>
              <option value="Maharasthra">Maharasthra</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Andra Pradesh">Andra Pradesh</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
              ▼
            </span>
          </div>

          {/* District */}
          <div className="relative">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700"
            >
              <option value="" disabled hidden>
                Select District
              </option>
              <option value="Mumbai">Mumbai</option>
              <option value="Chennai">Chennai</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
              ▼
            </span>
          </div>

          {/* Date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700"
          />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-red-600 text-white font-bold rounded-md px-6 py-2 hover:bg-red-700 transition"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Results */}
        <div className="p-6">
          {loading ? (
            <p className="text-gray-500">Loading camps...</p>
          ) : camps.length === 0 ? (
            <p className="text-gray-500">No camps found</p>
          ) : (
            <ul className="space-y-4">
              {camps.map((camp) => (
                <li
                  key={camp.id}
                  className="p-4 border rounded-md shadow-sm bg-gray-50"
                >
                  <h3 className="font-bold text-lg text-red-700">
                    {camp.camp_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {camp.camp_location}</p>
                  <p className="text-sm text-gray-600">
                    {camp.district}, {camp.state}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(camp.camp_date).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
