import React, { useState, useEffect } from "react";

export default function DonationCamps() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [date, setDate] = useState("");
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // ✅ Fetch all states
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/donation-camps/states`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStates(data);
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    };
    fetchStates();
  }, [baseUrl]);

  // ✅ Fetch districts when state changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedState) {
        setDistricts([]);
        return;
      }
      try {
        const res = await fetch(
          `${baseUrl}/api/donation-camps/districts?state_id=${selectedState}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setDistricts(data);
      } catch (err) {
        console.error("Error fetching districts:", err);
      }
    };
    fetchDistricts();
  }, [selectedState, baseUrl]);

  // ✅ Search donation camps
  const handleSearch = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        state_id: selectedState,
        district_id: selectedDistrict,
        date,
      }).toString();

      const res = await fetch(`${baseUrl}/api/donation-camps/camps?${query}`);
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
      <h2 className="text-3xl font-bold text-white-dark mb-6">
        Camp Schedule
      </h2>
      <hr className="mb-6 border-gray-300" />

      <div className="bg-white border border-gray-200 rounded-md shadow">
        <div className="bg-red-700 text-white font-bold px-6 py-3 rounded-t-md">
          Camp Schedules
        </div>

        {/* Filters */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-900">
          {/* State */}
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict("");
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.state_id} value={state.state_id}>
                  {state.state_name}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedState}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
            >
              <option value="">
                {selectedState ? "Select District" : "All Districts"}
              </option>
              {districts.map((district) => (
                <option key={district.district_id} value={district.district_id}>
                  {district.district_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-gray-700"
          />

          {/* Search */}
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
                <li key={camp.id} className="p-4 border rounded-md shadow-sm bg-gray-50">
                  <h3 className="font-bold text-lg text-red-700">{camp.camp_name}</h3>
                  <p className="text-sm text-gray-600">{camp.camp_location}</p>
                  <p className="text-sm text-gray-600">
                    {camp.district_name}, {camp.state_name}
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
