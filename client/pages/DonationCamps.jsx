import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
import { api } from "../lib/api";

export default function DonationCamps() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [date, setDate] = useState(null);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch states on load
  useEffect(() => {
    api.getStates()
    .then((res) => {
    // Check if the result is an array or wrapped in an object
    const result = Array.isArray(res) ? res : res?.states || [];
    setStates(result);
    })
    .catch((err) => {
    console.error("Error loading states", err);
    setStates([]); // fallback
    });
  }, []);

  // Fetch districts when a state is selected
  useEffect(() => {
    if (!selectedState) {
    setDistricts([]);
    setSelectedDistrict("");
    return;
    }
    api.getDistrictsByState(selectedState)
    .then((res) => {
    const data = Array.isArray(res) ? res : res?.districts || [];
    setDistricts(data);
    })
    .catch((err) => {
    console.error("Error loading districts", err);
    setDistricts([]); // fallback
    });
  }, [selectedState]);

  // Fetch camps (district preferred > state)
  const fetchCamps = async () => {
    setLoading(true);
    try {
      let data = [];

      if (selectedDistrict) {
        data = await api.getCampsByDistrict(selectedDistrict);
      } else if (selectedState) {
        data = await api.searchCampsByState(selectedState);
      }

      if (Array.isArray(data)) {
        // Optional: filter by selected date (if date chosen)
        const filtered = date
          ? data.filter((c) => new Date(c.camp_date).toDateString() === new Date(date).toDateString())
          : data;
        setCamps(filtered);
      } else {
        setCamps([]);
      }
    } catch (error) {
      console.error("Failed to fetch camps:", error);
      setCamps([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch camps on filter change
  useEffect(() => {
    fetchCamps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState, selectedDistrict]);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-black text-white">
      <h2 className="text-3xl font-bold mb-6">Camp Schedule</h2>

      <div className="bg-neutral-900 p-6 rounded-lg border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* State */}
          <div>
            <label className="block mb-2 text-sm">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-black border-b border-gray-600 py-2 text-white"
            >
              <option value="">Select State</option> {Array.isArray(states) && states.map((state) => ( <option key={state.id} value={state.id}> {state.state_name || state.name} </option> ))} </select>
          </div>

          {/* District */}
          <div>
            <label className="block mb-2 text-sm">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-black border-b border-gray-600 py-2 text-white"
            >
              <option value="">Select district</option>
              {Array.isArray(districts) && districts.map((d) => ( <option key={d.id} value={d.id}> {d.district_name || d.name} </option> ))}
            </select>
          </div>

          {/* Date (optional filter) */}
          <div>
            <label className="block mb-2 text-sm">Date</label>
            <DatePicker
              selected={date}
              onChange={(date) => setDate(date)}
              className="w-full bg-black border-b border-gray-600 py-2 text-white pl-10 rounded"
              placeholderText="Select date"
            />
          </div>

          {/* Button */}
          <div className="flex items-end">
            <button
              onClick={fetchCamps}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
            >
              Search Camps
            </button>
          </div>
        </div>

        {/* Camp Results */}
        <div>
          {loading ? (
            <p className="text-gray-400">Loading camps...</p>
          ) : camps.length === 0 ? (
            <p className="text-gray-400">No camps found for selected filters.</p>
          ) : (
            <ul className="space-y-4">
              {camps.map((camp) => (
                <li
                  key={camp.id || camp.camp_id}
                  className="p-4 bg-gray-800 rounded-lg"
                >
                  <h3 className="font-bold text-lg text-red-400">{camp.camp_name}</h3>
                  <p className="text-sm text-gray-300">
                    {camp.location || camp.camp_location}
                  </p>
                  <p className="text-sm text-gray-400">
                    {camp.district_name || camp.district}, {camp.state_name || camp.state}
                  </p>
                  {camp.camp_date && (
                    <p className="text-sm text-gray-400">
                      {new Date(camp.camp_date).toLocaleDateString()}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
