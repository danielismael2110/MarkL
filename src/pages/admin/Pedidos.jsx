import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AdminLayout from '../../components/layout/AdminLayout'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import './css/pedidos.css'

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')

  useEffect(() => {
    fetchPedidos()
  }, [filter])

  const fetchPedidos = async () => {
    try {
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          perfiles(nombre_completo, telefono),
          pedido_detalles(
            *,
            productos(nombre, precio)
          )
        `)
        .order('creado_en', { ascending: false })

      if (filter !== 'todos') {
        query = query.eq('estado', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setPedidos(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ 
          estado: newStatus, 
          actualizado_en: new Date().toISOString() 
        })
        .eq('id', orderId)

      if (error) throw error
      
      // Mostrar mensaje de confirmación
      const statusMessages = {
        pendiente: 'Pedido marcado como pendiente',
        confirmado: 'Pedido confirmado exitosamente',
        enviado: 'Pedido marcado como enviado',
        entregado: '¡Pedido entregado!',
        cancelado: 'Pedido cancelado'
      }
      
      alert(statusMessages[newStatus] || 'Estado actualizado')
      fetchPedidos()
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Error al actualizar el estado del pedido')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pendiente: 'status-pendiente',
      confirmado: 'status-confirmado',
      enviado: 'status-enviado',
      entregado: 'status-entregado',
      cancelado: 'status-cancelado'
    }
    return colors[status] || 'status-pendiente'
  }

  const getStatusText = (status) => {
    const texts = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      enviado: 'Enviado',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    }
    return texts[status] || status
  }

  const getStatusIcon = (status) => {
    const icons = {
      pendiente: '⏳',
      confirmado: '✅',
      enviado: '🚚',
      entregado: '🎉',
      cancelado: '❌'
    }
    return icons[status] || '📦'
  }

  const getStatusOptions = (currentStatus) => {
    const allStatus = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado']
    return allStatus.filter(status => status !== currentStatus)
  }

  const calculateTotal = (detalles) => {
    return detalles?.reduce((sum, detalle) => sum + (detalle.subtotal || 0), 0) || 0
  }

  // Función para determinar el progreso del pedido
  const getOrderProgress = (estado) => {
    const progress = {
      pendiente: 25,
      confirmado: 50,
      enviado: 75,
      entregado: 100,
      cancelado: 0
    }
    return progress[estado] || 0
  }

  // Función para obtener los pasos completados
  const getCompletedSteps = (estado) => {
    const steps = {
      pendiente: ['creado'],
      confirmado: ['creado', 'confirmado'],
      enviado: ['creado', 'confirmado', 'enviado'],
      entregado: ['creado', 'confirmado', 'enviado', 'entregado'],
      cancelado: ['creado']
    }
    return steps[estado] || ['creado']
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
      <div className="pedidos-container">
        <div className="pedidos-header">
          <h1>Gestión de Pedidos</h1>
          <div className="filters">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos los pedidos</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmado">Confirmados</option>
              <option value="enviado">Enviados</option>
              <option value="entregado">Entregados</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="pedidos-stats">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{pedidos.length}</h3>
              <p>Total Pedidos</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{pedidos.filter(p => p.estado === 'pendiente').length}</h3>
              <p>Pendientes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🚚</div>
            <div className="stat-info">
              <h3>{pedidos.filter(p => p.estado === 'enviado').length}</h3>
              <p>En Camino</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎉</div>
            <div className="stat-info">
              <h3>{pedidos.filter(p => p.estado === 'entregado').length}</h3>
              <p>Entregados</p>
            </div>
          </div>
        </div>

        <div className="pedidos-list">
          {pedidos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No hay pedidos</h3>
              <p>No se encontraron pedidos con los filtros seleccionados.</p>
            </div>
          ) : (
            pedidos.map(pedido => (
              <div key={pedido.id} className="pedido-card">
                <div className="pedido-header">
                  <div className="pedido-info">
                    <h3>{pedido.numero_pedido}</h3>
                    <p className="cliente">
                      <strong>Cliente:</strong> {pedido.perfiles?.nombre_completo}
                      {pedido.perfiles?.telefono && ` • 📞 ${pedido.perfiles.telefono}`}
                    </p>
                    <p className="fecha">
                      <strong>Fecha:</strong> {new Date(pedido.creado_en).toLocaleDateString()} - 
                      {new Date(pedido.creado_en).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="pedido-status">
                    <div className="status-display">
                      <span className={`status-badge ${getStatusColor(pedido.estado)}`}>
                        {getStatusIcon(pedido.estado)} {getStatusText(pedido.estado)}
                      </span>
                      <span className="status-updated">
                        Actualizado: {new Date(pedido.actualizado_en || pedido.creado_en).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="status-actions">
                      <select 
                        value={pedido.estado}
                        onChange={(e) => updateOrderStatus(pedido.id, e.target.value)}
                        className="status-select"
                      >
                        <option value={pedido.estado}>Cambiar estado...</option>
                        {getStatusOptions(pedido.estado).map(status => (
                          <option key={status} value={status}>
                            {getStatusIcon(status)} {getStatusText(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Barra de progreso del pedido */}
                <div className="order-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${getOrderProgress(pedido.estado)}%` }}
                    ></div>
                  </div>
                  <div className="progress-steps">
                    <div className={`progress-step ${getCompletedSteps(pedido.estado).includes('creado') ? 'completed' : ''}`}>
                      <span className="step-icon">📝</span>
                      <span className="step-label">Creado</span>
                    </div>
                    <div className={`progress-step ${getCompletedSteps(pedido.estado).includes('confirmado') ? 'completed' : ''}`}>
                      <span className="step-icon">✅</span>
                      <span className="step-label">Confirmado</span>
                    </div>
                    <div className={`progress-step ${getCompletedSteps(pedido.estado).includes('enviado') ? 'completed' : ''}`}>
                      <span className="step-icon">🚚</span>
                      <span className="step-label">Enviado</span>
                    </div>
                    <div className={`progress-step ${getCompletedSteps(pedido.estado).includes('entregado') ? 'completed' : ''}`}>
                      <span className="step-icon">🎉</span>
                      <span className="step-label">Entregado</span>
                    </div>
                  </div>
                </div>

                <div className="pedido-details">
                  <div className="detalles-list">
                    <h4>📦 Productos del Pedido</h4>
                    {pedido.pedido_detalles?.map(detalle => (
                      <div key={detalle.id} className="detalle-item">
                        <span className="producto-nombre">
                          {detalle.productos?.nombre}
                        </span>
                        <span className="detalle-cantidad">
                          {detalle.cantidad} x ${detalle.precio_unitario}
                        </span>
                        <span className="detalle-subtotal">
                          ${detalle.subtotal}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pedido-summary">
                    <h4>💰 Resumen del Pedido</h4>
                    <div className="summary-item">
                      <span>Subtotal:</span>
                      <span>${calculateTotal(pedido.pedido_detalles).toFixed(2)}</span>
                    </div>
                    <div className="summary-item total">
                      <span>Total:</span>
                      <span>${pedido.total}</span>
                    </div>
                    <div className="summary-item">
                      <span>Método de pago:</span>
                      <span className="payment-method">{pedido.metodo_pago}</span>
                    </div>
                    {pedido.direccion_envio && (
                      <div className="summary-item">
                        <span>📍 Dirección:</span>
                        <span className="direccion">{pedido.direccion_envio}</span>
                      </div>
                    )}
                    {pedido.observacion && (
                      <div className="summary-item observaciones">
                        <span>📝 Observaciones:</span>
                        <span>{pedido.observacion}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información adicional del estado */}
                <div className="estado-info">
                  <div className="estado-message">
                    <strong>Estado actual:</strong> {getStatusMessage(pedido.estado)}
                  </div>
                  {pedido.estado === 'enviado' && (
                    <div className="shipping-info">
                      📦 El pedido está en camino al cliente
                    </div>
                  )}
                  {pedido.estado === 'entregado' && (
                    <div className="delivery-info">
                      ✅ Pedido entregado satisfactoriamente
                    </div>
                  )}
                  {pedido.estado === 'cancelado' && (
                    <div className="cancel-info">
                      ❌ Este pedido ha sido cancelado
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

// Función para obtener mensajes descriptivos del estado
const getStatusMessage = (estado) => {
  const messages = {
    pendiente: 'El pedido está pendiente de confirmación por el administrador.',
    confirmado: 'El pedido ha sido confirmado y está siendo preparado.',
    enviado: 'El pedido ha sido enviado y está en camino al cliente.',
    entregado: 'El pedido ha sido entregado satisfactoriamente.',
    cancelado: 'El pedido ha sido cancelado.'
  }
  return messages[estado] || 'Estado del pedido.'
}

export default Pedidos