import React from "react"
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Logo and Branding */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <svg
                width="10"
                height="58"
                viewBox="0 0 10 58"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-2"
              >
                <path d="M0 14.5L10 0V43L0 57.5V14.5Z" fill="#FF0000" />
              </svg>
              <span
                className="text-blood-primary font-bold text-2xl"
                style={{
                  fontFamily:
                    "Instrument Sans, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                LIFE LINK
              </span>
            </div>
            {/* <p
              className="text-white text-xl font-bold"
              style={{
                fontFamily:
                  "Lora, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Copyright © 2025 Life Link
            </p> */}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3
              className="text-white text-2xl font-bold"
              style={{
                fontFamily:
                  "Lora, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Quick Links
            </h3>
            <div className="space-y-3">
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-red-400 transition-colors"
                    // style={{
                    //   fontFamily:
                    //     "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                    // }}
                  >
                    About Life Link
                  </Link>
                </li>
                <li>
                  <Link
                    to="/stories"
                    className="hover:text-red-400 transition-colors"
                    // style={{
                    //   fontFamily:
                    //     "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                    // }}
                  >
                    Stories + News
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faqs"
                    className="hover:text-red-400 transition-colors"
                    // style={{
                    //   fontFamily:
                    //     "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                    // }}
                  >
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Us */}
          <div className="space-y-4">
            <h3
              className="text-white text-2xl font-bold"
              style={{
                fontFamily:
                  "Lora, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Contact Us
            </h3>
            <div className="space-y-2 text-gray-400">
              <p
                className="flex items-center space-x-2"
                // style={{
                //   fontFamily:
                //     "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                // }}
              >
                📞 Emergency Helpline: +91-XXXX-XXXXXX
              </p>
              <p
                className="flex items-center space-x-2"
                // style={{
                //   fontFamily:
                //     "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                // }}
              >
                📧 Email us: lifelinkhelp@org
              </p>
            </div>
          </div>
        </div>
            {/* Action Buttons
            <div className="space-y-2 pt-4">
              <Link
                to="/donate"
                className="inline-block text-white text-sm font-bold hover:text-blood-light transition-colors mr-4"
                style={{
                  fontFamily:
                    "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                Donate Blood
              </Link>
              <Link
                to="/request"
                className="inline-block text-white text-base font-bold hover:text-blood-light transition-colors"
                style={{
                  fontFamily:
                    "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                Request Blood
              </Link>
            </div> */}

        {/* Social Media */}
        <div className="mb-8">
          <h3
            className="text-white text-2xl font-bold mb-4"
            style={{
              fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif",
            }}
          >
            Socials
          </h3>
          <div className="flex space-x-4">
            {/* Social media icons placeholder */}
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/6a6fb9f0b47056d5bcdc8d5d6261bb9cb65f16be?width=448"
              alt="Social Media Icons"
              className="h-12 object-contain"
            />
          </div>
        </div>

        {/* Bottom Border and Legal */}
        <div className="border-t border-blood-dark pt-6">
          <div className="border-t border-red-900/20 mt-8 pt-8 text-center text-gray-400">
            <p>Copyright © 2025 Life Link</p>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="h-0.5 bg-blood-dark w-80 mb-4 md:mb-0"></div>
            <p
              className="text-white text-base font-bold"
              style={{
                fontFamily:
                  "Lora, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Terms & Conditions | Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// 📞 Emergency Helpline: +91-XXXX-XXXXXX
