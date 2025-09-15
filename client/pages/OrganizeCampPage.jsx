import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrganizerForm from "./OrganizerForm";
import CampForm from "./CampForm";
import { api } from "../lib/api";

const API_BASE = import.meta.env.VITE_API_BASE_ADMIN || "http://localhost:4001";

export default function OrganizeCampPage() {
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrganizer() {
      const storedUser = localStorage.getItem("user");
      const token = api.getToken();

      console.log("Stored User:", storedUser);
      console.log("Stored Token:", token);

      if (!storedUser || !token) {
        navigate("/login");
        return;
      }

      let user;
      try {
        user = JSON.parse(storedUser);
      } catch {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/camps/organizers/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 404) {
          // Not an organizer yet
          setOrganizer(null);
        } else if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch organizer");
        } else {
          const data = await res.json();
          setOrganizer(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizer();
  }, [navigate]);

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 text-white">
      {!organizer ? (
        <OrganizerForm onRegistered={(org) => setOrganizer(org)} />
      ) : (
        <CampForm organizerId={organizer.organizer_id || organizer.id} />
      )}
    </div>
  );
}
