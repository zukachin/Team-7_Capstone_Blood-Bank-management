import React from 'react';
import './BloodDonationUI.css';

const BloodDonationUI = () => {
  return (
    <div className="blood-donation-app">
      {/* Navigation */}
      <nav className="navigation">
        <div className="nav-logo">
          <div className="logo-bar"></div>
          <span className="logo-text">LIFE LINK</span>
        </div>
        
        <div className="nav-links">
          <a href="#" className="nav-link active">Home</a>
          <a href="#" className="nav-link">Looking for Blood</a>
          <a href="#" className="nav-link">Want to donate Blood</a>
          <a href="#" className="nav-link">Blood Bank Dashboard</a>
        </div>
        
        <button className="signup-btn">SIGN UP</button>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Content */}
        <div className="content-left">
          <h1 className="hero-title">
            Connecting Donors, Hospitals<br />
            <span className="hero-subtitle">& Patients – Instantly</span>
          </h1>
          
          <p className="hero-description">
            Every drop counts. Our platform ensures that hospitals can find, request, and track blood in real time.
          </p>
          
          <button className="donate-btn">Donate Blood</button>

          {/* Portal Cards */}
          <div className="portals-grid">
            {/* Donor Portal */}
            <div className="portal-card">
              <h3 className="portal-title">Donor Portal</h3>
              <p className="portal-description">
                Register, book appointment, and manage your donation history
              </p>
              
              <div className="portal-stats">
                <div className="stat-item">
                  <span className="stat-number">12,300</span>
                  <span className="stat-label">Donor Registered</span>
                </div>
              </div>
            </div>

            {/* Inventory Portal */}
            <div className="portal-card">
              <h3 className="portal-title">Inventory Portal</h3>
              <p className="portal-description">
                View real-time blood stock information.<br />
                Know Shortages
              </p>
              
              <div className="portal-stats">
                <div className="stat-item">
                  <span className="stat-number">12,300</span>
                  <span className="stat-label">Blood Units Collected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content - Blood Drop */}
        <div className="content-right">
          <div className="blood-drop-container">
            {/* Large Blood Drop */}
            <div className="blood-drop">
              {/* Drop Shape */}
              <div className="blood-drop-shape"></div>
              
              {/* Blood cells animation */}
              <div className="blood-cells">
                <div className="cells-grid">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="blood-cell" style={{animationDelay: `${i * 0.2}s`}}></div>
                  ))}
                </div>
              </div>
              
              {/* Blood drop highlight */}
              <div className="blood-highlight"></div>
            </div>
            
            {/* Text below drop */}
            <div className="drop-text">
              <p>Together, we save lives</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="decorative-vertical"></div>
      <div className="decorative-horizontal"></div>
    </div>
  );
};

export default BloodDonationUI;