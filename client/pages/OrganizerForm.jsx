import React from "react";

const API_BASE = import.meta.env.VITE_API_BASE_ADMIN || "http://localhost:4001";

export default function OrganizerForm({ onRegistered }) {
  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to be logged in.");
      return;
    }

    const body = {
      organization_name: form.get("organization_name"),
      contact_person: form.get("contact_person"),
      phone: form.get("phone"),
      email: form.get("email"),
      address: form.get("address"),
    };

    try {
      const res = await fetch(`${API_BASE}/api/camps/organizers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to register organizer");
      }

      const data = await res.json();
      alert("Organizer registered successfully!");
      onRegistered(data);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900 p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold text-red-500">Register as Organizer</h2>
      <input name="organization_name" placeholder="Organization Name" required className="w-full p-2 rounded bg-gray-800" />
      <input name="contact_person" placeholder="Contact Person" required className="w-full p-2 rounded bg-gray-800" />
      <input name="phone" placeholder="Phone" required className="w-full p-2 rounded bg-gray-800" />
      <input name="email" type="email" placeholder="Email" required className="w-full p-2 rounded bg-gray-800" />
      <input name="address" placeholder="Address" required className="w-full p-2 rounded bg-gray-800" />
      <button type="submit" className="bg-red-600 px-4 py-2 rounded">Register</button>
    </form>
  );
}
