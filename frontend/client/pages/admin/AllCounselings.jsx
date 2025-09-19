// src/pages/admin/AllCounselings.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../lib/api";

export default function AllCounselings() {
  const location = useLocation();
  const [campId, setCampId] = useState("");
  const [donorId, setDonorId] = useState(""); // New donor ID filter
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Check if donor_id is passed from state (when coming from donor register)
  useEffect(() => {
    const stateDonorId = location.state?.donor_id;
    if (stateDonorId) {
      setDonorId(stateDonorId);
      doFetch("", stateDonorId); // Fetch with donor filter immediately
    } else {
      doFetch("", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  async function doFetch(filterCampId, filterDonorId) {
    setLoading(true);
    setError("");
    setRows([]);

    try {
      let result;
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filterCampId && filterCampId.trim()) {
        params.append('camp_id', filterCampId.trim());
      }
      if (filterDonorId && filterDonorId.trim()) {
        params.append('donor_id', filterDonorId.trim());
      }
      
      // Use the centralized API method with parameters
      const queryString = params.toString();
      if (queryString) {
        // You'll need to update the api.js to support donor_id filtering
        result = await api.getCounselingsWithFilter(queryString);
      } else {
        result = await api.getAllCounselings();
      }

      // Extract array from common shapes
      let counselings = [];
      if (Array.isArray(result)) {
        counselings = result;
      } else if (result && Array.isArray(result.data)) {
        counselings = result.data;
      } else if (result && Array.isArray(result.rows)) {
        counselings = result.rows;
      } else if (result && Array.isArray(result.counseling)) {
        counselings = result.counseling;
      } else if (result && Array.isArray(result.counselings)) {
        counselings = result.counselings;
      } else if (result && typeof result === "object") {
        const arrProp = Object.values(result).find((v) => Array.isArray(v));
        if (arrProp) counselings = arrProp;
      }

      setRows(Array.isArray(counselings) ? counselings : []);
    } catch (err) {
      const msg =
        (err && err.message) ||
        (err && err.statusText) ||
        "Failed to load counselings";
      setError(`${msg} ${err && err.status ? `(Status: ${err.status})` : ""}`);
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(i) {
    setExpandedIndex((prev) => (prev === i ? null : i));
  }

  const handleFilter = () => {
    doFetch(campId, donorId);
  };

  const handleClear = () => {
    setCampId("");
    setDonorId("");
    doFetch("", "");
  };

  return (
    <div className="bg-gray-900 p-4 rounded border border-gray-700">
      <h3 className="text-lg text-white font-bold mb-3">All Counselings</h3>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-sm text-gray-300 block mb-1">Filter by Donor ID:</label>
          <input
            value={donorId}
            onChange={(e) => setDonorId(e.target.value)}
            placeholder="e.g. 123"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
          />
        </div>
        
        <div>
          <label className="text-sm text-gray-300 block mb-1">Filter by Camp ID:</label>
          <input
            value={campId}
            onChange={(e) => setCampId(e.target.value)}
            placeholder="e.g. 1"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Filter
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Show current filter status */}
      {(donorId || campId) && (
        <div className="mb-3 p-2 bg-blue-900 rounded text-blue-200 text-sm">
          Filtering: 
          {donorId && ` Donor ID: ${donorId}`}
          {donorId && campId && ' | '}
          {campId && ` Camp ID: ${campId}`}
        </div>
      )}

      {loading && <div className="text-gray-400 mb-3">Loading...</div>}
      {error && <div className="text-red-400 mb-3">{error}</div>}

      {/* Results Table */}
      {rows.length === 0 ? (
        <div className="text-gray-400 mb-4">
          {loading ? "Loading..." : "No counseling records found."}
        </div>
      ) : (
        <div className="overflow-x-auto mb-4">
          <table className="w-full table-auto text-left border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-600 px-2 py-1 text-gray-300 bg-gray-800">#</th>
                <th className="border border-gray-600 px-2 py-1 text-gray-300 bg-gray-800">ID</th>
                <th className="border border-gray-600 px-2 py-1 text-gray-300 bg-gray-800">Donor ID</th>
                <th className="border border-gray-600 px-2 py-1 text-gray-300 bg-gray-800">Centre ID</th>
                <th className="border border-gray-600 px-2 py-1 text-gray-300 bg-gray-800">Camp ID</th>
                <th className="border border-gray-600 px-2 py-1 text-gray-300 bg-gray-800">Date</th>
                <th className="border border-gray-600 px-2 py-1 text-gray-300 bg-gray-800">Hb</th>
                <th className="border border-gray-600 px-2 py-1 text-gray-300 bg-gray-800">Height</th>
                <th className="border border-gray-600 px-2 py-1 text-gray-300 bg-gray-800">Weight</th>
                <th className="border border-gray-600 px-2 py-1 text-gray-300 bg-gray-800">Status</th>
                <th className="border border-gray-600 px-2 py-1 text-gray-300 bg-gray-800">Details</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => {
                const key = r.counseling_id ?? r.id ?? r.counselling_id ?? i;
                const dateVal = r.counselling_date ?? r.counseling_date ?? r.date;
                return (
                  <React.Fragment key={key}>
                    <tr className="odd:bg-gray-900 even:bg-gray-800">
                      <td className="border border-gray-600 px-2 py-1 text-gray-200">{i + 1}</td>
                      <td className="border border-gray-600 px-2 py-1 text-gray-200">
                        {r.counseling_id ?? r.id ?? "-"}
                      </td>
                      <td className="border border-gray-600 px-2 py-1 text-gray-200">
                        {r.donor_id ?? r.donorId ?? "-"}
                      </td>
                      <td className="border border-gray-600 px-2 py-1 text-gray-200">
                        {r.centre_id ?? r.centreId ?? "-"}
                      </td>
                      <td className="border border-gray-600 px-2 py-1 text-gray-200">
                        {r.camp_id ?? r.campId ?? "-"}
                      </td>
                      <td className="border border-gray-600 px-2 py-1 text-gray-200">
                        {dateVal ? new Date(dateVal).toLocaleString() : "-"}
                      </td>
                      <td className="border border-gray-600 px-2 py-1 text-gray-200">
                        {r.hb_level ?? r.hbLevel ?? "-"}
                      </td>
                      <td className="border border-gray-600 px-2 py-1 text-gray-200">{r.height ?? "-"}</td>
                      <td className="border border-gray-600 px-2 py-1 text-gray-200">{r.weight ?? "-"}</td>
                      <td className="border border-gray-600 px-2 py-1 text-gray-200">{r.status ?? "-"}</td>
                      <td className="border border-gray-600 px-2 py-1 text-gray-200">
                        <button
                          onClick={() => toggleExpand(i)}
                          className="px-2 py-1 text-sm bg-gray-800 border border-gray-700 text-white rounded hover:bg-gray-700"
                        >
                          {expandedIndex === i ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded details row */}
                    {expandedIndex === i && (
                      <tr className="bg-gray-800">
                        <td colSpan={11} className="p-3 border border-gray-700 text-sm text-gray-200">
                          <div className="mb-2 font-semibold text-white">Full details</div>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {Object.entries(r).map(([k, v]) => (
                              <div key={k} className="flex gap-2">
                                <div className="w-40 text-gray-300">{k}:</div>
                                <div className="text-gray-200 break-words">{String(v === null ? "null" : v)}</div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}