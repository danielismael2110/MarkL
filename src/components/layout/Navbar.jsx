import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './css/navbar.css'
import { useCart } from '../../context/CartContext';


const Navbar = () => {
    const { itemCount } = useCart();
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
      setIsMenuOpen(false)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const closeMenu = () => setIsMenuOpen(false)

  const getRoleName = (rolId) => {
    switch(rolId) {
      case 1: return 'Administrador'
      case 2: return 'Cajero'
      case 3: return 'Cliente'
      default: return 'Usuario'
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          MarkLicor
        </Link>

        {/* Menú para móviles */}
        <button 
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Links de navegación */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-links">
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
                onClick={closeMenu}
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link 
                to="/productos" 
                className={location.pathname === '/productos' ? 'active' : ''}
                onClick={closeMenu}
              >
                Productos
              </Link>
            </li>

            {/* Enlaces para usuarios no autenticados */}
            {!user ? (
              <>
                <li>
                  <Link 
                    to="/login" 
                    className={location.pathname === '/login' ? 'active' : ''}
                    onClick={closeMenu}
                  >
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/register" 
                    className={location.pathname === '/register' ? 'active' : ''}
                    onClick={closeMenu}
                  >
                    Registrarse
                  </Link>
                </li>
              </>
            ) : (
              /* Enlaces para usuarios autenticados */
              <>
                {/* Menú según rol */}
                {profile?.rol_id === 1 && (
                  <li>
                    <Link 
                      to="/admin/dashboard" 
                      className={location.pathname.includes('/admin') ? 'active' : ''}
                      onClick={closeMenu}
                    >
                      Panel Admin
                    </Link>
                  </li>
                )}
                
                {(profile?.rol_id === 2 || profile?.rol_id === 3) && (
                  <>
                    <li>
                      <Link 
                        to="/dashboard" 
                        className={location.pathname === '/dashboard' ? 'active' : ''}
                        onClick={closeMenu}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/perfil" 
                        className={location.pathname === '/perfil' ? 'active' : ''}
                        onClick={closeMenu}
                      >
                        Mi Perfil
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/carrito" 
                        className={location.pathname === '/carrito' ? 'active' : ''}
                        onClick={closeMenu}
                      >
                        Carrito
                      </Link>
                    </li>
                  </>
                )}

                {/* Información del usuario */}
                <li className="navbar-user-info">
                  <span className="user-welcome">
                    Hola, {profile?.nombre_completo || user.email}
                  </span>
                  <span className="user-role">
                    ({getRoleName(profile?.rol_id)})
                  </span>
                </li>

                {/* Botón cerrar sesión */}
                <li>
                  <button 
                    onClick={handleLogout}
                    className="logout-btn"
                  >
                    Cerrar Sesión
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
         <div className="nav-cart">
        <Link to="/carrito" className="cart-link">
          🛒
          {itemCount > 0 && (
            <span className="cart-badge">{itemCount}</span>
          )}
        </Link>
      </div>
      </div>
    </nav>
  )
}

export default Navbar