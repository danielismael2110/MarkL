import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import './css/adminLayout.css'

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, profile, logout } = useAuth()
  const { darkMode } = useTheme() // Agregar useTheme aquí
  const location = useLocation()
  const navigate = useNavigate()

  const userRole = profile?.rol_id === 1 ? 'Administrador' : 
                  profile?.rol_id === 2 ? 'Cajero' : 'Cliente'

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊', roles: ['admin', 'cajero'] },
    { path: '/admin/ventas', label: 'Ventas POS', icon: '💳', roles: ['admin', 'cajero'] },
    { path: '/admin/pedidos', label: 'Pedidos', icon: '📦', roles: ['admin', 'cajero'] },
    { path: '/admin/productos', label: 'Productos', icon: '🍷', roles: ['admin', 'cajero'] },
    { path: '/admin/inventario', label: 'Inventario', icon: '📋', roles: ['admin', 'cajero'] },
    { path: '/admin/categorias', label: 'Categorías', icon: '📑', roles: ['admin', 'cajero'] },
    { path: '/admin/proveedores', label: 'Proveedores', icon: '🏢', roles: ['admin', 'cajero'] },
    { path: '/admin/usuarios', label: 'Usuarios', icon: '👥', roles: ['admin'] },
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(profile?.rol_id === 1 ? 'admin' : 'cajero')
  )

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className={`admin-layout ${darkMode ? 'dark-mode' : ''}`}> {/* Aplicar dark-mode aquí */}
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Marklicor Admin</h2>
          <button 
            className="close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {filteredMenuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <p className="user-name">{profile?.nombre_completo}</p>
            <p className="user-role">{userRole}</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <button 
            className="menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="header-title">
            <h1>
              {filteredMenuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="header-actions">
            <Link to="/" className="back-to-store">
              🏪 Volver a la Tienda
            </Link>
          </div>
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>

      {/* Overlay para móviles */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default AdminLayout