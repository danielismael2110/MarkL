import { useState, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useCart } from '../../context/CartContext'
import './css/navbar.css'

const Navbar = () => {
    const { itemCount } = useCart()
    const { user, profile, logout } = useAuth()
    const { darkMode, toggleDarkMode } = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Memoizar valores computados
    const canAccessAdmin = useMemo(() => 
        profile?.rol_id === 1 || profile?.rol_id === 2, 
        [profile?.rol_id]
    )

    const roleName = useMemo(() => {
        switch(profile?.rol_id) {
            case 1: return 'Administrador'
            case 2: return 'Cajero'
            case 3: return 'Cliente'
            default: return 'Usuario'
        }
    }, [profile?.rol_id])

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

    const toggleMenu = () => setIsMenuOpen(prev => !prev)

    // Función para verificar si la ruta está activa
    const isActiveRoute = (path) => {
        if (path === '/admin') {
            return location.pathname.includes('/admin')
        }
        return location.pathname === path
    }

    return (
        <nav className="navbar" role="navigation">
            <div className="navbar-container">
                {/* Logo */}
                <Link 
                    to="/" 
                    className="navbar-logo" 
                    onClick={closeMenu}
                    aria-label="MarkLicor - Ir al inicio"
                >
                    MarkLicor
                </Link>

                <div className="navbar-controls">
                    {/* Botón Tema Oscuro/Claro */}
                    <button
                        onClick={toggleDarkMode}
                        className="theme-toggle"
                        aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>

                    {/* Carrito - siempre visible para usuarios autenticados */}
                    {user && (
                        <div className="nav-cart">
                            <Link 
                                to="/carrito" 
                                className="cart-link"
                                aria-label={`Carrito de compras con ${itemCount} items`}
                            >
                                🛒
                                {itemCount > 0 && (
                                    <span className="cart-badge">{itemCount}</span>
                                )}
                            </Link>
                        </div>
                    )}

                    {/* Menú para móviles */}
                    <button 
                        className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
                        onClick={toggleMenu}
                        aria-label="Menú de navegación"
                        aria-expanded={isMenuOpen}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>

                {/* Links de navegación */}
                <div 
                    className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}
                    aria-hidden={!isMenuOpen}
                >
                    <ul className="navbar-links">
                        <li>
                            <Link 
                                to="/" 
                                className={isActiveRoute('/') ? 'active' : ''}
                                onClick={closeMenu}
                            >
                                Inicio
                            </Link>
                        </li>
                        <li>
                            <Link 
                                to="/productos" 
                                className={isActiveRoute('/productos') ? 'active' : ''}
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
                                        className={isActiveRoute('/login') ? 'active' : ''}
                                        onClick={closeMenu}
                                    >
                                        Iniciar Sesión
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        to="/register" 
                                        className={isActiveRoute('/register') ? 'active' : ''}
                                        onClick={closeMenu}
                                    >
                                        Registrarse
                                    </Link>
                                </li>
                            </>
                        ) : (
                            /* Enlaces para usuarios autenticados */
                            <>
                                {/* Enlace al panel admin para admin y cajero */}
                                {canAccessAdmin && (
                                    <li>
                                        <Link 
                                            to="/admin" 
                                            className={isActiveRoute('/admin') ? 'active admin-link' : 'admin-link'}
                                            onClick={closeMenu}
                                        >
                                            Panel Admin
                                        </Link>
                                    </li>
                                )}
                                
                                {/* Enlaces para todos los usuarios autenticados */}
                                <li>
                                    <Link 
                                        to="/perfil" 
                                        className={isActiveRoute('/perfil') ? 'active' : ''}
                                        onClick={closeMenu}
                                    >
                                        Mi Perfil
                                    </Link>
                                </li>
                                <li>
                                    <Link 
                                        to="/mis-pedidos" 
                                        className={isActiveRoute('/mis-pedidos') ? 'active' : ''}
                                        onClick={closeMenu}
                                    >
                                        Mis Pedidos
                                    </Link>
                                </li>

                                {/* Información del usuario */}
                                <li className="navbar-user-info">
                                    <span className="user-welcome">
                                        Hola, {profile?.nombre_completo || user.email}
                                    </span>
                                    <span className="user-role">
                                        ({roleName})
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
            </div>
        </nav>
    )
}

export default Navbar