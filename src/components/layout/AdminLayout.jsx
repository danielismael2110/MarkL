import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const AdminLayout = () => {
  const { user, profile, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const adminMenuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/productos', label: 'Productos', icon: '🍷' },
    { path: '/admin/pedidos', label: 'Pedidos', icon: '📦' },
    { path: '/admin/ventas', label: 'Ventas', icon: '💰' },
    { path: '/admin/inventario', label: 'Inventario', icon: '📋' },
  ]

  // Si es admin, agregar gestión de usuarios
  if (profile?.rol_id === 1) {
    adminMenuItems.push({ path: '/admin/usuarios', label: 'Usuarios', icon: '👥' })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-blue-800 overflow-y-auto">
          <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-blue-900">
            <h1 className="text-white text-xl font-bold">MarkLicor Admin</h1>
          </div>
          <div className="flex-1 flex flex-col">
            <nav className="flex-1 px-4 py-4 space-y-2">
              {adminMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition ${
                    location.pathname === item.path
                      ? 'bg-blue-900 text-white'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-blue-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {profile?.nombre_completo?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {profile?.nombre_completo}
                </p>
                <p className="text-xs font-medium text-blue-200">
                  {profile?.rol_id === 1 ? 'Administrador' : 'Cajero'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <Navbar 
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          profile={profile}
          onSignOut={handleSignOut}
        />
        
        <main className="flex-1 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={adminMenuItems}
        user={user}
        profile={profile}
        onSignOut={handleSignOut}
      />
    </div>
  )
}

export default AdminLayout