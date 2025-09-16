import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await api.getAdminAppointments();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateAppointmentStatus(id, { status });
      fetchAppointments(); // refresh
    } catch (err) {
      console.error("Error updating status:", err);
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-red-600 mb-6">Appointment Schedules</h1>

      <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl shadow-xl p-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-900 text-gray-200">
              <th className="p-4 border">ID</th>
              <th className="p-4 border">User ID</th>
              <th className="p-4 border">State ID</th>
              <th className="p-4 border">District ID</th>
              <th className="p-4 border">Center ID</th>
              <th className="p-4 border">Date</th>
              <th className="p-4 border">Time</th>
              <th className="p-4 border">Weight</th>
              <th className="p-4 border">Medication</th>
              <th className="p-4 border">Last Donation</th>
              <th className="p-4 border">Status</th>
              <th className="p-4 border">Token No</th>
              <th className="p-4 border">Rejection Reason</th>
              <th className="p-4 border">Created At</th>
              <th className="p-4 border">Updated At</th>
              <th className="p-4 border">Approved By</th>
              <th className="p-4 border">Approved At</th>
              <th className="p-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((a) => (
                <tr key={a.appointment_id} className="hover:bg-gray-800">
                  <td className="p-4 border">{a.appointment_id}</td>
                  <td className="p-4 border">{a.user_id}</td>
                  <td className="p-4 border">{a.state_id}</td>
                  <td className="p-4 border">{a.district_id}</td>
                  <td className="p-4 border">{a.centre_id}</td>
                  <td className="p-4 border">{a.appointment_date}</td>
                  <td className="p-4 border">{a.appointment_time}</td>
                  <td className="p-4 border">{a.weight}</td>
                  <td className="p-4 border">{a.under_medication ? "Yes" : "No"}</td>
                  <td className="p-4 border">{a.last_donation_date || "-"}</td>
                  <td className="p-4 border">
                    <select
                      value={a.status}
                      onChange={(e) =>
                        handleStatusChange(a.appointment_id, e.target.value)
                      }
                      className="bg-gray-800 text-white rounded p-1 w-full"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 border">{a.token_no || "-"}</td>
                  <td className="p-4 border">{a.rejection_reason || "-"}</td>
                  <td className="p-4 border">{a.created_at}</td>
                  <td className="p-4 border">{a.updated_at}</td>
                  <td className="p-4 border">{a.approved_by || "-"}</td>
                  <td className="p-4 border">{a.approved_at || "-"}</td>
                  <td className="p-4 border">
                    <button
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded"
                      onClick={() => handleDelete(a.appointment_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="18" className="p-3 text-center text-gray-500">
                  No appointments available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
