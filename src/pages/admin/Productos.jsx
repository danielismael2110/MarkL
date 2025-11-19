import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AdminLayout from '../../components/layout/AdminLayout'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import './css/productos.css'

const Productos = () => {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria_id: '',
    proveedor_id: '',
    imagen: null
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productosRes, categoriasRes, proveedoresRes] = await Promise.all([
        supabase.from('productos').select('*, categorias(nombre), proveedores(nombre)').order('id', { ascending: true }),
        supabase.from('categorias').select('*').order('nombre'),
        supabase.from('proveedores').select('*').order('nombre')
      ])

      if (productosRes.error) throw productosRes.error
      if (categoriasRes.error) throw categoriasRes.error
      if (proveedoresRes.error) throw proveedoresRes.error

      setProductos(productosRes.data || [])
      setCategorias(categoriasRes.data || [])
      setProveedores(proveedoresRes.data || [])
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validaciones
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPEG, PNG, WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const filePath = fileName

      console.log('Subiendo imagen:', filePath)

      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error de subida:', uploadError)
        throw new Error(`Error al subir la imagen: ${uploadError.message}`)
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('productos')
        .getPublicUrl(filePath)

      console.log('Imagen subida correctamente:', publicUrl)

      setFormData(prev => ({ ...prev, imagen: publicUrl }))
      
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(`Error al subir la imagen: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Validar datos requeridos
      if (!formData.nombre || !formData.precio || !formData.stock) {
        alert('Por favor completa los campos requeridos: Nombre, Precio y Stock')
        return
      }

      const productData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : null,
        proveedor_id: formData.proveedor_id ? parseInt(formData.proveedor_id) : null,
        actualizado_en: new Date().toISOString()
      }

      // Solo incluir imagen si se subió una nueva
      if (formData.imagen) {
        productData.imagen = formData.imagen
      }

      console.log('Guardando producto:', productData)

      let result
      if (editingProduct) {
        result = await supabase
          .from('productos')
          .update(productData)
          .eq('id', editingProduct.id)
      } else {
        result = await supabase
          .from('productos')
          .insert([productData])
      }

      if (result.error) {
        console.error('Error de Supabase:', result.error)
        throw result.error
      }

      console.log('Producto guardado exitosamente')
      resetForm()
      fetchData()
      setShowModal(false)
      alert(editingProduct ? 'Producto actualizado correctamente' : 'Producto creado correctamente')
      
    } catch (error) {
      console.error('Error saving product:', error)
      alert(`Error al guardar el producto: ${error.message}`)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoria_id: '',
      proveedor_id: '',
      imagen: null
    })
    setEditingProduct(null)
  }

  const editProduct = (product) => {
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      precio: product.precio,
      stock: product.stock,
      categoria_id: product.categoria_id || '',
      proveedor_id: product.proveedor_id || '',
      imagen: product.imagen
    })
    setEditingProduct(product)
    setShowModal(true)
  }

  const toggleProductStatus = async (product) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ 
          activo: !product.activo,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', product.id)

      if (error) throw error
      
      fetchData()
      alert(`Producto ${!product.activo ? 'activado' : 'desactivado'} correctamente`)
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Error al actualizar el producto: ' + error.message)
    }
  }

  const deleteProduct = async (productId) => {
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) return

    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', productId)

      if (error) throw error
      
      fetchData()
      alert('Producto eliminado correctamente')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error al eliminar el producto: ' + error.message)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imagen: null }))
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
          <span className="ml-3">Cargando productos...</span>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="productos-container">
        <div className="productos-header">
          <h1>Gestión de Productos</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            + Agregar Producto
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-number">{productos.length}</span>
            <span className="stat-label">Total Productos</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{productos.filter(p => p.activo).length}</span>
            <span className="stat-label">Activos</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{productos.filter(p => p.stock < 10).length}</span>
            <span className="stat-label">Stock Bajo</span>
          </div>
        </div>

        <div className="productos-grid">
          {productos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍷</div>
              <h3>No hay productos</h3>
              <p>Comienza agregando tu primer producto.</p>
              <button 
                onClick={() => setShowModal(true)}
                className="btn-primary"
              >
                + Agregar Primer Producto
              </button>
            </div>
          ) : (
            productos.map(producto => (
              <div key={producto.id} className={`producto-card ${!producto.activo ? 'inactive' : ''}`}>
                <div className="producto-image">
                  {producto.imagen ? (
                    <img src={producto.imagen} alt={producto.nombre} />
                  ) : (
                    <div className="no-image">🍷</div>
                  )}
                  <div className={`status-badge ${producto.activo ? 'active' : 'inactive'}`}>
                    {producto.activo ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
                
                <div className="producto-info">
                  <h3>{producto.nombre}</h3>
                  <p className="producto-desc">{producto.descripcion}</p>
                  <div className="producto-details">
                    <span className="price">${producto.precio}</span>
                    <span className={`stock ${producto.stock < 10 ? 'low-stock' : ''}`}>
                      Stock: {producto.stock}
                    </span>
                  </div>
                  <div className="producto-meta">
                    <span className="category">{producto.categorias?.nombre || 'Sin categoría'}</span>
                    <span className="sales">Ventas: {producto.ventas_totales || 0}</span>
                  </div>
                </div>

                <div className="producto-actions">
                  <button 
                    onClick={() => editProduct(producto)}
                    className="btn-edit"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => toggleProductStatus(producto)}
                    className={`btn-status ${producto.activo ? 'deactivate' : 'activate'}`}
                  >
                    {producto.activo ? '❌ Desactivar' : '✅ Activar'}
                  </button>
                  <button 
                    onClick={() => deleteProduct(producto.id)}
                    className="btn-delete"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal para agregar/editar producto */}
        <Modal 
          isOpen={showModal} 
          onClose={() => {
            setShowModal(false)
            resetForm()
          }}
          title={editingProduct ? 'Editar Producto' : 'Agregar Producto'}
          size="large"
        >
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label>Nombre del Producto *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                placeholder="Ej: Cerveza Paceña 620ml"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describe el producto..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Precio *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Stock *</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoría</label>
                <select
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Proveedor</label>
                <select
                  name="proveedor_id"
                  value={formData.proveedor_id}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map(prov => (
                    <option key={prov.id} value={prov.id}>
                      {prov.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Imagen del Producto</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="file-input"
              />
              <small className="file-help">
                Formatos aceptados: JPEG, PNG, WebP. Tamaño máximo: 5MB
              </small>
              
              {uploading && (
                <div className="uploading-message">
                  <LoadingSpinner />
                  <span>Subiendo imagen...</span>
                </div>
              )}
              
              {formData.imagen && (
                <div className="image-preview">
                  <p>Vista previa:</p>
                  <img src={formData.imagen} alt="Preview" className="preview-image" />
                  <button 
                    type="button" 
                    onClick={removeImage}
                    className="remove-image-btn"
                  >
                    ✕ Remover imagen
                  </button>
                </div>
              )}
            </div>

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
              <button 
                type="submit" 
                className="btn-primary"
                disabled={uploading}
              >
                {uploading ? 'Subiendo...' : editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}

export default Productos