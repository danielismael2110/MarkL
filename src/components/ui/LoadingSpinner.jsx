import React from 'react'
import './css/loadingSpinner.css'

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClass = `spinner-${size}`
  const colorClass = `spinner-${color}`

  return (
    <div className={`spinner ${sizeClass} ${colorClass}`}>
      <div className="spinner-circle"></div>
    </div>
  )
}

export default LoadingSpinner