// TestingEdit.jsx (FIXED VERSION)
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { ArrowLeft, Save, Beaker, AlertTriangle } from "lucide-react";

export default function TestingEdit() {
  const { collection_id } = useParams();
  const [collection, setCollection] = useState(null);
  const [testData, setTestData] = useState(null);
  const [form, setForm] = useState({
    blood_group_id: "",
    hiv: "",
    hbsag: "",
    hcv: "",
    syphilis: "",
    malaria: "",
    tested_at: ""
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const navigate = useNavigate();

  // Test result options
  const testResultOptions = [
    { value: "", label: "Select Result" },
    { value: "Passed", label: "Passed" },
    { value: "Reactive", label: "Reactive" },
    { value: "Failed", label: "Failed" },
    { value: "Pending", label: "Pending" }
  ];

  useEffect(() => {
    async function loadData() {
      if (!collection_id) {
        setDebugInfo("No collection_id provided in URL");
        setLoading(false);
        return;
      }

      setLoading(true);
      setDebugInfo(`Loading collection_id: ${collection_id}`);

      try {
        console.log("Attempting to load collection:", collection_id);

        // First get collection details
        const collectionRes = await api.getCollectionById(collection_id);
        console.log("Collection API response:", collectionRes);

        const collectionData = collectionRes.data || collectionRes;
        console.log("Collection data:", collectionData);

        if (!collectionData) {
          throw new Error("No collection data received from API");
        }

        // Handle different possible response structures
        let finalCollectionData = collectionData;
        if (Array.isArray(collectionData) && collectionData.length > 0) {
          finalCollectionData = collectionData[0];
        }

        if (!finalCollectionData.collection_id && !finalCollectionData.id) {
          throw new Error("Invalid collection data structure - missing ID");
        }

        setCollection(finalCollectionData);
        setDebugInfo(`Collection loaded: ${finalCollectionData.donor_name || 'Unknown donor'}`);

        // Pre-populate blood group if available
        if (finalCollectionData.donor_blood_grp) {
          // You might need to map blood group names to IDs here
          // For now, we'll leave it empty and let user fill it
          setForm(prev => ({
            ...prev,
            tested_at: new Date().toISOString().slice(0,16)
          }));
        }

        // Try to load existing test data by collection_id
        try {
          console.log("Checking for existing test data for collection:", collection_id);
          // First check if there's already a test for this collection
          const existingTestsRes = await api.listTesting(`collection_id=${collection_id}`);
          const existingTests = existingTestsRes.data || existingTestsRes;
          
          if (existingTests && existingTests.length > 0) {
            const testInfo = existingTests[0]; // Get the first test for this collection
            setTestData(testInfo);

            // Populate form with existing test data
            setForm({
              blood_group_id: testInfo.blood_group_id || "",
              hiv: testInfo.hiv || "",
              hbsag: testInfo.hbsag || "",
              hcv: testInfo.hcv || "",
              syphilis: testInfo.syphilis || "",
              malaria: testInfo.malaria || "",
              tested_at: testInfo.tested_at ? new Date(testInfo.tested_at).toISOString().slice(0,16) : new Date().toISOString().slice(0,16)
            });
            setDebugInfo(`Existing test loaded: Test ID ${testInfo.test_id}`);
          } else {
            // No existing test, set up for new test
            setForm(prev => ({
              ...prev,
              tested_at: new Date().toISOString().slice(0,16)
            }));
            setDebugInfo("Ready for new test entry");
          }
        } catch (testErr) {
          console.log("No existing test found, creating new test entry", testErr);
          setDebugInfo("No existing test found, ready for new test");
          // Set current time as default
          setForm(prev => ({
            ...prev,
            tested_at: new Date().toISOString().slice(0,16)
          }));
        }
      } catch (err) {
        console.error("Error loading data:", err);
        const msg = err?.body?.message || err.message || String(err);
        setDebugInfo(`Error loading collection: ${msg} (status ${err?.status || "N/A"})`);
        console.error("Full error object:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [collection_id]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setDebugInfo("Saving test results...");

    try {
      const payload = {
        blood_group_id: form.blood_group_id ? Number(form.blood_group_id) : null,
        hiv: form.hiv || null,
        hbsag: form.hbsag || null,
        hcv: form.hcv || null,
        syphilis: form.syphilis || null,
        malaria: form.malaria || null,
        tested_at: form.tested_at ? new Date(form.tested_at).toISOString() : null
      };

      console.log("Saving test data:", payload, "for collection:", collection_id);
      setDebugInfo(`Calling PATCH /api/testing/${collection_id}`);

      // This should create or update the test for this collection
      const result = await api.updateTesting(collection_id, payload);
      console.log("Save result:", result);

      setDebugInfo("Test results saved successfully");
      alert("Test results saved successfully");
      
      // Navigate back to testing list or collections
      navigate("/admin/testing");
    } catch (err) {
      console.error("Error saving test results:", err);
      const msg = err?.body?.message || err.message || String(err);
      setDebugInfo(`Save error: ${msg} (status ${err?.status || "N/A"})`);
      alert(`Failed to save test results: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-300 mb-4">Loading collection and test details...</div>
        <div className="text-sm text-gray-500">Debug: {debugInfo}</div>
        <div className="text-xs text-gray-400 mt-2">Collection ID: {collection_id}</div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-xl mb-4">Collection Not Found</div>
        <div className="text-sm text-red-400 mb-4">Debug: {debugInfo}</div>
        <div className="text-xs text-gray-500 mb-4">Collection ID: {collection_id}</div>
        <div className="text-xs text-gray-500 mb-4">
          API Endpoint: {import.meta.env.VITE_API_BASE_ADMIN || "http://localhost:4001"}/api/collections/{collection_id}
        </div>
        <div className="space-y-2">
          <button
            onClick={() => navigate("/admin/collections")}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 mr-2"
          >
            Back to Collections
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasReactiveResults = [form.hiv, form.hbsag, form.hcv, form.syphilis, form.malaria]
    .some(result => result === "Reactive" || result === "Failed");

  return (
    <div className="space-y-6">
      {/* Debug Info Panel */}
      <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
        <div className="text-blue-400 font-medium">Debug Info</div>
        <div className="text-blue-200 text-sm">{debugInfo}</div>
        <div className="text-xs text-gray-400 mt-2">Collection ID: {collection_id}</div>
        <div className="text-xs text-gray-400">API Base: {import.meta.env.VITE_API_BASE_ADMIN || "http://localhost:4001"}</div>
        <div className="text-xs text-gray-400">Test ID: {testData?.test_id || 'New Test'}</div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/collections")}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Beaker className="text-red-400" />
              {testData ? `Test #${testData.test_id}` : "New Blood Test"}
            </h1>
            <p className="text-gray-400">
              Collection #{collection.collection_id || collection.id} - {collection.donor_name || 'Unknown Donor'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/collections/${collection.collection_id || collection.id}`)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            View Collection
          </button>
        </div>
      </div>

      {/* Collection Info Card */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Collection Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Donor:</span>
            <div className="text-white font-medium">{collection.donor_name || 'Unknown'}</div>
          </div>
          <div>
            <span className="text-gray-400">Blood Group:</span>
            <div className="text-white">{collection.donor_blood_grp || 'Unknown'}</div>
          </div>
          <div>
            <span className="text-gray-400">Amount:</span>
            <div className="text-white">{collection.collected_amount || 0}ml</div>
          </div>
          <div>
            <span className="text-gray-400">Collection Date:</span>
            <div className="text-white">
              {collection.collection_date ? new Date(collection.collection_date).toLocaleDateString() : 'Unknown'}
            </div>
          </div>
          <div>
            <span className="text-gray-400">Donor Email:</span>
            <div className="text-white">{collection.donor_email || 'Unknown'}</div>
          </div>
          <div>
            <span className="text-gray-400">Donor Mobile:</span>
            <div className="text-white">{collection.donor_mobile || 'Unknown'}</div>
          </div>
          <div>
            <span className="text-gray-400">Centre ID:</span>
            <div className="text-white">{collection.centre_id || 'Unknown'}</div>
          </div>
          <div>
            <span className="text-gray-400">Bag Size:</span>
            <div className="text-white">{collection.bag_size || 'Unknown'}</div>
          </div>
        </div>
      </div>

      {/* Warning for reactive results */}
      {hasReactiveResults && (
        <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="text-yellow-400 mt-0.5" size={20} />
          <div>
            <div className="text-yellow-400 font-medium">Warning: Reactive Results Detected</div>
            <div className="text-yellow-200 text-sm">
              This blood sample has one or more reactive test results. Please verify all tests and follow safety protocols.
            </div>
          </div>
        </div>
      )}

      {/* Test Form */}
      <form onSubmit={handleSave} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-6">Test Results</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blood Group ID */}
          <div className="col-span-full md:col-span-1">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Blood Group ID
            </label>
            <input
              type="number"
              value={form.blood_group_id}
              onChange={e => setForm(prev => ({ ...prev, blood_group_id: e.target.value }))}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-red-500 focus:outline-none"
              placeholder="Enter blood group ID"
            />
          </div>

          {/* Test Date/Time */}
          <div className="col-span-full md:col-span-2">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Tested At
            </label>
            <input
              type="datetime-local"
              value={form.tested_at}
              onChange={e => setForm(prev => ({ ...prev, tested_at: e.target.value }))}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* HIV Test */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              HIV Test
            </label>
            <select
              value={form.hiv}
              onChange={e => setForm(prev => ({ ...prev, hiv: e.target.value }))}
              className={`w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-red-500 focus:outline-none ${
                form.hiv === "Reactive" || form.hiv === "Failed" ? "border-red-500 bg-red-900/20" : ""
              }`}
            >
              {testResultOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* HBSAG Test */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              HBSAG Test
            </label>
            <select
              value={form.hbsag}
              onChange={e => setForm(prev => ({ ...prev, hbsag: e.target.value }))}
              className={`w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-red-500 focus:outline-none ${
                form.hbsag === "Reactive" || form.hbsag === "Failed" ? "border-red-500 bg-red-900/20" : ""
              }`}
            >
              {testResultOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* HCV Test */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              HCV Test
            </label>
            <select
              value={form.hcv}
              onChange={e => setForm(prev => ({ ...prev, hcv: e.target.value }))}
              className={`w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-red-500 focus:outline-none ${
                form.hcv === "Reactive" || form.hcv === "Failed" ? "border-red-500 bg-red-900/20" : ""
              }`}
            >
              {testResultOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Syphilis Test */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Syphilis Test
            </label>
            <select
              value={form.syphilis}
              onChange={e => setForm(prev => ({ ...prev, syphilis: e.target.value }))}
              className={`w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-red-500 focus:outline-none ${
                form.syphilis === "Reactive" || form.syphilis === "Failed" ? "border-red-500 bg-red-900/20" : ""
              }`}
            >
              {testResultOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Malaria Test */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Malaria Test
            </label>
            <select
              value={form.malaria}
              onChange={e => setForm(prev => ({ ...prev, malaria: e.target.value }))}
              className={`w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-red-500 focus:outline-none ${
                form.malaria === "Reactive" || form.malaria === "Failed" ? "border-red-500 bg-red-900/20" : ""
              }`}
            >
              {testResultOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={() => navigate("/admin/collections")}
            className="px-6 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Test Results"}
          </button>
        </div>
      </form>
    </div>
  );
}