import React, { useState } from "react";

export function HowDonationWorks() {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    {
      title: "Simple Registration Process",
      description: "Our short and user-friendly registration takes just a few minutes to complete. Provide basic information and answer a few health-related questions to get started.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      details: [
        "Complete our easy online form",
        "Provide basic contact information",
        "Answer preliminary health questions",
        "Schedule your appointment"
      ]
    },
    {
      title: "Health Screening",
      description: "Before donation, we conduct a simple checkup including temperature, blood pressure, pulse, and hemoglobin level to ensure you're ready to donate.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
        </svg>
      ),
      details: [
        "Temperature check",
        "Blood pressure measurement",
        "Hemoglobin level test",
        "Confidential interview"
      ]
    },
    {
      title: "Donate Your Blood",
      description: "The actual donation takes only 8-10 minutes. You'll be seated comfortably while a pint of blood is collected. After donation, you'll enjoy refreshments as you relax.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      details: [
        "Comfortable donation process (8-10 minutes)",
        "Sterile, single-use equipment",
        "Trained, professional staff",
        "Refreshments and recovery time"
      ]
    }
  ];

  const eligibilityCriteria = [
    { title: "Age", value: "17-75 years old", icon: "🎂" },
    { title: "Weight", value: "At least 110 lbs", icon: "⚖️" },
    { title: "Health", value: "Generally good health", icon: "💪" },
    { title: "Frequency", value: "Every 56 days", icon: "📅" }
  ];

  const impactStats = [
    { value: "1", label: "donation can save up to 3 lives" },
    { value: "36", label: "donations needed every minute in the US" },
    { value: "4.5M", label: "Americans would die yearly without donations" },
    { value: "65%", label: "of the population will need blood in their lifetime" }
  ];

  return (
    <section className="bg-black py-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-red-500 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            HOW BLOOD DONATION WORKS
          </h2>
          <p className="text-white-300 text-xl max-w-3xl mx-auto">
            Becoming a blood donor is simple, safe, and saves lives. Here's what to expect during your donation journey.
          </p>
        </div>

        {/* Steps with Tabs */}
        <div className="mb-16">
          <div className="flex justify-center mb-8 flex-wrap gap-4">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`px-6 py-3 rounded-full font-medium text-lg transition-all ${
                  activeStep === index
                    ? "bg-red-600 text-white shadow-lg"
                    : "bg-white-800 text-white-300 border border-white-700 hover:bg-white-700"
                }`}
              >
                Step {index + 1}
              </button>
            ))}
          </div>

          <div className="bg-white-900 rounded-2xl shadow-xl p-8 border border-white-800">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
                <div className="text-red-500 p-4 bg-white-800 rounded-2xl">
                  {steps[activeStep].icon}
                </div>
              </div>
              <div className="md:w-2/3 md:pl-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {steps[activeStep].title}
                </h3>
                <p className="text-white-300 mb-6 text-lg">
                  {steps[activeStep].description}
                </p>
                <ul className="space-y-2">
                  {steps[activeStep].details.map((detail, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-red-500 mr-2">✓</span>
                      <span className="text-white-300">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-red-500 mb-8">
            Are You Eligible to Donate?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {eligibilityCriteria.map((item, index) => (
              <div key={index} className="bg-white-900 p-6 rounded-xl border border-white-800 text-center">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h4 className="font-bold text-white text-lg mb-2">{item.title}</h4>
                <p className="text-white-300">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-full transition-colors">
              Check Full Eligibility Requirements
            </button>
          </div>
        </div>

        {/* Impact Statistics */}
        <div className="bg-white-900 text-white rounded-2xl p-8 mb-16 border border-white-800">
          <h3 className="text-3xl font-bold text-center mb-10 text-red-500">Your Donation Makes a Difference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat, index) => (
              <div key={index} className="text-center p-4">
                <div className="text-4xl font-bold mb-2 text-white">{stat.value}</div>
                <p className="text-white-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-red-500 mb-6">Ready to Make a Difference?</h3>
          <p className="text-white-300 text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of lifesavers in your community. Schedule your donation appointment today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-full transition-colors">
              Register as a Donor
            </button>
            <button className="bg-white-800 hover:bg-white-700 text-white border border-white-600 font-medium py-3 px-8 rounded-full transition-colors">
              Schedule an Appointment
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}