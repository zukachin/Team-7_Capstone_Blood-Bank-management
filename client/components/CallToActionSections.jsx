import React from "react"

export function CallToActionSections() {
  return (
    <section className="bg-black py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/50 mix-blend-lighten opacity-50"></div>

        {/* Background medical image */}
        <div className="absolute inset-0 flex justify-center items-center">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/b6bcc6c6e0003208dd2401ecdb3a0f8c4276e3f0?width=860"
            alt="Medical background"
            className="w-full max-w-2xl h-auto opacity-33 mix-blend-hard-light"
          />
        </div>

        {/* Content Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Be a Real-Life Superhero */}
          <div className="bg-black/30 rounded-md p-6 backdrop-blur-sm">
            <h3
              className="text-white text-3xl md:text-4xl font-bold leading-tight"
              style={{
                fontFamily:
                  "Lora, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Be a Real-Life Superhero
            </h3>
          </div>

          {/* Zero Cost, Infinite Impact */}
          <div className="bg-black/30 rounded-md p-6 backdrop-blur-sm">
            <h3
              className="text-white text-3xl md:text-4xl font-bold leading-tight text-center"
              style={{
                fontFamily:
                  "Lora, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Zero Cost, Infinite Impact
            </h3>
          </div>

          {/* It Takes only 1 hour */}
          <div className="bg-black/30 rounded-md p-6 backdrop-blur-sm">
            <h3
              className="text-white text-3xl md:text-4xl font-bold leading-tight text-center"
              style={{
                fontFamily:
                  "Lora, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              It Takes only 1 hour
            </h3>
          </div>
        </div>

        {/* Main CTA Section */}
        <div className="relative text-center space-y-8">
          {/* Blood drop icons */}
          <div className="flex justify-center space-x-12 mb-8">
            {/* Left blood drop */}
            <svg
              width="127"
              height="152"
              viewBox="0 0 127 152"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-32"
            >
              <path
                d="M0.5 39.7772C0.5 39.1074 0.835293 38.482 1.39318 38.1114L56.9842 1.17496C57.608 0.760481 58.4111 0.729268 59.0652 1.09408L125.474 38.1327C126.107 38.4859 126.5 39.1542 126.5 39.8794V149.5C126.5 150.605 125.605 151.5 124.5 151.5H2.5C1.39543 151.5 0.5 150.605 0.5 149.5V39.7772Z"
                fill="#A70D0D"
              />
            </svg>

            {/* Right blood drop */}
            <svg
              width="126"
              height="151"
              viewBox="0 0 126 151"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-32"
            >
              <path
                d="M0 39.2772C0 38.6074 0.335293 37.982 0.893178 37.6114L56.4842 0.67496C57.108 0.260481 57.9111 0.229268 58.5652 0.594081L124.974 37.6327C125.607 37.9859 126 38.6542 126 39.3794V149C126 150.105 125.105 151 124 151H2C0.89543 151 0 150.105 0 149V39.2772Z"
                fill="#8A1717"
              />
            </svg>
          </div>

          {/* Main CTA Text */}
          <h2
            className="text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl mx-auto"
            style={{
              fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif",
            }}
          >
            You have the power to save someone's tomorrow — start today.
          </h2>
        </div>
      </div>
    </section>
  );
}
