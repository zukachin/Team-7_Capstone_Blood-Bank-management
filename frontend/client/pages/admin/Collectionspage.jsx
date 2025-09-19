import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useNavigate } from "react-router-dom";

export default function CollectionsPage() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0, pages: 0 });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    donor_id: "", 
    centre_id: "", 
    bag_size: "450ml", 
    collected_amount: 450, 
    lot_number: "" 
  });
  const navigate = useNavigate();

  async function load(page = 1) {
    setLoading(true);
    try {
      const qs = `page=${page}&limit=${meta.limit}`;
      const res = await api.getCollections(qs);
      setData(res.data || []);
      setMeta(res.meta || { page, limit: 25, total: 0, pages: 0 });
    } catch (err) {
      console.error("load collections", err);
      alert(err.message || "Failed to load collections");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    load(1); 
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const payload = {
        donor_id: Number(form.donor_id),
        centre_id: Number(form.centre_id),
        bag_size: form.bag_size,
        collected_amount: Number(form.collected_amount),
        lot_number: form.lot_number || null
      };
      const res = await api.createCollection(payload);
      alert("Collection created successfully");
      setShowForm(false);
      setForm({ donor_id: "", centre_id: "", bag_size: "450ml", collected_amount: 450, lot_number: "" });
      load(1);
      
      // Navigate to the newly created collection if available
      if (res.collection?.collection_id) {
        navigate(`/admin/collections/${res.collection.collection_id}`);
      }
    } catch (err) {
      console.error("create collection", err);
      alert(err.message || "Failed to create collection");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Blood Collections</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowForm(true)} 
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            New Collection
          </button>
          <button 
            onClick={() => load(meta.page)} 
            className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-300">Loading collections...</div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-800 p-3 rounded-lg shadow-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-300 border-b border-gray-700">
                <th className="p-3">ID</th>
                <th className="p-3">Donor</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Blood Group</th>
                <th className="p-3">Bag Size</th>
                <th className="p-3">Amount (ml)</th>
                <th className="p-3">Lot Number</th>
                <th className="p-3">Collected At</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-gray-400">
                    No collections found
                  </td>
                </tr>
              ) : (
                data.map(row => (
                  <tr key={row.collection_id} className="border-t border-gray-700 hover:bg-gray-700/50">
                    <td className="p-3 text-white font-medium">{row.collection_id}</td>
                    <td className="p-3 text-white">{row.donor_name}</td>
                    <td className="p-3">
                      <div className="text-white">{row.donor_email}</div>
                      <div className="text-xs text-gray-400">{row.donor_mobile}</div>
                    </td>
                    <td className="p-3">
                      <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                        {row.donor_blood_grp}
                      </span>
                    </td>
                    <td className="p-3 text-white">{row.bag_size}</td>
                    <td className="p-3 text-white">{row.collected_amount}</td>
                    <td className="p-3 text-white">{row.lot_number || "—"}</td>
                    <td className="p-3 text-white">
                      {new Date(row.collection_date).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        row.overall_status === 'Passed' ? 'bg-green-600 text-white' :
                        row.overall_status === 'Failed' ? 'bg-red-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>
                        {row.overall_status || "Pending"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/admin/collections/${row.collection_id}`)} 
                          className="text-xs px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/testing/${row.collection_id}/edit`)} 
                          className="text-xs px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                        >
                          Test
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between text-sm text-gray-300">
            <div>
              Page {meta.page} of {meta.pages} — {meta.total} records
            </div>
            <div className="flex gap-2">
              <button 
                disabled={meta.page <= 1} 
                onClick={() => load(meta.page - 1)} 
                className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50 hover:bg-gray-600"
              >
                Previous
              </button>
              <button 
                disabled={meta.page >= meta.pages} 
                onClick={() => load(meta.page + 1)} 
                className="px-3 py-1 rounded bg-gray-700 disabled:opacity-50 hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Collection Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleCreate} 
            className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-md border border-gray-700 shadow-xl"
          >
            <h2 className="text-lg font-semibold mb-6 text-red-400">New Blood Collection</h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm text-gray-300">Donor ID *</label>
                <input 
                  type="number"
                  value={form.donor_id} 
                  onChange={e => setForm({...form, donor_id: e.target.value})} 
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-red-500 focus:outline-none" 
                  required 
                  placeholder="Enter donor ID"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">Centre ID *</label>
                <input 
                  type="number"
                  value={form.centre_id} 
                  onChange={e => setForm({...form, centre_id: e.target.value})} 
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-red-500 focus:outline-none" 
                  required 
                  placeholder="Enter centre ID"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">Bag Size</label>
                <select 
                  value={form.bag_size} 
                  onChange={e => setForm({...form, bag_size: e.target.value})} 
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-red-500 focus:outline-none"
                >
                  <option value="450ml">450ml</option>
                  <option value="350ml">350ml</option>
                  <option value="250ml">250ml</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">Collected Amount (ml) *</label>
                <input 
                  type="number" 
                  value={form.collected_amount} 
                  onChange={e => setForm({...form, collected_amount: e.target.value})} 
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-red-500 focus:outline-none" 
                  required
                  min="0"
                  max="500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">Lot Number</label>
                <input 
                  value={form.lot_number} 
                  onChange={e => setForm({...form, lot_number: e.target.value})} 
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-red-500 focus:outline-none" 
                  placeholder="Optional lot number"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Create Collection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}