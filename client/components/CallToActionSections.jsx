import React, { useState, useEffect } from "react";

export function CallToActionSections() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-black py-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-red-600"
            style={{
              width: Math.random() * 100 + 20 + 'px',
              height: Math.random() * 100 + 20 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `pulse ${Math.random() * 3 + 2}s infinite alternate`
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Be a Real-Life Superhero */}
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl p-8 border border-red-800/30 transform hover:-translate-y-2 transition-transform duration-300 group">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 group-hover:bg-red-900/40 transition-colors">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <h3 className="text-white text-2xl font-bold text-center mb-4 group-hover:text-red-400 transition-colors">
              Be a Real-Life Superhero
            </h3>
            <p className="text-gray-400 text-center">
              Your blood donation can save up to three lives. Become someone's hero today.
            </p>
          </div>

          {/* Zero Cost, Infinite Impact */}
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl p-8 border border-red-800/30 transform hover:-translate-y-2 transition-transform duration-300 group">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 group-hover:bg-red-900/40 transition-colors">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-white text-2xl font-bold text-center mb-4 group-hover:text-red-400 transition-colors">
              Zero Cost, Infinite Impact
            </h3>
            <p className="text-gray-400 text-center">
              Donating blood costs you nothing but an hour of your time, yet its impact lasts a lifetime.
            </p>
          </div>

          {/* It Takes only 1 hour */}
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl p-8 border border-red-800/30 transform hover:-translate-y-2 transition-transform duration-300 group">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 group-hover:bg-red-900/40 transition-colors">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-white text-2xl font-bold text-center mb-4 group-hover:text-red-400 transition-colors">
              It Takes only 1 hour
            </h3>
            <p className="text-gray-400 text-center">
              The entire process from registration to recovery takes less time than watching a movie.
            </p>
          </div>
        </div>

        {/* Main CTA Section */}
        <div className="text-center space-y-8 relative">
          {/* Animated blood drop */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className={`absolute inset-0 rounded-full bg-red-600 opacity-75 ${pulse ? 'animate-ping' : ''}`}></div>
              <svg
                className="h-32 w-32 text-red-600 filter drop-shadow-lg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>

          {/* Main CTA Text */}
          <h2 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl mx-auto mb-8">
            You have the power to save someone's tomorrow — start today.
          </h2>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12">
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-red-500/20 hover:shadow-red-500/40">
              Register Now
            </button>
            <button className="bg-transparent hover:bg-gray-800 text-white font-bold py-4 px-10 rounded-full border-2 border-red-600 transition-all transform hover:scale-105">
              Learn More
            </button>
          </div>

        
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.1; transform: scale(0.8); }
          50% { opacity: 0.2; transform: scale(1.1); }
          100% { opacity: 0.1; transform: scale(0.8); }
        }
      `}</style>
    </section>
  );
}