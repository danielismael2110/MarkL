import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { supabase } from '../../lib/supabaseClient'
import AdminLayout from '../../components/layout/AdminLayout'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import './css/adminDashboard.css'

const AdminDashboard = () => {
  const { profile } = useAuth()
  const { darkMode } = useTheme()
  const [stats, setStats] = useState({})
  const [recentOrders, setRecentOrders] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Estadísticas generales
      const { data: products } = await supabase
        .from('productos')
        .select('id, stock')
      
      const { data: orders } = await supabase
        .from('pedidos')
        .select('id, total, estado')
      
      const { data: sales } = await supabase
        .from('ventas')
        .select('total')
      
      const { data: users } = await supabase
        .from('perfiles')
        .select('id')

      // Pedidos recientes
      const { data: recentOrdersData } = await supabase
        .from('pedidos')
        .select(`
          *,
          perfiles(nombre_completo)
        `)
        .order('creado_en', { ascending: false })
        .limit(5)

      // Productos con stock bajo
      const { data: lowStockData } = await supabase
        .from('productos')
        .select('*')
        .lt('stock', 10)
        .order('stock', { ascending: true })
        .limit(5)

      const totalRevenue = sales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0
      const pendingOrders = orders?.filter(order => order.estado === 'pendiente').length || 0

      setStats({
        totalProducts: products?.length || 0,
        totalOrders: orders?.length || 0,
        totalRevenue,
        pendingOrders,
        totalUsers: users?.length || 0,
        lowStockCount: lowStockData?.length || 0
      })

      setRecentOrders(recentOrdersData || [])
      setLowStockProducts(lowStockData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pendiente: 'pendiente',
      confirmado: 'confirmado',
      enviado: 'enviado',
      entregado: 'entregado',
      cancelado: 'cancelado'
    }
    return colors[status] || 'pendiente'
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className={`dashboard ${darkMode ? 'dark-mode' : ''}`}>
        {/* Welcome Section */}
        <div className="welcome-card">
          <div className="welcome-content">
            <h1 className="welcome-title">
              ¡Bienvenido, {profile?.nombre_completo}!
            </h1>
            <p className="welcome-subtitle">
              {profile?.rol_id === 1 ? 'Administrador' : 'Cajero'} - Panel de control Marklicor
            </p>
          </div>
          <div className="welcome-stats">
            <div className="stat-badge">
              <span>📊</span>
              Resumen del día
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🍷</div>
            <div className="stat-info">
              <h3 className="stat-value">{stats.totalProducts}</h3>
              <p className="stat-label">Productos</p>
            </div>
            <Link to="/admin/productos" className="stat-link">
              Ver todos →
            </Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3 className="stat-value">{stats.totalOrders}</h3>
              <p className="stat-label">Pedidos Totales</p>
            </div>
            <Link to="/admin/pedidos" className="stat-link">
              Gestionar →
            </Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div className="stat-info">
              <h3 className="stat-value">${stats.totalRevenue?.toFixed(2) || '0.00'}</h3>
              <p className="stat-label">Ingresos Totales</p>
            </div>
            <Link to="/admin/ventas" className="stat-link">
              Ver ventas →
            </Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <h3 className="stat-value">{stats.pendingOrders}</h3>
              <p className="stat-label">Pedidos Pendientes</p>
            </div>
            <Link to="/admin/pedidos?estado=pendiente" className="stat-link">
              Revisar →
            </Link>
          </div>

          {profile?.rol_id === 1 && (
            <>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3 className="stat-value">{stats.totalUsers}</h3>
                  <p className="stat-label">Usuarios</p>
                </div>
                <Link to="/admin/usuarios" className="stat-link">
                  Administrar →
                </Link>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⚠️</div>
                <div className="stat-info">
                  <h3 className="stat-value">{stats.lowStockCount}</h3>
                  <p className="stat-label">Stock Bajo</p>
                </div>
                <Link to="/admin/inventario" className="stat-link">
                  Reabastecer →
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Recent Orders and Low Stock */}
        <div className="dashboard-grid">
          {/* Pedidos Recientes */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Pedidos Recientes</h3>
              <Link to="/admin/pedidos" className="view-all-link">
                Ver todos →
              </Link>
            </div>
            <div className="card-content">
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay pedidos recientes</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map(order => (
                    <div key={order.id} className="order-item">
                      <div className="order-info">
                        <p className="order-number">{order.numero_pedido}</p>
                        <p className="order-customer">
                          {order.perfiles?.nombre_completo || 'Cliente'}
                        </p>
                      </div>
                      <div className="order-details">
                        <span className={`status-badge ${getStatusColor(order.estado)}`}>
                          {order.estado}
                        </span>
                        <span className="order-total">${order.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stock Bajo */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Stock Bajo</h3>
              <Link to="/admin/inventario" className="view-all-link">
                Ver todo →
              </Link>
            </div>
            <div className="card-content">
              {lowStockProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Todo el stock está en niveles normales</p>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map(product => (
                    <div key={product.id} className="stock-item">
                      <div className="product-info">
                        <p className="product-name">{product.nombre}</p>
                        <p className="product-category">Stock: {product.stock}</p>
                      </div>
                      <div className={`stock-level ${product.stock < 5 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {product.stock < 5 ? 'Crítico' : 'Bajo'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <h3 className="card-title mb-4">Acciones Rápidas</h3>
          <div className="quick-actions-grid">
            <Link to="/admin/ventas" className="quick-action">
              <span className="action-icon">💳</span>
              <span className="action-text">Nueva Venta</span>
            </Link>
            <Link to="/admin/productos" className="quick-action">
              <span className="action-icon">➕</span>
              <span className="action-text">Agregar Producto</span>
            </Link>
            <Link to="/admin/inventario" className="quick-action">
              <span className="action-icon">📋</span>
              <span className="action-text">Gestionar Inventario</span>
            </Link>
            <Link to="/admin/pedidos" className="quick-action">
              <span className="action-icon">📦</span>
              <span className="action-text">Ver Pedidos</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard