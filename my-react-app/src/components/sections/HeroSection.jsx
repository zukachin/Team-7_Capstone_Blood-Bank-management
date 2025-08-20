import React from 'react'
import Button from '../ui/Button'
import './HeroSection.css'

const HeroSection = () => {
  return (
    <div className="hero-section">
      <h1 className="hero-title">
        Connecting Donors, Hospitals<br />
        <span className="hero-title-secondary">& Patients – Instantly</span>
      </h1>
      
      <p className="hero-description">
        Every drop counts. Our platform ensures that hospitals can find, request, and track blood in real time.
      </p>
      
      <Button variant="primary">
        Donate Blood
      </Button>
    </div>
  )
}

export default HeroSection