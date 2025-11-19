import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AdminLayout from '../../components/layout/AdminLayout'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import './css/categorias.css'

const Categorias = () => {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState(null)
  const [productosCount, setProductosCount] = useState({})

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Obtener categorías
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre')

      if (categoriasError) throw categoriasError

      // Obtener conteo de productos por categoría
      const { data: productosData, error: productosError } = await supabase
        .from('productos')
        .select('categoria_id')

      if (productosError) throw productosError

      // Calcular conteos
      const counts = {}
      productosData?.forEach(producto => {
        if (producto.categoria_id) {
          counts[producto.categoria_id] = (counts[producto.categoria_id] || 0) + 1
        }
      })

      setCategorias(categoriasData || [])
      setProductosCount(counts)
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
        alert('El nombre de la categoría es requerido')
        return
      }

      if (editingCategoria) {
        const { error } = await supabase
          .from('categorias')
          .update({
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim()
          })
          .eq('id', editingCategoria.id)

        if (error) throw error
        alert('Categoría actualizada correctamente')
      } else {
        const { error } = await supabase
          .from('categorias')
          .insert([{
            nombre: formData.nombre.trim(),
            descripcion: formData.descripcion.trim()
          }])

        if (error) throw error
        alert('Categoría creada correctamente')
      }

      resetForm()
      fetchData()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Error al guardar la categoría: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: ''
    })
    setEditingCategoria(null)
  }

  const editCategoria = (categoria) => {
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || ''
    })
    setEditingCategoria(categoria)
    setShowModal(true)
  }

  const deleteCategoria = async (categoria) => {
    // Verificar si hay productos usando esta categoría
    const productosEnCategoria = productosCount[categoria.id] || 0
    
    if (productosEnCategoria > 0) {
      alert(`No se puede eliminar esta categoría porque tiene ${productosEnCategoria} producto(s) asociado(s). Primero actualiza los productos a otra categoría.`)
      return
    }

    if (!confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`)) return

    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', categoria.id)

      if (error) throw error
      
      fetchData()
      alert('Categoría eliminada correctamente')
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error al eliminar la categoría: ' + error.message)
    }
  }

  const getCategoryIcon = (categoryName) => {
    const icons = {
      'Cervezas': '🍺',
      'Vinos': '🍷',
      'Whisky': '🥃',
      'Vodka': '🍸',
      'Tequila': '🍹',
      'Ron': '🏴‍☠️',
      'Licores': '🥂',
      'Espumantes': '🍾'
    }
    
    return icons[categoryName] || '📁'
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
          <span className="ml-3">Cargando categorías...</span>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="categorias-container">
        <div className="categorias-header">
          <h1>Gestión de Categorías</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            + Nueva Categoría
          </button>
        </div>

        {/* Estadísticas */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-number">{categorias.length}</span>
            <span className="stat-label">Total Categorías</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {Object.values(productosCount).reduce((sum, count) => sum + count, 0)}
            </span>
            <span className="stat-label">Productos Categorizados</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {categorias.filter(cat => productosCount[cat.id] > 0).length}
            </span>
            <span className="stat-label">Categorías en Uso</span>
          </div>
        </div>

        <div className="categorias-grid">
          {categorias.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h3>No hay categorías</h3>
              <p>Comienza creando tu primera categoría para organizar los productos.</p>
              <button 
                onClick={() => setShowModal(true)}
                className="btn-primary"
              >
                + Crear Primera Categoría
              </button>
            </div>
          ) : (
            categorias.map(categoria => (
              <div key={categoria.id} className="categoria-card">
                <div className="categoria-header">
                  <div className="categoria-icon">
                    {getCategoryIcon(categoria.nombre)}
                  </div>
                  <div className="categoria-info">
                    <h3>{categoria.nombre}</h3>
                    <p className="productos-count">
                      {productosCount[categoria.id] || 0} producto(s)
                    </p>
                  </div>
                </div>
                
                {categoria.descripcion && (
                  <p className="categoria-desc">{categoria.descripcion}</p>
                )}

                <div className="categoria-meta">
                  <span className="fecha-creacion">
                    Creada: {new Date(categoria.creado_en).toLocaleDateString()}
                  </span>
                </div>

                <div className="categoria-actions">
                  <button 
                    onClick={() => editCategoria(categoria)}
                    className="btn-edit"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => deleteCategoria(categoria)}
                    className="btn-delete"
                    disabled={productosCount[categoria.id] > 0}
                    title={productosCount[categoria.id] > 0 ? 'No se puede eliminar: tiene productos asociados' : 'Eliminar categoría'}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal para agregar/editar categoría */}
        <Modal 
          isOpen={showModal} 
          onClose={() => {
            setShowModal(false)
            resetForm()
          }}
          title={editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
        >
          <form onSubmit={handleSubmit} className="categoria-form">
            <div className="form-group">
              <label>Nombre de la Categoría *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                placeholder="Ej: Cervezas, Vinos, Whisky..."
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describe esta categoría..."
              />
            </div>

            {editingCategoria && (
              <div className="info-box">
                <strong>Información:</strong> Esta categoría tiene {productosCount[editingCategoria.id] || 0} producto(s) asociado(s).
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
                {editingCategoria ? 'Actualizar Categoría' : 'Crear Categoría'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}

export default Categorias