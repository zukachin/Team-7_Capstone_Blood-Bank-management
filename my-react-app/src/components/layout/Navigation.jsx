import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

const Navigation = () => {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/looking-for-blood', label: 'Looking for Blood' },
    { path: '/donate-blood', label: 'Want to donate Blood' },
    { path: '/dashboard', label: 'Blood Bank Dashboard' }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navigation">
      {/* Logo */}
      <Link to="/" className="navigation-logo">
        <div className="navigation-logo-bar"></div>
        <span className="navigation-logo-text">LIFE LINK</span>
      </Link>
      
      {/* Navigation Links */}
      <div className="navigation-links">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`navigation-link ${isActive(item.path) ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      
      {/* Sign Up Button */}
      <button className="navigation-signup">
        SIGN UP
      </button>
    </nav>
  )
}

export default Navigation