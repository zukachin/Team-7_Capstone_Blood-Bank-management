import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { gsap } from "gsap";
import { api } from "../lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const DonorPortalPage = () => {
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const titleRef = useRef(null);
  const buttonRef = useRef(null);
  const appointmentsRef = useRef([]);

  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");

  // Helper: normalize time string to "HH:mm:ss" (24h) or return null
  const normalizeTimeString = (timeStr) => {
    if (!timeStr) return null;
    const t = timeStr.trim().toLowerCase();

    // Match formats like "2:30 pm" or "02:30:00 am"
    const ampm = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)$/i);
    if (ampm) {
      let hh = parseInt(ampm[1], 10);
      const mm = parseInt(ampm[2], 10);
      const ss = ampm[3] ? parseInt(ampm[3], 10) : 0;
      const ap = ampm[4].toLowerCase();
      if (ap === "pm" && hh < 12) hh += 12;
      if (ap === "am" && hh === 12) hh = 0;
      return [hh, mm, ss].map((n) => String(n).padStart(2, "0")).join(":");
    }

    // Match 24-hour formats "HH:mm" or "HH:mm:ss"
    const match24 = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (match24) {
      const hh = parseInt(match24[1], 10);
      const mm = parseInt(match24[2], 10);
      const ss = match24[3] ? parseInt(match24[3], 10) : 0;
      return [hh, mm, ss].map((n) => String(n).padStart(2, "0")).join(":");
    }

    return null;
  };

  // Helper: build a local Date object from date string (YYYY-MM-DD or ISO) and time string
  const buildLocalDateFromParts = (dateStr, timeStr) => {
    if (!dateStr) return null;
    const dateOnly = dateStr.split("T")[0]; // if ISO is given, take date part
    const dateParts = dateOnly.split("-");
    if (dateParts.length < 3) {
      // fallback to Date parse
      const fallback = new Date(dateStr);
      return isNaN(fallback.getTime()) ? null : fallback;
    }
    const year = Number(dateParts[0]);
    const month = Number(dateParts[1]);
    const day = Number(dateParts[2]);

    const normTime = normalizeTimeString(timeStr);
    if (!normTime) {
      // no valid time — return local date at midnight
      return new Date(year, month - 1, day, 0, 0, 0);
    }

    const [hh, mm, ss] = normTime.split(":").map(Number);
    return new Date(year, month - 1, day, hh, mm, ss);
  };

  // Format nice display like: "12/10/2045, 09:30:00 AM" (browser locale)
  const formatDisplayDateTime = (dateObj) => {
    if (!dateObj || isNaN(dateObj.getTime())) return "N/A";
    // You can customize locale/options here; this will show date + time.
    const datePart = dateObj.toLocaleDateString();
    const timePart = dateObj.toLocaleTimeString();
    return `${datePart}, ${timePart}`;
  };

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
    // Page entry animations
    const tl = gsap.timeline();
    tl.fromTo(mainRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 });
    tl.fromTo(
      titleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "back.out(1.7)" },
      "-=0.4"
    );
    tl.fromTo(
      buttonRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5 },
      "-=0.2"
    );

    // Fetch profile
    api.getProfile()
      .then((data) => {
        setProfile(data);
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        setError(err.message || "Failed to load profile");
      })
      .finally(() => setLoadingProfile(false));

    // Fetch appointments and enrich them with Date object + display string
    api.getMyAppointments()
      .then((data) => {
        const list = (data && Array.isArray(data.appointments)) ? data.appointments : [];
        const enriched = list.map((a) => {
          const dt = buildLocalDateFromParts(a.appointment_date, a.appointment_time);
          return {
            ...a,
            appointment_datetime_obj: dt,
            appointment_display: dt ? formatDisplayDateTime(dt) : (a.appointment_date || "N/A"),
          };
        });

        // Reset refs for animation
        appointmentsRef.current = [];
        setAppointments(enriched);
      })
      .catch((err) => {
        console.error("Failed to fetch appointments:", err);
        setAppointments([]);
      });
  }, []);

  // Animate appointments on update
  useEffect(() => {
    if (appointmentsRef.current.length > 0) {
      gsap.fromTo(
        appointmentsRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
        }
      );
    }
  }, [appointments]);

  const cancelAppointment = async (id) => {
    try {
      await api.deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.appointment_id !== id));
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
    }
  };

  const generatePDF = (appointment, profile) => {
    const doc = new jsPDF();

    // Add header
    doc.setFillColor(255, 0, 0); // Blood red background
    doc.rect(0, 0, 210, 25, "F"); // Full width rectangle (A4 width in mm)

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Life Link Donation Center", 105, 17, { align: "center" });

    // Appointment letter title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Appointment Confirmation Letter", 105, 40, { align: "center" });

    // Greeting
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Dear ${profile?.name || "Donor"},`, 20, 55);

    doc.text(
      "Thank you for your commitment to save lives. Please find your appointment details below:",
      20,
      65,
      { maxWidth: 170 }
    );

    const dtObj = appointment.appointment_datetime_obj || buildLocalDateFromParts(appointment.appointment_date, appointment.appointment_time);
    const dateTimeForPdf = dtObj ? formatDisplayDateTime(dtObj) : (appointment.appointment_date || "N/A");

    // last donation safe string
    const lastDonation = appointment.last_donation_date ? new Date(appointment.last_donation_date).toLocaleDateString() : "N/A";

    // Table with appointment details
    autoTable(doc, {
      startY: 75,
      theme: "grid",
      headStyles: { fillColor: [255, 0, 0], textColor: 255, halign: "center" },
      head: [["Field", "Details"]],
      body: [
        ["Appointment ID", appointment.appointment_id],
        ["Centre", appointment.centre_name],
        ["Centre Code", appointment.centre_code],
        ["Date & Time", dateTimeForPdf],
        ["Status", appointment.status],
        ["Token Number", appointment.token_no],
        ["Weight", appointment.weight ?? "N/A"],
        ["Under Medication", appointment.under_medication ?? "N/A"],
        ["Last Donation Date", lastDonation],
      ],
      styles: { cellPadding: 4, fontSize: 11 },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold" },
        1: { cellWidth: 120 },
      },
    });

    // Footer / signature
    const finalY = doc.lastAutoTable?.finalY || 75 + 9 * 10;
    doc.text("Please arrive 15 minutes before your appointment time and bring a valid ID.", 20, finalY + 15, { maxWidth: 170 });

    doc.text("Thank you for your generosity!", 20, finalY + 25, { maxWidth: 170 });

    doc.setFont("helvetica", "italic");
    doc.text("Life Link Team", 20, finalY + 35);

    // Save PDF
    doc.save(`appointment_letter_${appointment.appointment_id}.pdf`);
  };

  // Add refs for animation on appointment cards
  const addAppointmentRef = (el, index) => {
    appointmentsRef.current[index] = el;
  };

  return (
    <div className="min-h-screen bg-black text-white" ref={mainRef}>
      {/* Header & Nav */}
      <header className="w-full bg-black border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-2">
              <svg
                width="10"
                height="58"
                viewBox="0 0 10 58"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-2"
              >
                <path d="M0 14.5L10 0V43L0 57.5V14.5Z" fill="#FF0000" />
              </svg>
              <Link to="/" className="text-blood-primary font-bold text-2xl">
                LIFE LINK
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-6">
        <h1 ref={titleRef} className="text-5xl font-bold mb-10 text-center">
          DONOR PORTAL
        </h1>

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
        {appointments.length === 0 ? (
          <p className="text-gray-400">No appointments booked yet.</p>
        ) : (
          <ul className="space-y-4 w-full max-w-3xl">
            {appointments.map((a, i) => (
              <li
                key={a.appointment_id}
                ref={(el) => addAppointmentRef(el, i)}
                className="p-4 bg-gray-800 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p><b>Centre:</b> {a.centre_name}</p>
                  <p><b>Date:</b> {a.appointment_display}</p>
                  <p><b>Status:</b> {a.status}</p>
                </div>
                <div className="flex space-x-2">
                  {a.status === "Approved" && (
                    <button
                      onClick={() => generatePDF(a, profile)}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm"
                    >
                      PDF
                    </button>
                  )}
                  <button
                    onClick={() => cancelAppointment(a.appointment_id)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm"
                    title="Cancel Appointment"
                  >
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

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
