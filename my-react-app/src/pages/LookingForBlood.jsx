// src/pages/LookingForBlood.jsx
import React from 'react'

const LookingForBlood = () => {
  return (
    <div className="px-8 py-16">
      <h1 style={{
        fontSize: 'var(--font-4xl)',
        fontWeight: 'var(--font-bold)',
        marginBottom: 'var(--spacing-xl)',
        color: 'var(--color-white)'
      }}>
        Looking for Blood
      </h1>
      <p style={{
        color: 'var(--color-gray-400)',
        fontSize: 'var(--font-lg)'
      }}>
        Find blood donors in your area...
      </p>
    </div>
  )
}

export default LookingForBlood;

