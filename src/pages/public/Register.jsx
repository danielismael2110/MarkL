import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './css/register.css'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre_completo: '',
    telefono: '',
    direccion: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      await register(
        formData.email, 
        formData.password, 
        formData.nombre_completo,
        formData.telefono,
        formData.direccion
      )
      navigate('/dashboard')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-form-wrapper">
        <h2 className="register-title">Registro</h2>
        <p className="register-subtitle">Crea tu cuenta en MarkLicor</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="nombre_completo">Nombre Completo</label>
            <div className="input-container">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="gradient-stroke"
                    x1="0"
                    y1="0"
                    x2="24"
                    y2="24"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="currentColor"></stop>
                    <stop offset="100%" stopColor="currentColor"></stop>
                  </linearGradient>
                </defs>
                <g stroke="url(#gradient-stroke)" fill="none" strokeWidth="1">
                  <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"/>
                  <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21"/>
                </g>
              </svg>
              <input
                className="register-input"
                type="text"
                id="nombre_completo"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                required
                placeholder="Tu nombre completo"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-container">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="gradient-stroke"
                    x1="0"
                    y1="0"
                    x2="24"
                    y2="24"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="currentColor"></stop>
                    <stop offset="100%" stopColor="currentColor"></stop>
                  </linearGradient>
                </defs>
                <g stroke="url(#gradient-stroke)" fill="none" strokeWidth="1">
                  <path d="M21.6365 5H3L12.2275 12.3636L21.6365 5Z"></path>
                  <path d="M16.5 11.5L22.5 6.5V17L16.5 11.5Z"></path>
                  <path d="M8 11.5L2 6.5V17L8 11.5Z"></path>
                  <path d="M9.5 12.5L2.81805 18.5002H21.6362L15 12.5L12 15L9.5 12.5Z"></path>
                </g>
              </svg>
              <input
                className="register-input"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <div className="input-container">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="gradient-stroke"
                    x1="0"
                    y1="0"
                    x2="24"
                    y2="24"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="currentColor"></stop>
                    <stop offset="100%" stopColor="currentColor"></stop>
                  </linearGradient>
                </defs>
                <g stroke="url(#gradient-stroke)" fill="none" strokeWidth="1">
                  <path d="M5 4H9L11 9L8.5 10.5C9.5702 12.6717 11.3283 14.4298 13.5 15.5L15 13L20 15V19C20 19.5304 19.7893 20.0391 19.4142 20.4142C19.0391 20.7893 18.5304 21 18 21C14.0993 20.763 10.4202 19.1065 7.65683 16.3432C4.8935 13.5798 3.23705 9.90074 3 6C3 5.46957 3.21071 4.96086 3.58579 4.58579C3.96086 4.21071 4.46957 4 5 4Z"/>
                </g>
              </svg>
              <input
                className="register-input"
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Tu teléfono"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección</label>
            <div className="input-container">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="gradient-stroke"
                    x1="0"
                    y1="0"
                    x2="24"
                    y2="24"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="currentColor"></stop>
                    <stop offset="100%" stopColor="currentColor"></stop>
                  </linearGradient>
                </defs>
                <g stroke="url(#gradient-stroke)" fill="none" strokeWidth="1">
                  <path d="M12 21C15.5 17.4 19 14.1764 19 10.2C19 6.22355 15.7764 3 12 3C8.22355 3 5 6.22355 5 10.2C5 14.1764 8.5 17.4 12 21Z"/>
                  <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"/>
                </g>
              </svg>
              <textarea
                className="register-textarea"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Tu dirección completa"
                rows="3"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-container">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="gradient-stroke"
                    x1="0"
                    y1="0"
                    x2="24"
                    y2="24"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="currentColor"></stop>
                    <stop offset="100%" stopColor="currentColor"></stop>
                  </linearGradient>
                </defs>
                <g stroke="url(#gradient-stroke)" fill="none" strokeWidth="1">
                  <path d="M3.5 15.5503L9.20029 9.85L12.3503 13L11.6 13.7503H10.25L9.8 15.1003L8 16.0003L7.55 18.2503L5.5 19.6003H3.5V15.5503Z"></path>
                  <path d="M16 3.5H11L8.5 6L16 13.5L21 8.5L16 3.5Z"></path>
                  <path d="M16 10.5L18 8.5L15 5.5H13L12 6.5L16 10.5Z"></path>
                </g>
              </svg>
              <input
                className="register-input"
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <div className="input-container">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="gradient-stroke"
                    x1="0"
                    y1="0"
                    x2="24"
                    y2="24"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="currentColor"></stop>
                    <stop offset="100%" stopColor="currentColor"></stop>
                  </linearGradient>
                </defs>
                <g stroke="url(#gradient-stroke)" fill="none" strokeWidth="1">
                  <path d="M3.5 15.5503L9.20029 9.85L12.3503 13L11.6 13.7503H10.25L9.8 15.1003L8 16.0003L7.55 18.2503L5.5 19.6003H3.5V15.5503Z"></path>
                  <path d="M16 3.5H11L8.5 6L16 13.5L21 8.5L16 3.5Z"></path>
                  <path d="M16 10.5L18 8.5L15 5.5H13L12 6.5L16 10.5Z"></path>
                </g>
              </svg>
              <input
                className="register-input"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Repite tu contraseña"
              />
            </div>
          </div>

          <div className="register-button-container">
            <button 
              type="submit" 
              disabled={loading}
              className="register-button"
            >
              {loading ? 'Creando Cuenta...' : 'Registrarse'}
            </button>
          </div>
        </form>

        <div className="register-links">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
          <p>
            <Link to="/">Volver al inicio</Link>
          </p>
        </div>

        <div className="register-texture"></div>
      </div>
    </div>
  )
}

export default Register