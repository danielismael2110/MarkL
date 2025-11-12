// src/components/ui/Input.jsx
import React from 'react'

const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  className = '',
  ...props 
}) => {
  return (
    <div className="flex flex-col space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`
          appearance-none relative block w-full px-3 py-2 border border-gray-300 
          placeholder-gray-500 text-gray-900 rounded-md focus:outline-none 
          focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm
          ${className}
        `.trim()}
        {...props}
      />
    </div>
  )
}

export default Input