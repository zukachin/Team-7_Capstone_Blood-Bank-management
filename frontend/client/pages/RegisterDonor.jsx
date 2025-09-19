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

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [centres, setCentres] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  // Load profile and states on mount
  useEffect(() => {
    if (!api.getToken()) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchInitialData = async () => {
      try {
        const [profile, statesData] = await Promise.all([
          api.getProfile(),
          api.getStates(),
        ]);

        setStates(statesData.states || []);

        setFormData((prev) => ({
          ...prev,
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          state_id: profile.state_id || "",
          district_id: profile.district_id || "",
        }));

        if (profile.state_id) {
          const districtsData = await api.getDistrictsByState(profile.state_id);
          setDistricts(districtsData.districts || []);
        }

        if (profile.district_id) {
          const centresData = await api.getCentresByDistrict(profile.district_id);
          setCentres(centresData.centres || []);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        toast.error("Failed to load profile data");
      }
    };

    fetchInitialData();
  }, [navigate]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }

    if (name === "state_id") {
      setFormData((prev) => ({
        ...prev,
        state_id: value,
        district_id: "",
        centre_id: "",
      }));
      
      if (value) {
        try {
          const res = await api.getDistrictsByState(value);
          setDistricts(res.districts || []);
        } catch (err) {
          console.error("Error fetching districts:", err);
          toast.error("Failed to load districts");
        }
      } else {
        setDistricts([]);
      }
      setCentres([]);
      return;
    }

    if (name === "district_id") {
      setFormData((prev) => ({
        ...prev,
        district_id: value,
        centre_id: "",
      }));
      
      if (value) {
        try {
          const res = await api.getCentresByDistrict(value);
          setCentres(res.centres || []);
        } catch (err) {
          console.error("Error fetching centres:", err);
          toast.error("Failed to load centres");
        }
      } else {
        setCentres([]);
      }
      return;
    }

    if (name === "centre_id") {
      const selectedCentre = centres.find((c) => c.centre_id === Number(value));
      console.log("Selected Centre:", selectedCentre?.centre_name || "Not found");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setValidationErrors({});

    const errors = {};
    
    if (!formData.appointment_date) {
      errors.appointment_date = "Appointment date is required";
    }
    
    if (!formData.appointment_time) {
      errors.appointment_time = "Appointment time is required";
    }
    
    if (!formData.weight) {
      errors.weight = "Weight is required";
    } else if (Number(formData.weight) < 45) {
      errors.weight = "Weight must be at least 45 kg for blood donation";
    } else if (Number(formData.weight) > 250) {
      errors.weight = "Weight must be between 30 and 250 kg";
    }
    
    if (!formData.centre_id) {
      errors.centre_id = "Please select a centre";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.warning("Please fix the validation errors");
      return;
    }

    const payload = {
      district_id: Number(formData.district_id),
      centre_id: Number(formData.centre_id),
      appointment_date: formData.appointment_date,
      appointment_time: formData.appointment_time,
      weight: Number(formData.weight),
      under_medication: formData.under_medication,
      last_donation_date: formData.last_donation_date.trim() === "" ? null : formData.last_donation_date,
    };

    try {
      await api.createAppointment(payload);

      // Cute success popup
      toast.success("🎉 Your donation slot is booked! Thank you ❤️", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });

      navigate("/donor-portal");
    } catch (err) {
      console.error("Appointment booking failed:", err);
      
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach(error => {
          backendErrors[error.path] = error.msg;
        });
        setValidationErrors(backendErrors);
        toast.error("Please fix the validation errors");
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to book appointment. Please try again.");
      }
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

            <SelectField
              label="State"
              name="state_id"
              value={formData.state_id}
              onChange={handleInputChange}
              options={states.map((s) => ({ value: s.id, label: s.name }))}
              error={validationErrors.state_id}
            />

            <SelectField
              label="District"
              name="district_id"
              value={formData.district_id}
              onChange={handleInputChange}
              options={districts.map((d) => ({ value: d.id, label: d.name }))}
              error={validationErrors.district_id}
              disabled={!formData.state_id}
            />

            <SelectField
              label="Centre"
              name="centre_id"
              value={formData.centre_id}
              onChange={handleInputChange}
              options={centres.map((c) => ({ value: c.centre_id, label: c.centre_name }))}
              error={validationErrors.centre_id}
              disabled={!formData.district_id}
            />
          </div>

          <div className="space-y-6">
            <InputField
              label="Appointment Date"
              name="appointment_date"
              type="date"
              value={formData.appointment_date}
              onChange={handleInputChange}
              error={validationErrors.appointment_date}
              min={new Date().toISOString().split('T')[0]}
            />
            <InputField
              label="Appointment Time"
              name="appointment_time"
              type="time"
              value={formData.appointment_time}
              onChange={handleInputChange}
              error={validationErrors.appointment_time}
            />
            <InputField
              label="Weight (kg)"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleInputChange}
              error={validationErrors.weight}
              min="30"
              max="250"
              placeholder="Enter your weight in kg"
            />
            <SelectField
              label="Under Medication"
              name="under_medication"
              value={formData.under_medication}
              onChange={handleInputChange}
              options={[
                { value: "No", label: "No" },
                { value: "Yes", label: "Yes" },
              ]}
              error={validationErrors.under_medication}
            />
            <InputField
              label="Last Donation Date (Optional)"
              name="last_donation_date"
              type="date"
              value={formData.last_donation_date}
              onChange={handleInputChange}
              error={validationErrors.last_donation_date}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full md:w-1/2 py-3 px-6 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Book Appointment
          </button>
          <button
            type="button"
            className="w-full md:w-1/2 border border-gray-600 hover:border-red-500 text-white py-3 px-6 rounded-lg transition-colors"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
};

// Input component
const InputField = ({ label, name, type = "text", value, onChange, error, ...props }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="mb-1 font-medium text-sm">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`p-2 rounded bg-neutral-800 border ${error ? 'border-red-500' : 'border-neutral-700'} focus:outline-none focus:ring-2 focus:ring-red-600 text-white`}
      {...props}
    />
    {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
  </div>
);

// Select component
const SelectField = ({ label, name, value, onChange, options, error, disabled = false }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="mb-1 font-medium text-sm">{label}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`p-2 rounded bg-neutral-800 border ${error ? 'border-red-500' : 'border-neutral-700'} focus:outline-none focus:ring-2 focus:ring-red-600 text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <option value="">-- Select {label} --</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
  </div>
);

// ReadOnly component
const ReadOnlyField = ({ label, value }) => (
  <div className="flex flex-col">
    <label className="mb-1 font-medium text-sm">{label}</label>
    <input type="text" value={value} readOnly className="p-2 rounded bg-neutral-800 border border-neutral-700 text-gray-400" />
  </div>
);

export default RegisterDonor;
