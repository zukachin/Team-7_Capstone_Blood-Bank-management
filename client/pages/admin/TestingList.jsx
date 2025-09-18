import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { Search, RefreshCw } from "lucide-react";

export default function TestingList() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 25, pages: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  async function load(page = 1, search = "") {
    setLoading(true);
    try {
      let queryString = `page=${page}&limit=${meta.limit}`;
      if (search.trim()) {
        queryString += `&search=${encodeURIComponent(search.trim())}`;
      }
      
      const res = await api.listTesting(queryString);
      setData(res.data || []);
      setMeta(res.meta || { page, limit: 25, pages: 0, total: 0 });
    } catch (err) {
      console.error("load testing", err);
      alert(err.message || "Failed to load tests");
    } finally { 
      setLoading(false); 
    }
  }

  useEffect(() => { 
    load(1, searchTerm); 
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(1, searchTerm);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'passed': return 'bg-green-600 text-white';
      case 'failed': return 'bg-red-600 text-white';
      case 'reactive': return 'bg-orange-600 text-white';
      default: return 'bg-yellow-600 text-white';
    }
  };

  const getOverallStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'passed': return 'bg-green-600 text-white';
      case 'failed': return 'bg-red-600 text-white';
      default: return 'bg-yellow-600 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Blood Testing</h1>
        <button 
          onClick={() => load(meta.page, searchTerm)} 
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by donor name, collection ID, test ID..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                load(1, "");
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-300">Loading test results...</div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr className="text-left text-gray-300">
                  <th className="p-4">Test ID</th>
                  <th className="p-4">Collection</th>
                  <th className="p-4">Donor</th>
                  <th className="p-4">Blood Group</th>
                  <th className="p-4">HIV</th>
                  <th className="p-4">HBSAG</th>
                  <th className="p-4">HCV</th>
                  <th className="p-4">Syphilis</th>
                  <th className="p-4">Malaria</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Tested At</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-8 text-center text-gray-400">
                      {searchTerm ? "No tests found matching your search" : "No tests found"}
                    </td>
                  </tr>
                ) : (
                  data.map(r => (
                    <tr key={r.test_id} className="border-t border-gray-700 hover:bg-gray-700/30">
                      <td className="p-4 text-white font-medium">#{r.test_id}</td>
                      <td className="p-4 text-white">#{r.collection_id}</td>
                      <td className="p-4 text-white">{r.donor_name}</td>
                      <td className="p-4">
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                          {r.blood_group_id || "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(r.hiv)}`}>
                          {r.hiv || "Pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(r.hbsag)}`}>
                          {r.hbsag || "Pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(r.hcv)}`}>
                          {r.hcv || "Pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(r.syphilis)}`}>
                          {r.syphilis || "Pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(r.malaria)}`}>
                          {r.malaria || "Pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getOverallStatusColor(r.overall_status)}`}>
                          {r.overall_status || "Pending"}
                        </span>
                      </td>
                      <td className="p-4 text-white text-xs">
                        {r.tested_at ? new Date(r.tested_at).toLocaleString() : "—"}
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => navigate(`/admin/testing/${r.collection_id}/edit`)} 
                          className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700 transition-colors"
                        >
                          Edit Test
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-700/50 px-4 py-3 flex items-center justify-between text-sm text-gray-300">
            <div>
              Showing page {meta.page} of {meta.pages} — {meta.total} total records
            </div>
            <div className="flex gap-2">
              <button 
                disabled={meta.page <= 1} 
                onClick={() => load(meta.page - 1, searchTerm)} 
                className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50 hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-gray-300">
                {meta.page}
              </span>
              <button 
                disabled={meta.page >= meta.pages} 
                onClick={() => load(meta.page + 1, searchTerm)} 
                className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50 hover:bg-gray-600 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}