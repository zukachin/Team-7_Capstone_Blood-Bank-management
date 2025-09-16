// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { api } from "../lib/api";

// const RegisterDonor = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     state_id: "",
//     district_id: "",
//     centre_id: "",
//     appointment_date: "",
//     appointment_time: "",
//     weight: "",
//     under_medication: "No",
//     last_donation_date: "",
//   });

//   const [stateName, setStateName] = useState("");
//   const [districtName, setDistrictName] = useState("");
//   const [centres, setCentres] = useState([]);

//   // ✅ Prefill with profile on load
//   useEffect(() => {
//     if (!api.getToken()) {
//       navigate("/login", { replace: true });
//       return;
//     }

//     api.getProfile()
//       .then((profile) => {
//         console.log("Fetched profile:", profile);

//         setFormData((prev) => ({
//           ...prev,
//           name: profile.name || "",
//           email: profile.email || "",
//           phone: profile.phone || "",
//           state_id: profile.state_id || "",
//           district_id: profile.district_id || "",
//         }));

//         // ✅ Use backend-provided names directly
//         setStateName(profile.state_name || "");
//         setDistrictName(profile.district_name || "");

//         // ✅ Load centres for this district
//         if (profile.district_id) {
//           api.getCentresByDistrict(profile.district_id)
//             .then((res) => {
//               console.log("Fetched centres:", res);
//               setCentres(res.centres || []);
//             })
//             .catch((err) => {
//               console.error("Error fetching centres:", err);
//               setCentres([]);
//             });
//         }
//       })
//       .catch((err) => {
//         console.error("Failed to load profile:", err);
//       });
//   }, [navigate]);

//   // ✅ Handle input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // ✅ Handle form submit
//   const handleSubmit = async () => {
//     if (!formData.appointment_date || !formData.appointment_time) {
//       toast.warning("Please select date and time for appointment.");
//       return;
//     }

//     const payload = {
//       district_id: Number(formData.district_id),
//       centre_id: Number(formData.centre_id),
//       appointment_date: formData.appointment_date,
//       appointment_time: formData.appointment_time,
//       weight: Number(formData.weight),
//       under_medication: formData.under_medication,
//       last_donation_date: formData.last_donation_date || null,
//     };

//     try {
//       await api.createAppointment(payload);
//       toast.success("Appointment booked successfully!");
//       navigate("/donor-portal");
//     } catch (err) {
//       console.error("Appointment booking failed:", err);
//       toast.error("Failed to book appointment.");
//     }
//   };


//   return (
//     <div className="min-h-screen bg-black text-white flex justify-center items-start px-4 py-8">
//       <div className="w-full max-w-4xl bg-neutral-900 p-10 rounded-2xl shadow-lg">
//         <h1 className="text-3xl font-bold mb-8 text-center">Book Appointment</h1>

//         <div className="grid md:grid-cols-2 gap-8">
//           <div className="space-y-6 text-white">
//             <ReadOnlyField label="Full Name" value={formData.name} />
//             <ReadOnlyField label="Email" value={formData.email} />
//             <ReadOnlyField label="Phone" value={formData.phone} />
//             <ReadOnlyField label="State" value={stateName} />
//             <ReadOnlyField label="District" value={districtName} />

//             <SelectField
//               label="Centre"
//               name="centre_id"
//               value={formData.centre_id}
//               onChange={handleInputChange}
//               options={centres.map((c) => ({ value: c.id, label: c.name }))}
//             />
//           </div>

//           <div className="space-y-6">
//             <InputField
//               label="Appointment Date"
//               name="appointment_date"
//               type="date"
//               value={formData.appointment_date}
//               onChange={handleInputChange}
//             />
//             <InputField
//               label="Appointment Time"
//               name="appointment_time"
//               type="time"
//               value={formData.appointment_time}
//               onChange={handleInputChange}
//             />
//             <InputField
//               label="Weight (kg)"
//               name="weight"
//               type="number"
//               value={formData.weight}
//               onChange={handleInputChange}
//             />
//             <SelectField
//               label="Under Medication"
//               name="under_medication"
//               value={formData.under_medication}
//               onChange={handleInputChange}
//               options={[{ value: "No", label: "No" }, { value: "Yes", label: "Yes" }]}
//             />
//             <InputField
//               label="Last Donation Date"
//               name="last_donation_date"
//               type="date"
//               value={formData.last_donation_date}
//               onChange={handleInputChange}
//             />
//           </div>
//         </div>

//         <div className="mt-8 flex flex-col md:flex-row gap-4">
//           <button
//             type="button"
//             onClick={handleSubmit}
//             className="w-full md:w-1/2 py-3 px-6 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white"
//           >
//             Book Appointment
//           </button>
//           <button
//             type="button"
//             className="w-full md:w-1/2 border border-gray-600 hover:border-red-500 text-white py-3 px-6 rounded-lg"
//             onClick={() => navigate("/")}
//           >
//             Back to Home
//           </button>
//         </div>

//         <ToastContainer position="top-right" autoClose={3000} />
//       </div>
//     </div>
//   );
// };

// const InputField = ({ label, name, type = "text", value, onChange }) => (
//   <div className="flex flex-col">
//     <label htmlFor={name} className="mb-1 font-medium text-sm">{label}</label>
//     <input
//       type={type}
//       id={name}
//       name={name}
//       value={value}
//       onChange={onChange}
//       className="p-2 rounded bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
//     />
//   </div>
// );

