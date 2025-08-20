import React from 'react'
import './Button.css'

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '',
  disabled = false,
  ...props 
}) => {
  const buttonClass = `button button-${variant} ${className}`

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button