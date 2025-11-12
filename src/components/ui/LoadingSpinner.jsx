// src/components/ui/LoadingSpinner.jsx
import React from 'react'
import './css/loadingSpinner.css'

const LoadingSpinner = ({ size = 'medium' }) => {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner"></div>
    </div>
  )
}

export default LoadingSpinner