import React from "react"
import { Button } from "./ui/button";

export function HeroSection() {
  return (
    <section className="relative bg-black min-h-screen flex flex-col justify-center items-center py-8 md:py-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-center md:text-left">
              Connecting Donors, Hospitals
              <br />
              <span className="text-red-500">& Patients — Instantly</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-white text-base sm:text-lg font-normal max-w-xl mx-auto md:mx-0 text-center md:text-left"
              style={{ fontFamily: "Lustria, -apple-system, Roboto, Helvetica, sans-serif" }}
            >
              Every drop counts. Our platform ensures that hospitals can find,
              request, and track blood in real time.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center md:justify-start">
              <Button
                className="bg-white text-black hover:bg-gray-100 rounded-sm px-6 py-2 sm:px-8 sm:py-3 text-base font-normal underline"
                style={{ fontFamily: "Love Ya Like A Sister, -apple-system, Roboto, Helvetica, sans-serif" }}
              >
                Donate Blood
              </Button>
            </div>

            {/* Statistics */}
            <div className="space-y-4 pt-6">
              {/* Donor Statistics */}
              <div className="flex flex-col sm:flex-row items-center sm:space-x-4 bg-black/95 rounded px-4 py-3 text-center sm:text-left">
                <span
                  className="text-white text-lg font-bold"
                  style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}
                >
                  12,300
                </span>
                <div
                  className="h-6 w-px"
                  style={{ backgroundColor: "#C21717" }}
                ></div>
                <span
                  className="text-white text-lg font-bold"
                  style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif", WebkitTextStroke: "1px #C21717" }}
                >
                  Donor Registered
                </span>
              </div>

              {/* Blood Units Statistics */}
              <div className="flex flex-col sm:flex-row items-center sm:space-x-4 bg-lifelink-darkgray rounded px-4 py-3 text-center sm:text-left">
                <span
                  className="text-white text-lg font-bold"
                  style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}
                >
                  12,300
                </span>
                <div
                  className="h-6 w-px"
                  style={{ backgroundColor: "#C21717" }}
                ></div>
                <span
                  className="text-white text-lg font-bold"
                  style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif", WebkitTextStroke: "1px #C21717" }}
                >
                  Blood Units Collected
                </span>
              </div>
            </div>
            
            {/* Portal Links */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 pt-6">
              {/* Donor Portal */}
              <button
                className="w-full bg-black/70 hover:bg-red-700 transition-colors rounded-lg p-4 text-center md:text-left space-y-2"
              >
                <h3
                  className="text-white text-xl md:text-3xl font-bold"
                  style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}
                >
                  Donor Portal
                </h3>
                <p
                  className="text-red-400 text-sm font-bold"
                  style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}
                >
                  Register, book appointments, and manage your donations.
                </p>
              </button>

              {/* Inventory Portal */}
              <button
                className="w-full bg-black/70 hover:bg-red-700 transition-colors rounded-lg p-4 text-center md:text-left space-y-2"
              >
                <h3
                  className="text-white text-xl md:text-3xl font-bold"
                  style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}
                >
                  Inventory Portal
                </h3>
                <p
                  className="text-red-400 text-sm font-bold"
                  style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}
                >
                  View and manage blood stock information.
                </p>
              </button>
            </div>
          </div>

          {/* Right Side - Medical Image */} 
          <div className="flex justify-center md:justify-end -mt-32 md:-mt-100"> 
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md"> 
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/4ef6a46c6ac992bd8fcc6d9db0667b8c8e85d7b9?width=610" 
                alt="Medical professional" 
                className="w-full h-auto opacity-75 mix-blend-hard-light rounded-full animate-blooddrop" 
              />
              
              <p
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-white text-2xl sm:text-3xl"
                style={{
                  fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                  WebkitTextStroke: "1px #ffffff",
                }}
              >
                Together, we save lives
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}