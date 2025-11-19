import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { supabase } from '../../lib/supabaseClient'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { generateInvoicePDF } from '../../utils/pdfGenerator'
import './css/misPedidos.css'

const MisPedidos = () => {
  const { user, profile } = useAuth()
  const { darkMode } = useTheme()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPedido, setSelectedPedido] = useState(null)

  useEffect(() => {
    if (user) {
      fetchPedidos()
    }
  }, [user])

  const fetchPedidos = async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          pedido_detalles(
            *,
            productos(
              nombre,
              precio,
              imagen
            )
          )
        `)
        .eq('cliente_id', user.id)
        .order('creado_en', { ascending: false })

      if (error) throw error
      setPedidos(data || [])
    } catch (error) {
      console.error('Error fetching pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (estado) => {
    const colors = {
      pendiente: 'status-pendiente',
      confirmado: 'status-confirmado',
      enviado: 'status-enviado',
      entregado: 'status-entregado',
      cancelado: 'status-cancelado'
    }
    return colors[estado] || 'status-pendiente'
  }

  const getStatusText = (estado) => {
    const texts = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      enviado: 'Enviado',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    }
    return texts[estado] || estado
  }

  const handleDownloadInvoice = async (pedido, event) => {
    try {
      // Mostrar estado de carga en el botón
      const originalText = event.target.innerHTML;
      event.target.innerHTML = '⏳ Generando...';
      event.target.disabled = true;

      // Crear objeto de perfil completo para el PDF
      const userProfileForPDF = {
        nombre_completo: profile?.nombre_completo || 'Cliente',
        email: user?.email || '',
        nit_ci: pedido.nit_ci || profile?.nit_ci || '1234',
        telefono: profile?.telefono || '',
        direccion: profile?.direccion || ''
      };

      await generateInvoicePDF(pedido, userProfileForPDF);
      
      // Restaurar el botón después de un breve delay
      setTimeout(() => {
        event.target.innerHTML = originalText;
        event.target.disabled = false;
      }, 1000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Restaurar el botón en caso de error
      event.target.innerHTML = '📄 Descargar Factura';
      event.target.disabled = false;
      
      alert('Error al generar la factura: ' + error.message);
    }
  }

  const calculateTotal = (detalles) => {
    return detalles?.reduce((sum, detalle) => sum + (detalle.subtotal || 0), 0) || 0
  }

  const renderNitInfo = (pedido) => {
    const nit = pedido.nit_ci || profile?.nit_ci;
    if (nit) {
      return (
        <div className="resumen-item">
          <span>NIT/CI:</span>
          <span className="nit-ci">{nit}</span>
        </div>
      );
    }
    return null;
  }

  if (loading) {
    return (
      <div className={`mis-pedidos-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className="loading-container">
          <LoadingSpinner />
          <p>Cargando tus pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`mis-pedidos-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="pedidos-header">
        <h1>Mis Pedidos</h1>
        <p>Revisa el estado y detalles de tus compras</p>
      </div>

      {pedidos.length === 0 ? (
        <div className="empty-pedidos">
          <div className="empty-icon">📦</div>
          <h2>No tienes pedidos aún</h2>
          <p>Cuando realices pedidos, aparecerán aquí.</p>
          <a href="/productos" className="btn-primary">
            Ver Productos
          </a>
        </div>
      ) : (
        <div className="pedidos-grid">
          {pedidos.map(pedido => (
            <div key={pedido.id} className="pedido-card">
              <div className="pedido-header">
                <div className="pedido-info">
                  <h3>Pedido #{pedido.numero_pedido}</h3>
                  <p className="pedido-fecha">
                    {new Date(pedido.creado_en).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="pedido-status">
                  <span className={`status-badge ${getStatusColor(pedido.estado)}`}>
                    {getStatusText(pedido.estado)}
                  </span>
                </div>
              </div>

              <div className="pedido-detalles">
                <div className="productos-list">
                  <h4>Productos:</h4>
                  {pedido.pedido_detalles?.map(detalle => (
                    <div key={detalle.id} className="producto-item">
                      <div className="producto-info">
                        <span className="producto-nombre">
                          {detalle.productos?.nombre}
                        </span>
                        <span className="producto-cantidad">
                          {detalle.cantidad} x Bs. {detalle.precio_unitario}
                        </span>
                      </div>
                      <span className="producto-subtotal">
                        Bs. {detalle.subtotal}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pedido-resumen">
                  <div className="resumen-item">
                    <span>Subtotal:</span>
                    <span>Bs. {calculateTotal(pedido.pedido_detalles).toFixed(2)}</span>
                  </div>
                  <div className="resumen-item">
                    <span>IVA (13%):</span>
                    <span>Bs. {(calculateTotal(pedido.pedido_detalles) * 0.13).toFixed(2)}</span>
                  </div>
                  <div className="resumen-item total">
                    <span>Total:</span>
                    <span>Bs. {pedido.total}</span>
                  </div>
                  <div className="resumen-item">
                    <span>Método de pago:</span>
                    <span className="metodo-pago">{pedido.metodo_pago}</span>
                  </div>
                  
                  {/* Mostrar NIT/CI si está disponible */}
                  {renderNitInfo(pedido)}
                  
                  {pedido.direccion_envio && (
                    <div className="resumen-item">
                      <span>Dirección:</span>
                      <span className="direccion">{pedido.direccion_envio}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pedido-actions">
                <button
                  onClick={(e) => handleDownloadInvoice(pedido, e)}
                  className="btn-download"
                >
                  📄 Descargar Factura
                </button>
                {pedido.observacion && (
                  <div className="observaciones">
                    <strong>Observaciones:</strong> {pedido.observacion}
                  </div>
                )}
              </div>

              {/* Timeline de seguimiento */}
              <div className="seguimiento-timeline">
                <h4>Seguimiento del Pedido</h4>
                <div className="timeline">
                  <div className={`timeline-item ${pedido.estado !== 'cancelado' ? 'completed' : ''}`}>
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <span className="timeline-title">Pedido Realizado</span>
                      <span className="timeline-date">
                        {new Date(pedido.creado_en).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`timeline-item ${['confirmado', 'enviado', 'entregado'].includes(pedido.estado) ? 'completed' : ''}`}>
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <span className="timeline-title">Pedido Confirmado</span>
                      {['confirmado', 'enviado', 'entregado'].includes(pedido.estado) && (
                        <span className="timeline-date">Confirmado</span>
                      )}
                    </div>
                  </div>
                  
                  <div className={`timeline-item ${['enviado', 'entregado'].includes(pedido.estado) ? 'completed' : ''}`}>
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <span className="timeline-title">En Camino</span>
                      {['enviado', 'entregado'].includes(pedido.estado) && (
                        <span className="timeline-date">Enviado</span>
                      )}
                    </div>
                  </div>
                  
                  <div className={`timeline-item ${pedido.estado === 'entregado' ? 'completed' : ''}`}>
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <span className="timeline-title">Entregado</span>
                      {pedido.estado === 'entregado' && (
                        <span className="timeline-date">Entregado</span>
                      )}
                    </div>
                  </div>

                  {pedido.estado === 'cancelado' && (
                    <div className="timeline-item canceled">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <span className="timeline-title">Pedido Cancelado</span>
                        <span className="timeline-date">Cancelado</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MisPedidos