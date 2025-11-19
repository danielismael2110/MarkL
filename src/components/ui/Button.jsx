import React from 'react'
import './css/button.css'

const Button = ({ 
  children, 
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props 
}) => {
  const baseClass = 'btn'
  const variantClass = `btn-${variant}`
  const sizeClass = `btn-${size}`
  const stateClass = disabled ? 'btn-disabled' : ''
  
  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${sizeClass} ${stateClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span className="btn-loading-spinner"></span>
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button