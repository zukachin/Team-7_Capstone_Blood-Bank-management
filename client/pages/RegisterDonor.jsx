import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { api } from "../lib/api";

const RegisterDonor = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    state_id: "",
    district_id: "",
    centre_id: "",
    gender: "",
    age: "",
    blood_group_id: "",
    date_of_birth: "",
    last_donation_date: "",
    medical_issues: "",
    weight: "",
    consent: false,
  });

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [centres, setCentres] = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);

  useEffect(() => {
api.getStates()
.then((res) => {
console.log("Fetched states:", res);
setStates(Array.isArray(res) ? res : res?.states || []);
})
.catch((err) => {
console.error("Error fetching states:", err);
setStates([]); // fallback to empty array
});

api.getBloodGroups()
.then((res) => {
console.log("Fetched blood groups:", res);
setBloodGroups(Array.isArray(res) ? res : res?.blood_groups || []);
})
.catch((err) => {
console.error("Error fetching blood groups:", err);
setBloodGroups([]); // fallback
});
}, []);

useEffect(() => {
if (formData.state_id) {
api.getDistrictsByState(formData.state_id)
.then((res) => {
console.log("Fetched districts:", res);
setDistricts(Array.isArray(res) ? res : res?.districts || []);
})
.catch((err) => {
console.error("Error fetching districts:", err);
setDistricts([]);
});
} else {
setDistricts([]);
}

// Reset dependent selections
setFormData((prev) => ({
...prev,
district_id: "",
centre_id: ""
}));
}, [formData.state_id]);

useEffect(() => {
if (formData.district_id) {
api.getCentresByDistrict(formData.district_id)
.then((res) => {
console.log("Fetched centres:", res);
setCentres(Array.isArray(res) ? res : res?.centres || []);
})
.catch((err) => {
console.error("Error fetching centres:", err);
setCentres([]);
});
} else {
setCentres([]);
}

setFormData((prev) => ({
...prev,
centre_id: ""
}));
}, [formData.district_id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.consent) {
      toast.warning("Please agree to the consent.");
      return;
    }

    const payload = {
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      age: Number(formData.age),
      weight: Number(formData.weight),
      address: formData.address,
      state_id: Number(formData.state_id),
      district_id: Number(formData.district_id),
      centre_id: Number(formData.centre_id),
      blood_group_id: Number(formData.blood_group_id),
      date_of_birth: formData.date_of_birth,
      last_donation_date: formData.last_donation_date,
      medical_issues: formData.medical_issues === "yes",
    };

    try {
      await api.createAppointment(payload);
      toast.success("Appointment booked successfully!");
      navigate("/donor-portal");
    } catch (err) {
      console.error(err);
      toast.error("Failed to book appointment.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-start px-4 py-8">
      <div className="w-full max-w-5xl bg-neutral-900 p-10 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-center">Register as Donor</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} />
            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
            <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
            <InputField label="Address" name="address" value={formData.address} onChange={handleInputChange} />
            <SelectField label="State" name="state_id" value={formData.state_id} onChange={handleInputChange} options={states.map(s => ({ value: s.id, label: s.name }))} />
            <SelectField label="District" name="district_id" value={formData.district_id} onChange={handleInputChange} options={districts.map(d => ({ value: d.id, label: d.name }))} />
            <SelectField label="Centre" name="centre_id" value={formData.centre_id} onChange={handleInputChange} options={centres.map(c => ({ value: c.id, label: c.name }))} />
            <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} />
          </div>

          <div className="space-y-6">
            <InputField label="Age" name="age" type="number" value={formData.age} onChange={handleInputChange} />
            <InputField label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleInputChange} />
            <InputField label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleInputChange} />
            <InputField label="Last Donation Date" name="last_donation_date" type="date" value={formData.last_donation_date} onChange={handleInputChange} />
            <SelectField label="Blood Group" name="blood_group_id" value={formData.blood_group_id} onChange={handleInputChange} options={bloodGroups.map(b => ({ value: b.id, label: b.group_name }))} />
            <SelectField label="Medical Issues" name="medical_issues" value={formData.medical_issues} onChange={handleInputChange} options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]} />
            {formData.medical_issues === "yes" && <div className="text-red-400 text-sm">⚠ Not eligible to donate blood now.</div>}
            <div className="flex items-center gap-3">
              <input type="checkbox" name="consent" checked={formData.consent} onChange={handleInputChange} className="accent-red-600 w-5 h-5" />
              <span>I agree to the consent & terms</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={formData.medical_issues === "yes"}
            className={`w-full md:w-1/2 py-3 px-6 rounded-lg font-bold transition-colors duration-200 ${formData.medical_issues === "yes" ? "bg-gray-600 cursor-not-allowed text-gray-300" : "bg-red-600 hover:bg-red-700 text-white"}`}
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
  <div className="flex flex-col">
    <label htmlFor={name} className="mb-1 font-medium text-sm">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="p-2 rounded bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="mb-1 font-medium text-sm">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="p-2 rounded bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
    >
      <option value="">-- Select {label} --</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default RegisterDonor;