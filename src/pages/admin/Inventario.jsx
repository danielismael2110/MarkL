import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AdminLayout from '../../components/layout/AdminLayout'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import './css/inventario.css'

const Inventario = () => {
  const [productos, setProductos] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCompraModal, setShowCompraModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [compraData, setCompraData] = useState({
    proveedor_id: '',
    cantidad: '',
    costo_unitario: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productosRes, proveedoresRes] = await Promise.all([
        supabase
          .from('productos')
          .select('*, categorias(nombre), proveedores(nombre)')
          .order('stock', { ascending: true }),
        supabase.from('proveedores').select('*').order('nombre')
      ])

      setProductos(productosRes.data || [])
      setProveedores(proveedoresRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { status: 'agotado', color: 'bg-red-100 text-red-800' }
    if (stock < 5) return { status: 'bajo', color: 'bg-orange-100 text-orange-800' }
    if (stock < 10) return { status: 'medio', color: 'bg-yellow-100 text-yellow-800' }
    return { status: 'normal', color: 'bg-green-100 text-green-800' }
  }

  const openCompraModal = (producto) => {
    setSelectedProduct(producto)
    setCompraData({
      proveedor_id: producto.proveedor_id || '',
      cantidad: '',
      costo_unitario: ''
    })
    setShowCompraModal(true)
  }

  const handleCompraChange = (e) => {
    const { name, value } = e.target
    setCompraData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const procesarCompra = async (e) => {
    e.preventDefault()
    if (!selectedProduct) return

    try {
      // Crear la compra
      const { data: compra, error: compraError } = await supabase
        .from('compras')
        .insert([{
          proveedor_id: compraData.proveedor_id ? parseInt(compraData.proveedor_id) : null,
          total: parseFloat(compraData.costo_unitario) * parseInt(compraData.cantidad)
        }])
        .select()
        .single()

      if (compraError) throw compraError

      // Crear detalle de compra
      const { error: detalleError } = await supabase
        .from('compra_detalles')
        .insert([{
          compra_id: compra.id,
          producto_id: selectedProduct.id,
          cantidad: parseInt(compraData.cantidad),
          costo_unitario: parseFloat(compraData.costo_unitario)
        }])

      if (detalleError) throw detalleError

      // El trigger automáticamente actualizará el stock
      setShowCompraModal(false)
      setSelectedProduct(null)
      setCompraData({ proveedor_id: '', cantidad: '', costo_unitario: '' })
      
      fetchData() // Actualizar la lista
      alert('Compra registrada exitosamente. Stock actualizado.')
      
    } catch (error) {
      console.error('Error processing purchase:', error)
      alert('Error al procesar la compra: ' + error.message)
    }
  }

  const ajustarStock = async (productoId, nuevoStock) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ 
          stock: nuevoStock,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', productoId)

      if (error) throw error
      
      fetchData()
      alert('Stock ajustado correctamente')
    } catch (error) {
      console.error('Error adjusting stock:', error)
      alert('Error al ajustar el stock: ' + error.message)
    }
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
      <div className="inventario-container">
        <div className="inventario-header">
          <h1>Gestión de Inventario</h1>
        </div>

        {/* Resumen de inventario */}
        <div className="inventory-stats">
          <div className="stat-card">
            <div className="stat-icon bg-blue-500">📦</div>
            <div className="stat-info">
              <h3>{productos.length}</h3>
              <p>Total Productos</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-green-500">✅</div>
            <div className="stat-info">
              <h3>{productos.filter(p => p.stock >= 10).length}</h3>
              <p>Stock Normal</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-yellow-500">⚠️</div>
            <div className="stat-info">
              <h3>{productos.filter(p => p.stock > 0 && p.stock < 10).length}</h3>
              <p>Stock Bajo</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-red-500">❌</div>
            <div className="stat-info">
              <h3>{productos.filter(p => p.stock === 0).length}</h3>
              <p>Agotados</p>
            </div>
          </div>
        </div>

        <div className="inventario-table-container">
          <table className="inventario-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Estado</th>
                <th>Ventas Totales</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(producto => {
                const stockStatus = getStockStatus(producto.stock)
                return (
                  <tr key={producto.id} className={stockStatus.status}>
                    <td>
                      <div className="product-info">
                        <div className="product-image">
                          {producto.imagen ? (
                            <img src={producto.imagen} alt={producto.nombre} />
                          ) : (
                            <div className="no-image">🍷</div>
                          )}
                        </div>
                        <div className="product-details">
                          <div className="product-name">{producto.nombre}</div>
                          <div className="product-price">${producto.precio}</div>
                        </div>
                      </div>
                    </td>
                    <td>{producto.categorias?.nombre || 'N/A'}</td>
                    <td>
                      <div className="stock-display">
                        <span className="stock-number">{producto.stock}</span>
                        <div className="stock-actions">
                          <button
                            onClick={() => ajustarStock(producto.id, producto.stock - 1)}
                            className="stock-btn decrease"
                            disabled={producto.stock <= 0}
                          >
                            -
                          </button>
                          <button
                            onClick={() => ajustarStock(producto.id, producto.stock + 1)}
                            className="stock-btn increase"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${stockStatus.color}`}>
                        {stockStatus.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="sales-count">{producto.ventas_totales || 0}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => openCompraModal(producto)}
                          className="btn-compra"
                          title="Registrar compra"
                        >
                          📥 Comprar
                        </button>
                        <button
                          onClick={() => ajustarStock(producto.id, 0)}
                          className="btn-clear"
                          title="Limpiar stock"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Modal para registrar compra */}
        <Modal 
          isOpen={showCompraModal} 
          onClose={() => {
            setShowCompraModal(false)
            setSelectedProduct(null)
          }}
          title={`Registrar Compra - ${selectedProduct?.nombre}`}
        >
          <form onSubmit={procesarCompra} className="compra-form">
            <div className="form-group">
              <label>Proveedor</label>
              <select
                name="proveedor_id"
                value={compraData.proveedor_id}
                onChange={handleCompraChange}
                required
              >
                <option value="">Seleccionar proveedor</option>
                {proveedores.map(proveedor => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cantidad</label>
                <input
                  type="number"
                  name="cantidad"
                  value={compraData.cantidad}
                  onChange={handleCompraChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Costo Unitario</label>
                <input
                  type="number"
                  step="0.01"
                  name="costo_unitario"
                  value={compraData.costo_unitario}
                  onChange={handleCompraChange}
                  min="0"
                  required
                />
              </div>
            </div>

            {compraData.cantidad && compraData.costo_unitario && (
              <div className="compra-summary">
                <h4>Resumen de Compra</h4>
                <div className="summary-item">
                  <span>Cantidad:</span>
                  <span>{compraData.cantidad} unidades</span>
                </div>
                <div className="summary-item">
                  <span>Costo unitario:</span>
                  <span>${parseFloat(compraData.costo_unitario).toFixed(2)}</span>
                </div>
                <div className="summary-item total">
                  <span>Total:</span>
                  <span>${(parseFloat(compraData.costo_unitario) * parseInt(compraData.cantidad)).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => setShowCompraModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Registrar Compra
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}

export default Inventario