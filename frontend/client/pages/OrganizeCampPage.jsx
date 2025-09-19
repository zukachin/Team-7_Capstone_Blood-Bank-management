// OrganizeCampPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrganizerForm from "./OrganizerForm";
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
      <OrganizerForm
        onRegistered={(org) => {
          setOrganizer(org);
          navigate("/camp-registration");
        }}
      />
    ) : (
      <p>You are already registered as an organizer. <br /> Go to <a className="underline text-blue-400" href="/camp-registration">Camp Registration</a>.</p>
    )}
  </div>

  // <div className="p-6 bg-neutral-900 text-white rounded-lg max-w-xl mx-auto">
  //     {organizer ? (
  //       <p className="text-green-400 font-semibold text-center text-lg">
  //         You are already registered as an organizer.
  //       </p>
  //     ) : (
  //       <p className="text-yellow-400 font-semibold text-center text-lg">
  //         You are not registered as an organizer yet. Please register first.
  //       </p>
  //     )}
  //     {/* Additional organizer dashboard or registration link here */}
  //   </div>
  );
}
