import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";

const BloodStockAvailability = () => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [component, setComponent] = useState("");
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch states on mount
  useEffect(() => {
    fetch("/api/states") // 🔹 replace with your backend API
      .then((res) => res.json())
      .then((data) => setStates(data));
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (selectedState) {
      fetch(`/api/districts?state=${selectedState}`) // 🔹 backend endpoint
        .then((res) => res.json())
        .then((data) => setDistricts(data));
    }
  }, [selectedState]);

  // Fetch blood stock data
  const handleSearch = () => {
    setLoading(true);
    fetch(
      `/api/blood-stocks?state=${selectedState}&district=${selectedDistrict}&bloodGroup=${bloodGroup}&component=${component}`
    )
      .then((res) => res.json())
      .then((data) => {
        setStocks(data);
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-black text-white">
        <Header />    

        <div className="p-8 bg-black min-h-screen">
        <h1
            className="text-3xl font-bold text-white-dark mb-6"
            style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}
        >
            Blood Stock Availability
        </h1>

        {/* Filters */}
        <div className="bg-gray-900 shadow-md rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* State */}
            <select
                className="p-3 border rounded-lg text-gray-500"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
            >
                <option value="">Select State</option>
                {states.map((s, i) => (
                <option key={i} value={s}>{s}</option>
                ))}
            </select>

            {/* District */}
            <select
                className="p-3 border rounded-lg text-gray-500"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
            >
                <option value="">Select District</option>
                {districts.map((d, i) => (
                <option key={i} value={d}>{d}</option>
                ))}
            </select>

            {/* Blood Group */}
            <select
                className="p-3 border rounded-lg text-gray-500"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
            >
                <option value="">Select Blood Group</option>
                {["A+Ve", "A-Ve", "B+Ve", "B-Ve", "O+Ve", "O-Ve", "AB+Ve", "AB-Ve"].map((bg, i) => (
                <option key={i} value={bg}>{bg}</option>
                ))}
            </select>

            {/* Component */}
            <select
                className="p-3 border rounded-lg text-gray-500"
                value={component}
                onChange={(e) => setComponent(e.target.value)}
            >
                <option value="">Select Component</option>
                {["Whole Blood", "Plasma", "Platelets"].map((c, i) => (
                <option key={i} value={c}>{c}</option>
                ))}
            </select>
            </div>

            <div className="mt-6">
            <button
                onClick={handleSearch}
                className="bg-blood-dark hover:bg-blood-light text-white px-6 py-2 rounded-lg transition"
            >
                {loading ? "Searching..." : "Search"}
            </button>
            </div>
        </div>

        {/* Results Table */}
        <div className="bg-white shadow-md rounded-xl overflow-x-auto">
            <table className="w-full border-collapse">
            <thead className="bg-blood-dark text-white">
                <tr>
                <th className="p-3 border">S.No</th>
                <th className="p-3 border">Blood Bank</th>
                <th className="p-3 border">Category</th>
                <th className="p-3 border">Availability</th>
                <th className="p-3 border">Last Updated</th>
                <th className="p-3 border">Type</th>
                </tr>
            </thead>
            <tbody>
                {stocks.length === 0 ? (
                <tr>
                    <td colSpan="6" className="text-center p-4">
                    No data found.
                    </td>
                </tr>
                ) : (
                stocks.map((stock, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                    <td className="p-3 border">{index + 1}</td>
                    <td className="p-3 border">{stock.bloodBank}</td>
                    <td className="p-3 border">{stock.category}</td>
                    <td className="p-3 border">{stock.availability}</td>
                    <td className="p-3 border">{stock.lastUpdated}</td>
                    <td className="p-3 border">{stock.type}</td>
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
