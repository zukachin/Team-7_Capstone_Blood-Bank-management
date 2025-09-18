import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { ArrowLeft, User, MapPin, Calendar, Beaker } from "lucide-react";

export default function CollectionDetail() {
  const { collection_id } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCollection() {
      try {
        setLoading(true);
        const response = await api.getCollectionById(collection_id);
        setCollection(response.data || response);
      } catch (err) {
        console.error("Failed to load collection:", err);
        setError(err.message || "Failed to load collection details");
      } finally {
        setLoading(false);
      }
    }

    if (collection_id) {
      loadCollection();
    }
  }, [collection_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-300">Loading collection details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">Error: {error}</div>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">Collection not found</div>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">
            Collection #{collection.collection_id}
          </h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/admin/testing/${collection.collection_id}/edit`)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Beaker size={16} className="inline mr-2" />
            Blood Test
          </button>
          <button 
            onClick={() => navigate("/admin/collections")}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Collections
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donor Information */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User size={20} className="text-red-400" />
            Donor Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-sm">Name</label>
              <div className="text-white font-medium">{collection.donor_name}</div>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Email</label>
              <div className="text-white">{collection.donor_email}</div>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Mobile</label>
              <div className="text-white">{collection.donor_mobile}</div>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Blood Group</label>
              <div>
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                  {collection.donor_blood_grp}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Details */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-red-400" />
            Collection Details
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-sm">Collection ID</label>
              <div className="text-white font-medium">#{collection.collection_id}</div>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Centre ID</label>
              <div className="text-white">{collection.centre_id}</div>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Camp ID</label>
              <div className="text-white">{collection.camp_id || "—"}</div>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Bag Size</label>
              <div className="text-white">{collection.bag_size}</div>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Collected Amount</label>
              <div className="text-white">{collection.collected_amount} ml</div>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Lot Number</label>
              <div className="text-white">{collection.lot_number || "—"}</div>
            </div>
          </div>
        </div>

        {/* Status & Timeline */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-red-400" />
            Status & Timeline
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-sm">Collection Date</label>
              <div className="text-white">
                {new Date(collection.collection_date).toLocaleString()}
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Overall Status</label>
              <div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  collection.overall_status === 'Passed' ? 'bg-green-600 text-white' :
                  collection.overall_status === 'Failed' ? 'bg-red-600 text-white' :
                  'bg-yellow-600 text-white'
                }`}>
                  {collection.overall_status || "Pending"}
                </span>
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Test ID</label>
              <div className="text-white">{collection.test_id || "Not tested yet"}</div>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Tested At</label>
              <div className="text-white">
                {collection.tested_at 
                  ? new Date(collection.tested_at).toLocaleString()
                  : "Not tested yet"
                }
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Donor Reaction</label>
              <div className="text-white">{collection.donor_reaction || "None reported"}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>
          <div className="space-y-3">
            {!collection.test_id ? (
              <button 
                onClick={() => navigate(`/admin/testing/${collection.collection_id}/edit`)}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Beaker size={18} />
                Start Blood Testing
              </button>
            ) : (
              <button 
                onClick={() => navigate(`/admin/testing/${collection.collection_id}/edit`)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Beaker size={18} />
                View Test Results
              </button>
            )}
            <button 
              onClick={() => navigate(`/admin/donors/register?search=${collection.donor_id}`)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <User size={18} />
              View Donor Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}