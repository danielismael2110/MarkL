import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AdminLayout from '../../components/layout/AdminLayout'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import './css/ventas.css'

const Ventas = () => {
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCliente, setSelectedCliente] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [processingSale, setProcessingSale] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productosRes, clientesRes] = await Promise.all([
        supabase.from('productos').select('*').eq('activo', true).gt('stock', 0),
        supabase.from('perfiles').select('id, nombre_completo, telefono').eq('rol_id', 3)
      ])

      setProductos(productosRes.data || [])
      setClientes(clientesRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const agregarAlCarrito = (producto) => {
    const existente = carrito.find(item => item.id === producto.id)
    
    if (existente) {
      if (existente.cantidad >= producto.stock) {
        alert('No hay suficiente stock disponible')
        return
      }
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      if (producto.stock < 1) {
        alert('No hay stock disponible')
        return
      }
      setCarrito([...carrito, {
        ...producto,
        cantidad: 1
      }])
    }
  }

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      eliminarDelCarrito(productoId)
      return
    }

    const producto = productos.find(p => p.id === productoId)
    if (nuevaCantidad > producto.stock) {
      alert('No hay suficiente stock disponible')
      return
    }

    setCarrito(carrito.map(item =>
      item.id === productoId
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ))
  }

  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.id !== productoId))
  }

  const getTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0)
  }

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      alert('Agrega productos al carrito para realizar una venta')
      return
    }

    setProcessingSale(true)
    try {
      const total = getTotal()
      
      // Crear la venta
      const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .insert([{
          cliente_id: selectedCliente || null,
          cajero_id: (await supabase.auth.getUser()).data.user?.id,
          total: total,
          metodo_pago: metodoPago
        }])
        .select()
        .single()

      if (ventaError) throw ventaError

      // Crear los detalles de la venta
      const detallesVenta = carrito.map(item => ({
        venta_id: venta.id,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio
      }))

      const { error: detallesError } = await supabase
        .from('venta_detalles')
        .insert(detallesVenta)

      if (detallesError) throw detallesError

      // Limpiar carrito y mostrar éxito
      setCarrito([])
      setSelectedCliente('')
      setMetodoPago('efectivo')
      
      alert(`¡Venta realizada exitosamente! Total: $${total.toFixed(2)}`)
      fetchData() // Actualizar stock
      
    } catch (error) {
      console.error('Error processing sale:', error)
      alert('Error al procesar la venta: ' + error.message)
    } finally {
      setProcessingSale(false)
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
      <div className="ventas-container">
        <div className="ventas-header">
          <h1>Punto de Venta (POS)</h1>
          <div className="sale-info">
            <div className="total-display">
              Total: <span>${getTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="pos-layout">
          {/* Panel de productos */}
          <div className="products-panel">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="products-grid">
              {productosFiltrados.map(producto => (
                <div
                  key={producto.id}
                  className="product-item"
                  onClick={() => agregarAlCarrito(producto)}
                >
                  <div className="product-image">
                    {producto.imagen ? (
                      <img src={producto.imagen} alt={producto.nombre} />
                    ) : (
                      <div className="no-image">🍷</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h4>{producto.nombre}</h4>
                    <p className="product-price">${producto.precio}</p>
                    <p className="product-stock">Stock: {producto.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel del carrito */}
          <div className="cart-panel">
            <div className="cart-header">
              <h3>Carrito de Venta</h3>
              <span className="items-count">{carrito.length} items</span>
            </div>

            <div className="cart-items">
              {carrito.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-icon">🛒</div>
                  <p>El carrito está vacío</p>
                </div>
              ) : (
                carrito.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <h5>{item.nombre}</h5>
                      <p className="item-price">${item.precio} c/u</p>
                    </div>
                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button
                          onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                          className="qty-btn"
                        >
                          -
                        </button>
                        <span className="quantity">{item.cantidad}</span>
                        <button
                          onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                          className="qty-btn"
                          disabled={item.cantidad >= item.stock}
                        >
                          +
                        </button>
                      </div>
                      <div className="item-total">
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </div>
                      <button
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="remove-btn"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="sale-options">
              <div className="form-group">
                <label>Cliente (opcional)</label>
                <select
                  value={selectedCliente}
                  onChange={(e) => setSelectedCliente(e.target.value)}
                >
                  <option value="">Venta general</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre_completo} - {cliente.telefono}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Método de Pago</label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
            </div>

            <button
              onClick={procesarVenta}
              disabled={carrito.length === 0 || processingSale}
              className="process-sale-btn"
            >
              {processingSale ? 'Procesando...' : `Realizar Venta - $${getTotal().toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Ventas