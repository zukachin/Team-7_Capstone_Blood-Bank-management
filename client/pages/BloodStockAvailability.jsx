import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { api } from "../lib/api";

const BloodStockAvailability = () => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");
  const [component, setComponent] = useState("");
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load states on mount
  useEffect(() => {
    api.getStates()
      .then((res) => {
        console.log("States response:", res);
        if (Array.isArray(res)) {
          setStates(res);
        } else if (res && Array.isArray(res.states)) {
          setStates(res.states);
        } else {
          setStates([]);
          console.warn("Unexpected states response format");
        }
      })
      .catch((err) => {
        console.error("Error loading states", err);
        setStates([]);
      });
  }, []);

  // Load blood groups on mount
  useEffect(() => {
    api.getBloodGroups()
      .then((res) => {
        console.log("Blood groups response:", res);
        if (Array.isArray(res)) {
          setBloodGroups(res);
        } else {
          setBloodGroups([]);
          console.warn("Unexpected blood groups response format");
        }
      })
      .catch((err) => {
        console.error("Error loading blood groups", err);
        setBloodGroups([]);
      });
  }, []);

  // Load districts when state changes
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      setSelectedDistrict("");
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

  // Clear results when state changes
  useEffect(() => {
    setCentres([]);
  }, [selectedState]);

  const handleSearch = async () => {
    if (!selectedState) {
      alert("Please select a state to search.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("stateId", selectedState);
      
      // Only add optional filters if they are selected
      if (selectedDistrict) {
        params.append("districtId", selectedDistrict);
      }
      if (selectedBloodGroup) {
        params.append("bloodGroupId", selectedBloodGroup);
      }
      if (component) {
        params.append("component", component);
      }

      const response = await fetch(`http://localhost:4001/api/inventory/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Search response:", data);

      // Set centres from the response
      setCentres(Array.isArray(data.centres) ? data.centres : []);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setCentres([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
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
            <div>
              <label className="block text-sm font-medium mb-2">Select State *</label>
              <select
                className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                style={{
                  color: selectedState ? 'white' : '#9CA3AF',
                }}
              >
                <option value="" style={{ color: '#9CA3AF' }}>Choose a state</option>
                {states.map((state) => (
                  <option 
                    key={state.state_id || state.id} 
                    value={state.state_id || state.id}
                    style={{ color: 'white', backgroundColor: '#374151' }}
                  >
                    {state.name || state.state_name}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium mb-2">Select District (Optional)</label>
              <select
                className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={!selectedState}
                style={{
                  color: selectedDistrict ? 'white' : '#9CA3AF',
                }}
              >
                <option value="" style={{ color: '#9CA3AF' }}>
                  {selectedState ? 'All districts (or choose specific)' : 'Select state first'}
                </option>
                {districts.map((district) => (
                  <option 
                    key={district.district_id || district.id} 
                    value={district.district_id || district.id}
                    style={{ color: 'white', backgroundColor: '#374151' }}
                  >
                    {district.name || district.district_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Blood Group (Optional)</label>
              <select
                className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={selectedBloodGroup}
                onChange={(e) => setSelectedBloodGroup(e.target.value)}
                style={{
                  color: selectedBloodGroup ? 'white' : '#9CA3AF',
                }}
              >
                <option value="" style={{ color: '#9CA3AF' }}>All blood groups (or choose specific)</option>
                {bloodGroups.map((bg) => (
                  <option 
                    key={bg.id} 
                    value={bg.id}
                    style={{ color: 'white', backgroundColor: '#374151' }}
                  >
                    {bg.group_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Component */}
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Component (Optional)</label>
              <select
                className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={component}
                onChange={(e) => setComponent(e.target.value)}
                style={{
                  color: component ? 'white' : '#9CA3AF',
                }}
              >
                <option value="" style={{ color: '#9CA3AF' }}>All components</option>
                {["WholeBlood", "RBC", "Plasma", "Platelets"].map((c) => (
                  <option 
                    key={c} 
                    value={c}
                    style={{ color: 'white', backgroundColor: '#374151' }}
                  >
                    {c === "WholeBlood" ? "Whole Blood" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSearch}
              disabled={!selectedState || loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </div>
              ) : (
                "Search Blood Stock"
              )}
            </button>
            
            {centres.length > 0 && (
              <div className="text-sm text-gray-400">
                Found {centres.length} blood bank{centres.length !== 1 ? 's' : ''} with available stock
              </div>
            )}
            
            {!selectedState && (
              <div className="text-sm text-red-400">
                * State selection is required
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {centres.length > 0 ? (
          <div className="space-y-6">
            {centres.map((centre, centreIndex) => (
              <div key={centre.centre_id} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-red-600 p-4">
                  <h3 className="text-xl font-semibold text-white">
                    {centre.centre_name}
                  </h3>
                  <p className="text-red-100 text-sm">
                    Code: {centre.centre_code} • {centre.address}
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full table-auto text-white">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="p-3 text-left">S.No</th>
                        <th className="p-3 text-left">Blood Group</th>
                        <th className="p-3 text-left">Component</th>
                        <th className="p-3 text-left">Units Available</th>
                        <th className="p-3 text-left">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {centre.inventories
                        .filter(inventory => !component || inventory.component === component)
                        .map((inventory, inventoryIndex) => (
                        <tr key={inventoryIndex} className="hover:bg-gray-800 transition">
                          <td className="p-3 border-t border-gray-700">{inventoryIndex + 1}</td>
                          <td className="p-3 border-t border-gray-700">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {inventory.blood_group_name}
                            </span>
                          </td>
                          <td className="p-3 border-t border-gray-700">
                            {inventory.component === "WholeBlood" ? "Whole Blood" : inventory.component}
                          </td>
                          <td className="p-3 border-t border-gray-700">
                            <span className={`font-semibold ${
                              inventory.units_available > 20 ? 'text-green-400' :
                              inventory.units_available > 10 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {inventory.units_available} units
                            </span>
                          </td>
                          <td className="p-3 border-t border-gray-700 text-sm text-gray-300">
                            {formatDate(inventory.last_updated)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : selectedState && selectedDistrict && selectedBloodGroup && !loading ? (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Blood Stock Available</h3>
            <p className="text-gray-400">
              No blood inventory found for the selected criteria. Try selecting different filters.
            </p>
          </div>
        ) : !selectedState ? (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Select State and Search</h3>
            <p className="text-gray-400">
              Choose a state (and optionally district, blood group, or component) then click "Search Blood Stock" to view available inventory.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BloodStockAvailability;