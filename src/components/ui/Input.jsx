import React from 'react'
import './css/input.css'

const Input = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  disabled = false,
  error,
  ...props 
}) => {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`input-field ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        {...props}
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  )
}

export default Input