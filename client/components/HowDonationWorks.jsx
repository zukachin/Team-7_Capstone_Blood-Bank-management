import React from "react"

export function HowDonationWorks() {
  const steps = [
    {
      title: "Simple Registration Process",
      description: "short and user-friendly.",
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/3db06180b8672bd3acc22293628b614d54d481ce?width=238",
    },
    {
      title: "Health Screening",
      description: "Simple Checkup to ensure you're ready.",
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/74c13b829d8b58b28a5e0944f6c9cd9c9be0f2e6?width=290",
    },
    {
      title: "Donate Your Blood",
      description: "It's time to be a superhero",
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/6d36966ae857ef2743509e02e3ce3f640bc180cc?width=230",
    },
  ];

  return (
    <section className="bg-black py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2
            className="text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            style={{
              fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif",
            }}
          >
            HOW DONATION WORKS ?
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-lifelink-gray rounded-xl p-6 text-center"
            >
              {/* Step Image */}
              <div className="mb-6 flex justify-center">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-24 h-24 object-contain mix-blend-color-burn"
                />
              </div>

              {/* Step Title */}
              <h3
                className="text-blood-dark text-base font-normal mb-4"
                style={{
                  fontFamily:
                    "Lustria, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                {step.title}
              </h3>

              {/* Step Description */}
              <p
                className="text-black text-sm font-normal"
                style={{
                  fontFamily:
                    "Lustria, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Background Medical Image */}
        <div className="relative flex justify-center">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/26c88283d9556cfc6cd38163e8c243dea45cca47?width=512"
            alt="Medical professional"
            className="w-64 h-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
}