// const SelectField = ({ label, name, value, onChange, options }) => (
//   <div className="flex flex-col">
//     <label htmlFor={name} className="mb-1 font-medium text-sm">{label}</label>
//     <select
//       id={name}
//       name={name}
//       value={value}
//       onChange={onChange}
//       className="p-2 rounded bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
//     >
//       <option value="">-- Select {label} --</option>
//       {options.map((opt) => (
//         <option key={opt.value} value={opt.value}>{opt.label}</option>
//       ))}
//     </select>
//   </div>
// );

// const ReadOnlyField = ({ label, value }) => (
//   <div className="flex flex-col">
//     <label className="mb-1 font-medium text-sm">{label}</label>
//     <input
//       type="text"
//       value={value}
//       readOnly
//       className="p-2 rounded bg-neutral-800 border border-neutral-700 text-gray-400"
//     />
//   </div>
// );

// export default RegisterDonor;






import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "../lib/api";

const RegisterDonor = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    state_id: "",
    district_id: "",
    centre_id: "",
    appointment_date: "",
    appointment_time: "",
    weight: "",
    under_medication: "No",
    last_donation_date: "",
  });

  const [stateName, setStateName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [centres, setCentres] = useState([]);

  // Load profile and prefill
  useEffect(() => {
    if (!api.getToken()) {
      navigate("/login", { replace: true });
      return;
    }

    api.getProfile()
      .then((profile) => {
        setFormData((prev) => ({
          ...prev,
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          state_id: profile.state_id || "",
          district_id: profile.district_id || "",
        }));

        setStateName(profile.state_name || "");
        setDistrictName(profile.district_name || "");

        if (profile.district_id) {
          api.getCentresByDistrict(profile.district_id)
            .then((res) => setCentres(res.centres || []))
            .catch((err) => {
              console.error("Error fetching centres:", err);
              setCentres([]);
            });
        }
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
      });


  }, [navigate]);

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "centre_id") {
      const selectedCentre = centres.find((c) => c.centre_id === Number(value));
      console.log("Selected Centre:", selectedCentre?.centre_name || "Not found");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  console.log("Available Centres:", centres);

  const handleSubmit = async () => {
    if (!formData.appointment_date || !formData.appointment_time) {
      toast.warning("Please select date and time for appointment.");
      return;
    }

    const payload = {
      district_id: Number(formData.district_id),
      centre_id: Number(formData.centre_id),
      appointment_date: formData.appointment_date,
      appointment_time: formData.appointment_time,
      weight: Number(formData.weight),
      under_medication: formData.under_medication,
      last_donation_date: formData.last_donation_date || null,
    };

    try {
      await api.createAppointment(payload);
      toast.success("Appointment booked successfully!");
      navigate("/donor-portal");
    } catch (err) {
      console.error("Appointment booking failed:", err);
      toast.error("Failed to book appointment.");
    }


  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-start px-4 py-8">
      <div className="w-full max-w-4xl bg-neutral-900 p-10 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-center">Book Appointment</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ReadOnlyField label="Full Name" value={formData.name} />
            <ReadOnlyField label="Email" value={formData.email} />
            <ReadOnlyField label="Phone" value={formData.phone} />
            <ReadOnlyField label="State" value={stateName} />
            <ReadOnlyField label="District" value={districtName} />

            <SelectField
              label="Centre"
              name="centre_id"
              value={formData.centre_id}
              onChange={handleInputChange}
              options={centres.map((c) => ({ value: c.centre_id, label: c.centre_name }))}
            />
          </div>

          <div className="space-y-6">
            <InputField
              label="Appointment Date"
              name="appointment_date"
              type="date"
              value={formData.appointment_date}
              onChange={handleInputChange}
            />
            <InputField
              label="Appointment Time"
              name="appointment_time"
              type="time"
              value={formData.appointment_time}
              onChange={handleInputChange}
            />
            <InputField
              label="Weight (kg)"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleInputChange}
            />
            <SelectField
              label="Under Medication"
              name="under_medication"
              value={formData.under_medication}
              onChange={handleInputChange}
              options={[{ value: "No", label: "No" }, { value: "Yes", label: "Yes" }]}
            />
            <InputField
              label="Last Donation Date"
              name="last_donation_date"
              type="date"
              value={formData.last_donation_date}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full md:w-1/2 py-3 px-6 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white"
          >
            Book Appointment
          </button>
          <button
            type="button"
            className="w-full md:w-1/2 border border-gray-600 hover:border-red-500 text-white py-3 px-6 rounded-lg"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>


  );
};

const InputField = ({ label, name, type = "text", value, onChange }) => (

  <div className="flex flex-col"> <label htmlFor={name} className="mb-1 font-medium text-sm"> {label} </label> <input type={type} id={name} name={name} value={value} onChange={onChange} className="p-2 rounded bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-600 text-white" /> </div>);

const SelectField = ({ label, name, value, onChange, options }) => (

  <div className="flex flex-col"> <label htmlFor={name} className="mb-1 font-medium text-sm"> {label} </label> <select id={name} name={name} value={value} onChange={onChange} className="p-2 rounded bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-600 text-white" > <option value="">-- Select {label} --</option> {options.map((opt) => (<option key={opt.value} value={opt.value}> {opt.label} </option>))} </select> </div>);

const ReadOnlyField = ({ label, value }) => (

  <div className="flex flex-col"> <label className="mb-1 font-medium text-sm">{label}</label> <input type="text" value={value} readOnly className="p-2 rounded bg-neutral-800 border border-neutral-700 text-gray-400" /> </div>);

export default RegisterDonor;
