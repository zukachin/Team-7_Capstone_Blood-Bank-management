import React from 'react'
import HeroSection from '../components/sections/HeroSection'
import PortalsSection from '../components/sections/PortalsSection'
import './Home.css'

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <HeroSection />
        <PortalsSection />
      </div>
      
      <div className="home-visual">
        <div className="blood-drop-container">
          <div className="blood-drop">
            <div className="blood-drop-shape"></div>
            
            {/* Blood cells animation */}
            <div className="blood-drop-cells">
              <div className="blood-cells-grid">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="blood-cell"></div>
                ))}
              </div>
            </div>
            
            {/* Blood drop highlight */}
            <div className="blood-drop-highlight"></div>
          </div>
          
          {/* Text below drop */}
          <div className="blood-drop-text">
            <p>Together, we save lives</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home