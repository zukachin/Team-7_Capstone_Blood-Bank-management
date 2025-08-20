import React from 'react'
import './PortalCard.css'

const PortalCard = ({ title, description, stat }) => {
  return (
    <div className="portal-card">
      <h3 className="portal-card-title">{title}</h3>
      <p className="portal-card-description">
        {description}
      </p>
      
      {/* Stats */}
      <div className="portal-card-stats">
        <div className="portal-card-stat">
          <span className="portal-card-stat-value">{stat.value.toLocaleString()}</span>
          <span className="portal-card-stat-label">{stat.label}</span>
        </div>
      </div>
    </div>
  )
}

export default PortalCard