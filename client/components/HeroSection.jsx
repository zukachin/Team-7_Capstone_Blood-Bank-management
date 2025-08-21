import React from "react"
import { Button } from "./ui/button";

export function HeroSection() {
  return (
    <section className="relative bg-black min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Main Headline */}
            {/* <h1
              className="text-white text-4xl md:text-5xl lg:text-6xl font-normal leading-tight"
              style={{
                fontFamily:
                  "Lustria, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Connecting Donors, Hospitals & Patients – Instantly
            </h1> */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Connecting Donors, Hospitals
                <br />
                <span className="text-red-500">& Patients — Instantly</span>
              </h1>

            {/* Subtitle */}
            <p
              className="text-white text-base md:text-lg font-normal max-w-2xl"
              style={{
                fontFamily:
                  "Lustria, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Every drop counts. Our platform ensures that hospitals can find,
              request, and track blood in real time.
            </p>

            {/* CTA Button */}
            <Button
              className="bg-white text-black hover:bg-gray-100 rounded-sm px-8 py-3 text-base font-normal underline"
              style={{
                fontFamily:
                  "Love Ya Like A Sister, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Donate Blood
            </Button>

            {/* Statistics */}
            <div className="space-y-6 pt-8">
              {/* Donor Statistics */}
              <div className="flex items-center space-x-4 bg-black/95 rounded px-4 py-3">
                <span
                  className="text-white text-lg font-bold"
                  style={{
                    fontFamily:
                      "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                  }}
                >
                  12,300
                </span>
                <div
                  className="h-6 w-px"
                  style={{ backgroundColor: "#C21717" }}
                ></div>
                <span
                  className="text-white text-lg font-bold"
                  style={{
                    fontFamily:
                      "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                    WebkitTextStroke: "1px #C21717",
                  }}
                >
                  Donor Registered
                </span>
              </div>

              {/* Blood Units Statistics */}
              <div className="flex items-center space-x-4 bg-lifelink-darkgray rounded px-4 py-3">
                <span
                  className="text-white text-lg font-bold"
                  style={{
                    fontFamily:
                      "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                  }}
                >
                  12,300
                </span>
                <div
                  className="h-6 w-px"
                  style={{ backgroundColor: "#C21717" }}
                ></div>

                <span
                  className="text-white text-lg font-bold"
                  style={{
                    fontFamily:
                      "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                    WebkitTextStroke: "1px #C21717",
                  }}
                >
                  Blood Units Collected
                </span>
              </div>
            </div>

            {/* Portal Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
              {/* Donor Portal */}
              <div className="space-y-2">
                <h3
                  className="text-white text-lg font-bold"
                  style={{
                    fontFamily:
                      "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                  }}
                >
                  Donor Portal
                </h3>
                <p
                  className="text-red-600 text-sm font-bold"
                  style={{
                    fontFamily:
                      "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                  }}
                >
                  Register, book appointments, and manage your donations.
                </p>
              </div>

              {/* Inventory Portal */}
              <div className="space-y-2">
                <h3
                  className="text-white text-lg font-bold"
                  style={{
                    fontFamily:
                      "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                  }}
                >
                  Inventory Portal
                </h3>
                <p
                  className="text-red-600 text-sm font-bold"
                  style={{
                    fontFamily:
                      "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                  }}
                >
                  View and manage blood stock information. Enter Portal
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Medical Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/4ef6a46c6ac992bd8fcc6d9db0667b8c8e85d7b9?width=610"
                alt="Medical professional"
                className="w-full max-w-md h-auto opacity-75 mix-blend-hard-light"
              />
              {/* Red accent line */}
              <svg
                width="20"
                height="396"
                viewBox="0 0 20 396"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-2 top-0 h-full"
              >
                <path
                  d="M0 42.5L19.5 0V351L0 396V219.25V42.5Z"
                  fill="#D01D1D"
                />
              </svg>
              <p
                className="absolute bottom-4 right-4 text-white text-lg font-normal"
                style={{
                  fontFamily:
                    "Lustria, -apple-system, Roboto, Helvetica, sans-serif",
                  WebkitTextStroke: "1px #8A1717",
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
