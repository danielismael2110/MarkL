import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AdminLayout from '../../components/layout/AdminLayout'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import './css/proveedores.css'

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState(null)
  const [productosCount, setProductosCount] = useState({})
  const [comprasCount, setComprasCount] = useState({})

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Obtener proveedores
      const { data: proveedoresData, error: proveedoresError } = await supabase
        .from('proveedores')
        .select('*')
        .order('nombre')

      if (proveedoresError) throw proveedoresError

      // Obtener conteo de productos por proveedor
      const { data: productosData, error: productosError } = await supabase
        .from('productos')
        .select('proveedor_id')

      if (productosError) throw productosError

      // Obtener conteo de compras por proveedor
      const { data: comprasData, error: comprasError } = await supabase
        .from('compras')
        .select('proveedor_id, total')

      if (comprasError) throw comprasError

      // Calcular conteos de productos
      const productosCounts = {}
      productosData?.forEach(producto => {
        if (producto.proveedor_id) {
          productosCounts[producto.proveedor_id] = (productosCounts[producto.proveedor_id] || 0) + 1
        }
      })

      // Calcular total de compras por proveedor
      const comprasCounts = {}
      comprasData?.forEach(compra => {
        if (compra.proveedor_id) {
          comprasCounts[compra.proveedor_id] = (comprasCounts[compra.proveedor_id] || 0) + (compra.total || 0)
        }
      })

      setProveedores(proveedoresData || [])
      setProductosCount(productosCounts)
      setComprasCount(comprasCounts)
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Error al cargar los datos: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!formData.nombre.trim()) {
        alert('El nombre del proveedor es requerido')
        return
      }

      const proveedorData = {
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        email: formData.email.trim(),
        direccion: formData.direccion.trim()
      }

      if (editingProveedor) {
        const { error } = await supabase
          .from('proveedores')
          .update(proveedorData)
          .eq('id', editingProveedor.id)

        if (error) throw error
        alert('Proveedor actualizado correctamente')
      } else {
        const { error } = await supabase
          .from('proveedores')
          .insert([proveedorData])

        if (error) throw error
        alert('Proveedor creado correctamente')
      }

      resetForm()
      fetchData()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving supplier:', error)
      alert('Error al guardar el proveedor: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      telefono: '',
      email: '',
      direccion: ''
    })
    setEditingProveedor(null)
  }

  const editProveedor = (proveedor) => {
    setFormData({
      nombre: proveedor.nombre,
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
      direccion: proveedor.direccion || ''
    })
    setEditingProveedor(proveedor)
    setShowModal(true)
  }

  const deleteProveedor = async (proveedor) => {
    // Verificar si hay productos usando este proveedor
    const productosConProveedor = productosCount[proveedor.id] || 0
    
    if (productosConProveedor > 0) {
      alert(`No se puede eliminar este proveedor porque tiene ${productosConProveedor} producto(s) asociado(s). Primero actualiza los productos a otro proveedor.`)
      return
    }

    if (!confirm(`¿Estás seguro de eliminar el proveedor "${proveedor.nombre}"? Esta acción no se puede deshacer.`)) return

    try {
      const { error } = await supabase
        .from('proveedores')
        .delete()
        .eq('id', proveedor.id)

      if (error) throw error
      
      fetchData()
      alert('Proveedor eliminado correctamente')
    } catch (error) {
      console.error('Error deleting supplier:', error)
      alert('Error al eliminar el proveedor: ' + error.message)
    }
  }

  const getTotalCompras = (proveedorId) => {
    return comprasCount[proveedorId] || 0
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
          <span className="ml-3">Cargando proveedores...</span>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="proveedores-container">
        <div className="proveedores-header">
          <h1>Gestión de Proveedores</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            + Nuevo Proveedor
          </button>
        </div>

        {/* Estadísticas */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-number">{proveedores.length}</span>
            <span className="stat-label">Total Proveedores</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {Object.values(productosCount).reduce((sum, count) => sum + count, 0)}
            </span>
            <span className="stat-label">Productos Proveídos</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              ${Object.values(comprasCount).reduce((sum, total) => sum + total, 0).toFixed(2)}
            </span>
            <span className="stat-label">Total en Compras</span>
          </div>
        </div>

        <div className="proveedores-grid">
          {proveedores.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏢</div>
              <h3>No hay proveedores</h3>
              <p>Comienza registrando tu primer proveedor.</p>
              <button 
                onClick={() => setShowModal(true)}
                className="btn-primary"
              >
                + Registrar Primer Proveedor
              </button>
            </div>
          ) : (
            proveedores.map(proveedor => (
              <div key={proveedor.id} className="proveedor-card">
                <div className="proveedor-header">
                  <div className="proveedor-icon">
                    🏢
                  </div>
                  <div className="proveedor-info">
                    <h3>{proveedor.nombre}</h3>
                    <div className="proveedor-stats">
                      <span className="productos-count">
                        {productosCount[proveedor.id] || 0} producto(s)
                      </span>
                      <span className="compras-total">
                        ${getTotalCompras(proveedor.id).toFixed(2)} en compras
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="proveedor-contacto">
                  {proveedor.telefono && (
                    <div className="contacto-item">
                      <span className="contacto-label">📞 Teléfono:</span>
                      <span>{proveedor.telefono}</span>
                    </div>
                  )}
                  {proveedor.email && (
                    <div className="contacto-item">
                      <span className="contacto-label">📧 Email:</span>
                      <span>{proveedor.email}</span>
                    </div>
                  )}
                  {proveedor.direccion && (
                    <div className="contacto-item">
                      <span className="contacto-label">📍 Dirección:</span>
                      <span className="direccion">{proveedor.direccion}</span>
                    </div>
                  )}
                </div>

                <div className="proveedor-meta">
                  <span className="fecha-registro">
                    Registrado: {new Date(proveedor.creado_en).toLocaleDateString()}
                  </span>
                </div>

                <div className="proveedor-actions">
                  <button 
                    onClick={() => editProveedor(proveedor)}
                    className="btn-edit"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => deleteProveedor(proveedor)}
                    className="btn-delete"
                    disabled={productosCount[proveedor.id] > 0}
                    title={productosCount[proveedor.id] > 0 ? 'No se puede eliminar: tiene productos asociados' : 'Eliminar proveedor'}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal para agregar/editar proveedor */}
        <Modal 
          isOpen={showModal} 
          onClose={() => {
            setShowModal(false)
            resetForm()
          }}
          title={editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          size="large"
        >
          <form onSubmit={handleSubmit} className="proveedor-form">
            <div className="form-group">
              <label>Nombre del Proveedor *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                placeholder="Ej: Distribuidora Andes, Vinos del Valle..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="Número de contacto"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="correo@proveedor.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <textarea
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                rows="3"
                placeholder="Dirección completa del proveedor..."
              />
            </div>

            {editingProveedor && (
              <div className="info-box">
                <strong>Información:</strong> Este proveedor tiene {productosCount[editingProveedor.id] || 0} producto(s) asociado(s) y 
                un total de ${getTotalCompras(editingProveedor.id).toFixed(2)} en compras registradas.
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }} 
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {editingProveedor ? 'Actualizar Proveedor' : 'Crear Proveedor'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}

export default Proveedores