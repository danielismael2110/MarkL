import { Routes, Route } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Home from '../pages/public/Home'
import Login from '../pages/public/Login'
import Register from '../pages/public/Register'
import ProductosPublic from '../pages/public/ProductosPublic'
import Dashboard from '../pages/auth/Dashboard'
import Perfil from '../pages/auth/Perfil'
import Carrito from '../pages/auth/Carrito'
import ProtectedRoute from '../components/auth/ProtectedRoute'

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

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/carrito" element={<Carrito />} />
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
      <Route path="/carrito" element={
  <ProtectedRoute>
    <Carrito />
  </ProtectedRoute>
} />
    </Routes>
  )
}

export default AppRouter