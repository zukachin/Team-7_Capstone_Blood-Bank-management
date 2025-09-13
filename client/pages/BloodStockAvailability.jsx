import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { api } from "../lib/api"; // ✅ Use your central API helper

const BloodStockAvailability = () => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [component, setComponent] = useState("");
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load states on mount
  useEffect(() => {
  api.getStates()
    .then((res) => {
      // Log response for debugging
      console.log("States response:", res);
      // Defensive: if res is an object with a property (like `states`), extract the array accordingly
      if (Array.isArray(res)) {
        setStates(res);
      } else if (res && Array.isArray(res.states)) {
        setStates(res.states);
      } else {
        // fallback empty array if response is unexpected
        setStates([]);
        console.warn("Unexpected states response format");
      }
    })
    .catch((err) => {
      console.error("Error loading states", err);
      setStates([]);
    });
}, []);


  // Load districts when state changes
  useEffect(() => {
  if (!selectedState) {
    setDistricts([]);
    return;
  }
  api.getDistrictsByState(selectedState)
    .then((res) => {
      console.log("Districts response:", res);
      if (Array.isArray(res)) {
        setDistricts(res);
      } else if (res && Array.isArray(res.districts)) {
        setDistricts(res.districts);
      } else {
        setDistricts([]);
        console.warn("Unexpected districts response format");
      }
    })
    .catch((err) => {
      console.error("Error loading districts", err);
      setDistricts([]);
    });
}, [selectedState]);


  const handleSearch = async () => {
  setLoading(true);
  try {
    // Build query params safely
    const params = new URLSearchParams();

    if (selectedState) params.append("state_id", selectedState);
    if (selectedDistrict) params.append("district_id", selectedDistrict);
    if (bloodGroup) params.append("blood_group", bloodGroup);
    if (component) params.append("component", component);

    const response = await fetch(`http://localhost:4001/api/blood-availability?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Ensure data is an array before setting it
    setStocks(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Failed to fetch stock:", err);
    setStocks([]);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Blood Stock Availability</h1>

        {/* Filters */}
        <div className="bg-neutral-900 shadow-md rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* State */}
            <select
              className="w-full bg-black border-b border-gray-600 py-2 text-white"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option className="text-black">Select State</option>
              {states.map((s) => (
                <option className="text-white" key={s.id} value={s.id}>{s.state_name}</option>
              ))}
            </select>

            {/* District */}
            <select
              className="w-full bg-black border-b border-gray-600 py-2 text-white"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.district_name}</option>
              ))}
            </select>

            {/* Blood Group */}
            <select
              className="w-full bg-black border-b border-gray-600 py-2 text-white"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            >
              <option value="">Select Blood Group</option>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>

            {/* Component */}
            <select
              className="w-full bg-black border-b border-gray-600 py-2 text-white"
              value={component}
              onChange={(e) => setComponent(e.target.value)}
            >
              <option value="">Select Component</option>
              {["Whole Blood", "Plasma", "Platelets"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSearch}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-x-auto">
          <table className="w-full table-auto text-white">
            <thead className="bg-red-600">
              <tr>
                <th className="p-3 border">S.No</th>
                <th className="p-3 border">Blood Bank</th>
                <th className="p-3 border">Category</th>
                <th className="p-3 border">Availability</th>
                <th className="p-3 border">Last Updated</th>
                <th className="p-3 border">Component</th>
              </tr>
            </thead>
            <tbody>
              {stocks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-400">
                    No data found.
                  </td>
                </tr>
              ) : (
                stocks.map((stock, i) => (
                  <tr key={i} className="hover:bg-red-900/20 transition">
                    <td className="p-3 border text-center">{i + 1}</td>
                    <td className="p-3 border">{stock.bloodBank}</td>
                    <td className="p-3 border">{stock.category}</td>
                    <td className="p-3 border">{stock.availability}</td>
                    <td className="p-3 border">{stock.lastUpdated}</td>
                    <td className="p-3 border">{stock.component}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BloodStockAvailability;
