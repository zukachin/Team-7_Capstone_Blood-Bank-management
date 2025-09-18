import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const allowedStatusActions = ["Pending", "Approved", "Rejected"];

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await api.getAdminAppointments("All");
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      setUpdatingId(id);

      let response;
      if (status === "Approved") {
        response = await api.updateAppointmentStatus(id, { action: "approve" });
      } else if (status === "Rejected") {
        const reason = prompt("Please enter a rejection reason (optional):", "");
        response = await api.updateAppointmentStatus(id, { action: "reject", rejection_reason: reason || null });
      } else {
        console.warn("Unsupported status change:", status);
        return;
      }

      setAppointments((prev) =>
        prev.map((a) =>
          a.appointment_id === id
            ? {
                ...a,
                status,
                token_no: status === "Approved" ? response?.token_no || a.token_no : null,
                rejection_reason: status === "Rejected" ? response?.rejection_reason || null : null,
                approved_at: status === "Approved" ? new Date().toISOString() : null,
                approved_by: status === "Approved" ? "You" : null,
                updated_at: new Date().toISOString(),
              }
            : a
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await api.deleteAppointment(id);
      fetchAppointments();
    } catch (err) {
      console.error("Error deleting appointment:", err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-red-600 mb-6">Appointment Schedules</h1>

      {appointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((a) => (
            <div key={a.appointment_id} className="bg-gradient-to-br from-gray-900 to-black text-white p-4 rounded-2xl shadow hover:shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-lg">Appointment #{a.appointment_id}</h2>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    a.status === "Approved"
                      ? "bg-green-600"
                      : a.status === "Rejected"
                      ? "bg-red-600"
                      : "bg-yellow-600"
                  }`}
                >
                  {a.status}
                </span>
              </div>

              <p><strong>User:</strong> {a.user_id}</p>
              <p><strong>Center:</strong> {a.centre_id} ({a.district_id})</p>
              <p><strong>Date & Time:</strong> {a.appointment_date} | {a.appointment_time}</p>
              <p><strong>Weight:</strong> {a.weight} kg </p>
<p><strong>Medication:</strong> {a.under_medication === "Yes" ? "Yes" : "No"}</p>
              <p><strong>Last Donation:</strong> {a.last_donation_date || "-"}</p>

              <div className="mt-3 flex flex-col gap-2">
                <select
                  value={a.status}
                  disabled={
                    updatingId === a.appointment_id ||
                    a.status === "Approved" ||
                    a.status === "Rejected"
                  }
                  onChange={(e) => handleStatusChange(a.appointment_id, e.target.value)}
                  className="bg-gray-800 text-white rounded p-1 w-full"
                >
                  {allowedStatusActions.map((opt) => (
                    <option key={opt} value={opt}>
                      {updatingId === a.appointment_id && opt === a.status ? "Updating..." : opt}
                    </option>
                  ))}
                </select>

                <button
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                  onClick={() => handleDelete(a.appointment_id)}
                >
                  Delete
                </button>
              </div>

              <div className="mt-2 text-sm text-gray-400">
                <p><strong>Token No:</strong> {a.token_no || "-"}</p>
                <p><strong>Rejection Reason:</strong> {a.rejection_reason || "-"}</p>
                <p><strong>Created At:</strong> {formatDate(a.created_at)}</p>
                <p><strong>Updated At:</strong> {formatDate(a.updated_at)}</p>
                <p><strong>Approved By:</strong> {a.approved_by || "-"}</p>
                <p><strong>Approved At:</strong> {formatDate(a.approved_at)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No appointments available.</p>
      )}
    </div>
  );
}
