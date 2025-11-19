import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './css/login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2 className="login-title">Login</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
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
                className="login-input"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
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
                className="login-input"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Tu contraseña"
              />
            </div>
          </div>

          <div className="login-button-container">
            <button 
              type="submit" 
              disabled={loading}
              className="login-button"
            >
              {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>

        <div className="login-links">
          <p>
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
          <p>
            <Link to="/">Volver al inicio</Link>
          </p>
        </div>

        <div className="login-texture"></div>
      </div>
    </div>
  )
}

export default Login