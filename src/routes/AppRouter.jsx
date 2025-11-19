import { Routes, Route } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Home from '../pages/public/Home'
import Login from '../pages/public/Login'
import Register from '../pages/public/Register'
import ProductosPublic from '../pages/public/ProductosPublic'

import Perfil from '../pages/auth/Perfil'
import Carrito from '../pages/auth/Carrito'
import MisPedidos from '../pages/auth/MisPedidos'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import RoleRoute from '../components/auth/RoleRoute'
import AdminDashboard from '../pages/admin/AdminDashboard'
import Productos from '../pages/admin/Productos'
import Pedidos from '../pages/admin/Pedidos'
import Ventas from '../pages/admin/Ventas'
import Usuarios from '../pages/admin/Usuarios'
import Inventario from '../pages/admin/Inventario'
import Categorias from '../pages/admin/Categorias'
import Proveedores from '../pages/admin/Proveedores'

const AppRouter = () => {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/productos" element={<ProductosPublic />} />

      {/* Rutas protegidas para clientes */}
      <Route element={<ProtectedRoute />}>
        
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
      </Route>

      {/* Rutas de administración */}
      <Route path="/admin" element={<RoleRoute allowedRoles={['admin', 'cajero']} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="productos" element={<Productos />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="/admin/categorias" element={<Categorias />} />
  <Route path="/admin/proveedores" element={<Proveedores />} />
        <Route path="usuarios" element={<Usuarios />} />
      </Route>

      {/* Ruta 404 */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-8">Página no encontrada</p>
            <a href="/" className="text-amber-600 hover:text-amber-700">
              Volver al inicio
            </a>
          </div>
        </div>
      } />
    </Routes>
  )
}

export default AppRouter