// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const DonationCamps = () => {
//   const [camps, setCamps] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchCamps = async () => {
//       try {
//         // replace with your backend API endpoint
//         // const response = await axios.get("http://localhost:5000/api/camps");
//         setCamps(response.data);
//       } catch (err) {
//         setError("Failed to load donation camps.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCamps();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-black text-white">
//         <p>Loading donation camps...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-black text-red-500">
//         <p>{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black text-white py-12 px-6">
//       <h1 className="text-4xl font-bold text-center mb-12">Upcoming Blood Donation Camps</h1>

//       {camps.length === 0 ? (
//         <p className="text-center text-gray-400">No upcoming camps available.</p>
//       ) : (
//         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {camps.map((camp) => (
//             <div
//               key={camp._id}
//               className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-red-500 transition-colors"
//             >
//               <h2 className="text-xl font-bold text-red-400 mb-3">{camp.name}</h2>
//               <p className="text-gray-300">📅 {camp.date}</p>
//               <p className="text-gray-300">🕒 {camp.time}</p>
//               <p className="text-gray-300">📍 {camp.location}</p>
//               <p className="text-gray-400 mt-2">Organized by: {camp.organizer}</p>
//               <button className="mt-4 w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold">
//                 Register for this Camp
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DonationCamps;

//option-2
// import React, { useEffect, useMemo, useState } from "react";

// // Resolve API base from environment or default
// const API_BASE =
//   import.meta.env.VITE_CAMPS_SERVICE_URL ||
//   import.meta.env.VITE_DONOR_SERVICE_URL ||
//   "";

// const endpoint = API_BASE ? `${API_BASE}/camps` : "/api/camps";

// export default function DonationCamps() {
//   const [camps, setCamps] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let ignore = false;
//     async function pull() {
//       try {
//         setLoading(true);
//         setError(null);
//         const res = await fetch(endpoint, { credentials: "include" });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = await res.json();
//         if (!ignore) setCamps(Array.isArray(data) ? data : data?.items ?? []);
//       } catch (e) {
//         if (!ignore) setError("Failed to load donation camps.");
//         console.error("DonationCamps fetch error:", e);
//       } finally {
//         if (!ignore) setLoading(false);
//       }
//     }
//     pull();
//     return () => { ignore = true; };
//   }, []);

//   const normalized = useMemo(
//     () =>
//       camps.map((c) => ({
//         id: c._id || c.id || c.campId || Math.random().toString(36).slice(2),
//         name: c.name || c.title || "Blood Donation Camp",
//         date: c.date || c.eventDate || c.startDate || "",
//         time: c.time || c.startTime || c.timing || "",
//         location: c.location || c.venue || c.address || "",
//         organizer: c.organizer || c.host || c.agency || "",
//       })),
//     [camps]
//   );

//   const sorted = useMemo(
//     () => [...normalized].sort((a, b) => new Date(a.date) - new Date(b.date)),
//     [normalized]
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-black text-white">
//         <p>Loading donation camps...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-black text-red-500">
//         <p>{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black text-white py-12 px-6">
//       <h1
//         className="text-4xl font-bold text-center mb-12"
//         style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}
//       >
//         Upcoming Blood Donation Camps
//       </h1>

//       {sorted.length === 0 ? (
//         <p className="text-center text-gray-400">No upcoming camps available.</p>
//       ) : (
//         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {sorted.map((camp) => (
//             <div
//               key={camp.id}
//               className="bg-neutral-900 rounded-xl shadow-lg p-6 border border-gray-800 hover:border-blood-accent transition-colors"
//             >
//               <h2 className="text-xl font-bold text-blood-primary mb-3">{camp.name}</h2>
//               <p className="text-gray-300">📅 {camp.date || "—"}</p>
//               {camp.time && <p className="text-gray-300">🕒 {camp.time}</p>}
//               {camp.location && <p className="text-gray-300">📍 {camp.location}</p>}
//               {camp.organizer && (
//                 <p className="text-gray-400 mt-2">Organized by: {camp.organizer}</p>
//               )}
//               <a
//                 href={`/register-donor?campId=${encodeURIComponent(camp.id)}`}
//                 className="mt-4 block text-center bg-blood-primary hover:bg-blood-secondary py-2 rounded-lg font-semibold transition-colors"
//               >
//                 Register for this Camp
//               </a>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


//option-3
import React, { useState } from "react"

// import { useState } from "react";

export default function DonationCamps() {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = () => {
    // Later replace with API call
    console.log("Searching camps for:", { state, district, date });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Title */}
      <h2
        className="text-3xl font-bold text-white-dark mb-6"
        style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}
      >
        Camp Schedule
      </h2>
      <hr className="mb-6 border-gray-300" />

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-md shadow">
        {/* Header */}
        <div className="bg-red-700 text-white font-bold px-6 py-3 rounded-t-md">
          Camp Schedules
        </div>

        {/* Form */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-900">
          {/* State */}
          <div className="relative">
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-500"
            >
              <option value="" disabled hidden>
                Select State
              </option>
              <option value="state1">State 1</option>
              <option value="state2">State 2</option>
            </select>
            {/* Dropdown arrow */}
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
              ▼
            </span>
          </div>

          {/* District */}
          <div className="relative">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-500"
            >
              <option value="" disabled hidden>
                Select District
              </option>
              <option value="district1">District 1</option>
              <option value="district2">District 2</option>
            </select>
            {/* Dropdown arrow */}
            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
              ▼
            </span>
          </div>

          {/* Date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-500"
          />

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-red-600 text-white font-bold rounded-md px-6 py-2 hover:bg-red-700 transition"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
