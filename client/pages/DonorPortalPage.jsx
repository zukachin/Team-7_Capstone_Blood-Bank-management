import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { gsap } from "gsap";
import { api } from "../lib/api";

const DonorPortalPage = () => {
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);
  const buttonRef = useRef(null);

  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");

  const handleNavigation = (path) => {
    gsap.to(mainRef.current, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => navigate(path),
    });
  };

  const handleBackToHome = () => {
    gsap.to(mainRef.current, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => navigate("/"),
    });
  };

  useEffect(() => {
    // Animations
    const tl = gsap.timeline();
    tl.fromTo(mainRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 });
    tl.fromTo(
      titleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "back.out(1.7)" },
      "-=0.4"
    );
    tl.fromTo(
      cardsRef.current,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
      },
      "-=0.3"
    );
    tl.fromTo(
      buttonRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5 },
      "-=0.2"
    );

    // Hover animations
    cardsRef.current.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, { y: -8, duration: 0.3, ease: "power1.out" });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, { y: 0, duration: 0.3, ease: "power1.out" });
      });
    });

    // Fetch profile and appointments
    api.getProfile()
      .then((data) => {
        setProfile(data);

        // Optional: if backend provides role info
        // if (!data.is_donor) {
        //   navigate("/register-donor");
        // }
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        setError(err.message || "Failed to load profile");
      })
      .finally(() => setLoadingProfile(false));

    api.getMyAppointments()
      .then((data) => {
        if (Array.isArray(data)) {
          setAppointments(data);
        } else {
          setAppointments([]); // fallback
        }
      })
      .catch((err) => {
        console.error("Failed to fetch appointments:", err);
        setAppointments([]); // fallback to empty array
      });

    return () => {
      cardsRef.current.forEach((card) => {
        if (card) {
          card.removeEventListener("mouseenter", () => {});
          card.removeEventListener("mouseleave", () => {});
        }
      });
    };
  }, []);

  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await api.deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white" ref={mainRef}>
      {/* Header & Nav */}
      <header className="w-full bg-black border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-2">
              <svg width="10" height="58" viewBox="0 0 10 58" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-2">
                <path d="M0 14.5L10 0V43L0 57.5V14.5Z" fill="#FF0000" />
              </svg>
              <Link to="/" className="text-blood-primary font-bold text-2xl">LIFE LINK</Link>
            </div>

  
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-6">
        <h1 ref={titleRef} className="text-5xl font-bold mb-10 text-center">DONOR PORTAL</h1>

        {/* Profile */}
        <div className="bg-neutral-900 p-6 rounded-xl shadow-md w-full max-w-md text-left mb-12">
          <h2 className="text-xl font-bold mb-4 text-red-500">My Profile</h2>
          {loadingProfile && <p className="text-gray-400">Loading profile...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {profile && (
            <div className="space-y-2 text-gray-200">
              <p><b>Name:</b> {profile.name}</p>
              <p><b>Email:</b> {profile.email}</p>
              <p><b>Phone:</b> {profile.phone}</p>
              <p><b>Gender:</b> {profile.gender}</p>
              <p><b>Blood Group:</b> {profile.blood_group || "N/A"}</p>
              <p><b>Address:</b> {profile.address}</p>
            </div>
          )}
        </div>

        {/* Appointments */}
        <div className="p-6 bg-black text-white w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-6">My Appointments</h2>
          {!Array.isArray(appointments) || appointments.length === 0 ? (
            <p>No appointments booked yet.</p>
          ) : (
            <ul className="space-y-4">
              {appointments.map((a) => (
                <li key={a.id} className="p-4 bg-gray-800 rounded-lg flex justify-between">
                  <div>
                    <p><b>Centre:</b> {a.centre_name}</p>
                    <p><b>Date:</b> {a.date}</p>
                    <p><b>Status:</b> {a.status}</p>
                  </div>
                  <button onClick={() => cancelAppointment(a.id)} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">Cancel</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          ref={buttonRef}
          onClick={handleBackToHome}
          className="mt-10 text-white hover:text-red-400 transition-colors text-lg font-medium"
        >
          Back to home
        </button>
      </div>
    </div>
  );
};

export default DonorPortalPage;
