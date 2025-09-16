// OrganizeCampPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrganizerForm from "./OrganizerForm";
import CampForm from "./CampForm";
import { api } from "../lib/api";

export default function OrganizeCampPage() {
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrganizer() {
      const storedUser = localStorage.getItem("user");
      const token = api.getToken();

      if (!storedUser || !token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const data = await api.getOrganizerProfile();
        setOrganizer(data);
      } catch (err) {
        if (err.status === 404) {
          // User is not an organizer yet
          setOrganizer(null);
        } else {
          setError(err.message);
        }
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
