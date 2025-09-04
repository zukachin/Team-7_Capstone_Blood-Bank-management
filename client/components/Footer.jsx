import React from "react"
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-black-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo and Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <svg
                width="10"
                height="58"
                viewBox="0 0 10 58"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-2"
              >
                <path d="M0 14.5L10 0V43L0 57.5V14.5Z" fill="#EF4444" />
              </svg>
              <span className="text-red-500 font-bold text-2xl font-sans">
                LIFE LINK
              </span>
            </div>
            <p className="text-gray-300 text-sm max-w-md leading-relaxed">
              Connecting donors with recipients to save lives through blood donation. 
              Every drop counts in making a difference in someone's life.
            </p>
            <div className="flex space-x-4 mt-4">
              <a 
                href="https://facebook.com/lifelink" 
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://twitter.com/lifelink" 
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a 
                href="https://instagram.com/lifelink" 
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/donate"
                  className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                >
                  Donate Blood
                </Link>
              </li>
              <li>
                <Link
                  to="/request"
                  className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                >
                  Request Blood
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/locations"
                  className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                >
                  Blood Banks
                </Link>
              </li>
              <li>
                <Link
                  to="/stories"
                  className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                >
                  Success Stories
                </Link>
              </li>
              <li>
                <Link
                  to="/faqs"
                  className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <div>
                  <p className="text-gray-300 text-sm">Emergency: <span className="font-medium text-red-400">1800-123-4567</span></p>
                  <p className="text-gray-300 text-sm">Support: <span className="font-medium">+91-98765-43210</span></p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <div>
                  <p className="text-gray-300 text-sm">support@lifelink.org</p>
                  <p className="text-gray-300 text-sm">info@lifelink.org</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-300 text-sm">123 Health Street<br />Medical District<br />Chennai, TN 600001</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Banner */}
        <div className="bg-red-600 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center space-x-4">
            <svg className="w-6 h-6 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-white font-medium text-center">
              🚨 <strong>24/7 Emergency Blood Service:</strong> Call 1800-123-4567 for urgent blood requirements
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-400">
              <Link to="/terms-conditions" className="hover:text-red-400 transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/privacy-policy" className="hover:text-red-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/cookie-policy" className="hover:text-red-400 transition-colors">
                Cookie Policy
              </Link>
              <Link to="/accessibility" className="hover:text-red-400 transition-colors">
                Accessibility
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              © 2025 Life Link Foundation. All rights reserved.
            </p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Life Link is a registered non-profit organization dedicated to connecting blood donors with recipients.
              <br />
              Reg. No: NGO/2023/001234 | Tax Exempt under 80G
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}