import React from "react"
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="w-full bg-black border-b border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            {/* Red arrow icon */}
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
            <Link
              to="/"
              className="text-blood-primary font-bold text-2xl"
              style={{
                fontFamily:
                  "Instrument Sans, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              LIFE LINK
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 bg-black rounded-full px-8 py-2">
            <Link
              to="/"
              className="text-blood-light font-normal text-base hover:text-white transition-colors"
              style={{
                fontFamily:
                  "Lora, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Home
            </Link>
            <Link
              to="/looking-for-blood"
              className="text-white font-normal text-base hover:text-blood-light transition-colors"
              style={{
                fontFamily:
                  "Lora, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Looking for Blood
            </Link>
            <Link
              to="/want-to-donate"
              className="text-white font-normal text-base hover:text-blood-light transition-colors"
              style={{
                fontFamily:
                  "Lora, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Want to donate Blood
            </Link>
            <Link
              to="/dashboard"
              className="text-white font-normal text-base hover:text-blood-light transition-colors"
              style={{
                fontFamily:
                  "Lora, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Blood Bank Dashboard
            </Link>
          </nav>

          {/* Sign Up Button */}
          <Button
              variant="outline"
              className="bg-black border-gray-600 hover:bg-gray-900 rounded-full px-6 py-2"
              style={{
                fontFamily: "Lora, -apple-system, Roboto, Helvetica, sans-serif",
                color: "#C21717",
              }}
            >
              SIGN UP
            </Button>


          {/* Mobile menu button */}
          <button className="lg:hidden text-white">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="lg:hidden pb-4">
          <div className="flex flex-col space-y-2">
            <Link
              to="/"
              className="text-blood-light font-normal text-base hover:text-white transition-colors py-2"
              style={{
                fontFamily:
                  "Lora, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Home
            </Link>
            <Link
              to="/looking-for-blood"
              className="text-white font-normal text-base hover:text-blood-light transition-colors py-2"
              style={{
                fontFamily:
                  "Lora, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Looking for Blood
            </Link>
            <Link
              to="/want-to-donate"
              className="text-white font-normal text-base hover:text-blood-light transition-colors py-2"
              style={{
                fontFamily:
                  "Lora, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Want to donate Blood
            </Link>
            <Link
              to="/dashboard"
              className="text-white font-normal text-base hover:text-blood-light transition-colors py-2"
              style={{
                fontFamily:
                  "Lora, -apple-system, Roboto, Helvetica, sans-serif",
              }}
            >
              Blood Bank Dashboard
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
