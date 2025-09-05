// src/components/HeroSection.jsx
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);
  const statsRef = useRef(null);
  const portalsRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(headlineRef.current.children, 
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(subtitleRef.current, 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 }, "-=0.4"
    )
    .fromTo(buttonRef.current, 
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5 }, "-=0.3"
    )
    .fromTo(statsRef.current.children, 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.15, duration: 0.6 }, "-=0.2"
    )
    .fromTo(portalsRef.current.children, 
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.2, duration: 0.7 }, "-=0.3"
    )
    .fromTo(imageRef.current, 
      { scale: 0.8, opacity: 0, rotation: -5 },
      { scale: 1, opacity: 0.75, rotation: 0, duration: 1, ease: "elastic.out(1, 0.3)" }, "-=0.5"
    );

    // Floating animation for the image
    gsap.to(imageRef.current, {
      y: 20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-black min-h-screen flex flex-col justify-center items-center py-8 md:py-0 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            
            {/* Main Headline */}
            <h1 ref={headlineRef} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-center md:text-left">
              <div>Connecting Donors, Hospitals</div>
              <div>& Patients — <span className="text-red-500">Instantly</span></div>
            </h1>

            {/* Subtitle */}
            <p
              ref={subtitleRef}
              className="text-white text-base sm:text-lg font-normal max-w-xl mx-auto md:mx-0 text-center md:text-left"
              style={{ fontFamily: "Lustria, -apple-system, Roboto, Helvetica, sans-serif" }}
            >
              Every drop counts. Our platform ensures that hospitals can find,
              request, and track blood in real time.
            </p>

            {/* CTA Button */}
            <div ref={buttonRef} className="flex justify-center md:justify-start">
              <Button
                onClick={() => navigate("/register-donor")}
                className="bg-white text-black hover:bg-gray-100 rounded-sm px-6 py-2 sm:px-8 sm:py-3 text-base font-normal underline"
                style={{ fontFamily: "Love Ya Like A Sister, -apple-system, Roboto, Helvetica, sans-serif" }}
              >
                Donate Blood
              </Button>
            </div>

            {/* Statistics */}
            <div ref={statsRef} className="space-y-4 pt-6">
              
              <div className="flex flex-col sm:flex-row items-center sm:space-x-4 bg-black/95 rounded px-4 py-3 text-center sm:text-left">
                <span
                  className="text-white text-lg font-bold"
                  style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}
                >
                  12,300
                </span>
                <div className="h-6 w-px" style={{ backgroundColor: "#C21717" }}></div>
                <span
                  className="text-white text-lg font-bold"
                  style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif", WebkitTextStroke: "1px #C21717" }}
                >
                  Donor Registered
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:space-x-4 bg-lifelink-darkgray rounded px-4 py-3 text-center sm:text-left">
                <span
                  className="text-white text-lg font-bold"
                  style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}
                >
                  12,300
                </span>
                <div className="h-6 w-px" style={{ backgroundColor: "#C21717" }}></div>
                <span
                  className="text-white text-lg font-bold"
                  style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif", WebkitTextStroke: "1px #C21717" }}
                >
                  Blood Units Collected
                </span>
              </div>
            </div>
            
            {/* Portal Links */}
            <div ref={portalsRef} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 pt-6">
              
              {/* Donor Portal */}
              <button
                onClick={() => navigate("/donor-portal")}
                className="w-full bg-black/70 hover:bg-red-700 transition-colors rounded-lg p-4 text-center md:text-left space-y-2"
              >
                <h3 className="text-white text-xl md:text-3xl font-bold" style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}>
                  Donor Portal
                </h3>
                <p className="text-red-400 text-sm font-bold" style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}>
                  Register, book appointments, and manage your donations.
                </p>
              </button>

              {/* Inventory Portal */}
              <button
                onClick={() => navigate("/inventory-portal")}
                className="w-full bg-black/70 hover:bg-red-700 transition-colors rounded-lg p-4 text-center md:text-left space-y-2"
              >
                <h3 className="text-white text-xl md:text-3xl font-bold" style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}>
                  Inventory Portal
                </h3>
                <p className="text-red-400 text-sm font-bold" style={{ fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif" }}>
                  View and manage blood stock information.
                </p>
              </button>
            </div>
          </div>

          {/* Right Side - Medical Image */}
          <div className="flex justify-center md:justify-end -mt-32 md:-mt-100">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
              <img 
                ref={imageRef}
                src="https://api.builder.io/api/v1/image/assets/TEMP/4ef6a46c6ac992bd8fcc6d9db0667b8c8e85d7b9?width=610" 
                alt="Medical professional" 
                className="w-full h-auto opacity-75 mix-blend-hard-light rounded-full" 
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
