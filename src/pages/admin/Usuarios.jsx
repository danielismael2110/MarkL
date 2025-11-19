import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AdminLayout from '../../components/layout/AdminLayout'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import './css/usuarios.css'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [creatingUser, setCreatingUser] = useState(false)

  const [formData, setFormData] = useState({
    nombre_completo: '',
    telefono: '',
    direccion: '',
    rol_id: ''
  })

  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre_completo: '',
    telefono: '',
    direccion: '',
    rol_id: '3' // Por defecto cliente
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usuariosRes, rolesRes] = await Promise.all([
        supabase
          .from('perfiles')
          .select('*, roles(nombre)')
          .order('creado_en', { ascending: false }),
        supabase.from('roles').select('*')
      ])

      setUsuarios(usuariosRes.data || [])
      setRoles(rolesRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
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

  const handleNewUserInputChange = (e) => {
    const { name, value } = e.target
    setNewUserData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        const { error } = await supabase
          .from('perfiles')
          .update({
            ...formData,
            rol_id: parseInt(formData.rol_id),
            actualizado_en: new Date().toISOString()
          })
          .eq('id', editingUser.id)

        if (error) throw error
        alert('Usuario actualizado correctamente')
      }

      resetForm()
      fetchData()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Error al guardar el usuario: ' + error.message)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    
    // Validaciones
    if (newUserData.password !== newUserData.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }

    if (newUserData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setCreatingUser(true)
    
    try {
      // 1. Crear usuario en Auth de Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserData.email,
        password: newUserData.password,
        options: {
          data: {
            nombre_completo: newUserData.nombre_completo,
            telefono: newUserData.telefono,
            direccion: newUserData.direccion
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Crear perfil en la tabla perfiles
        const { error: profileError } = await supabase
          .from('perfiles')
          .insert([{
            id: authData.user.id,
            nombre_completo: newUserData.nombre_completo,
            telefono: newUserData.telefono,
            direccion: newUserData.direccion,
            rol_id: parseInt(newUserData.rol_id),
            activo: true
          }])

        if (profileError) {
          // Si hay error en el perfil, eliminar el usuario de auth
          await supabase.auth.admin.deleteUser(authData.user.id)
          throw profileError
        }

        alert('Usuario creado exitosamente. Se ha enviado un email de confirmación.')
        resetNewUserForm()
        setShowCreateModal(false)
        fetchData()
      }

    } catch (error) {
      console.error('Error creating user:', error)
      
      // Mensajes de error más específicos
      if (error.message.includes('already registered')) {
        alert('Este email ya está registrado en el sistema.')
      } else if (error.message.includes('invalid_email')) {
        alert('El formato del email no es válido.')
      } else {
        alert('Error al crear el usuario: ' + error.message)
      }
    } finally {
      setCreatingUser(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre_completo: '',
      telefono: '',
      direccion: '',
      rol_id: ''
    })
    setEditingUser(null)
  }

  const resetNewUserForm = () => {
    setNewUserData({
      email: '',
      password: '',
      confirmPassword: '',
      nombre_completo: '',
      telefono: '',
      direccion: '',
      rol_id: '3'
    })
  }

  const editUser = (usuario) => {
    setFormData({
      nombre_completo: usuario.nombre_completo,
      telefono: usuario.telefono || '',
      direccion: usuario.direccion || '',
      rol_id: usuario.rol_id.toString()
    })
    setEditingUser(usuario)
    setShowModal(true)
  }

  const toggleUserStatus = async (usuario) => {
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ 
          activo: !usuario.activo,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', usuario.id)

      if (error) throw error
      
      fetchData()
      alert(`Usuario ${!usuario.activo ? 'activado' : 'desactivado'} correctamente`)
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error al actualizar el usuario: ' + error.message)
    }
  }

  const getRoleBadge = (rolId) => {
    const role = roles.find(r => r.id === rolId)
    if (!role) return ''

    const colors = {
      admin: 'bg-red-100 text-red-800',
      cajero: 'bg-blue-100 text-blue-800',
      cliente: 'bg-green-100 text-green-800'
    }

    return colors[role.nombre] || 'bg-gray-100 text-gray-800'
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
      <div className="usuarios-container">
        <div className="usuarios-header">
          <h1>Gestión de Usuarios</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            + Agregar Usuario
          </button>
        </div>

        {/* Estadísticas */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-number">{usuarios.length}</span>
            <span className="stat-label">Total Usuarios</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{usuarios.filter(u => u.activo).length}</span>
            <span className="stat-label">Activos</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{usuarios.filter(u => u.rol_id === 1).length}</span>
            <span className="stat-label">Administradores</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{usuarios.filter(u => u.rol_id === 2).length}</span>
            <span className="stat-label">Cajeros</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{usuarios.filter(u => u.rol_id === 3).length}</span>
            <span className="stat-label">Clientes</span>
          </div>
        </div>

        <div className="usuarios-table-container">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Contacto</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(usuario => (
                <tr key={usuario.id} className={!usuario.activo ? 'inactive' : ''}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {usuario.avatar_url ? (
                          <img src={usuario.avatar_url} alt={usuario.nombre_completo} />
                        ) : (
                          <div className="avatar-placeholder">
                            {usuario.nombre_completo?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{usuario.nombre_completo}</div>
                        <div className="user-email">{usuario.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      {usuario.telefono && (
                        <div className="phone">{usuario.telefono}</div>
                      )}
                      {usuario.direccion && (
                        <div className="address" title={usuario.direccion}>
                          {usuario.direccion.substring(0, 30)}...
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${getRoleBadge(usuario.rol_id)}`}>
                      {usuario.roles?.nombre}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${usuario.activo ? 'active' : 'inactive'}`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    {new Date(usuario.creado_en).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => editUser(usuario)}
                        className="btn-edit"
                        title="Editar usuario"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => toggleUserStatus(usuario)}
                        className={`btn-status ${usuario.activo ? 'deactivate' : 'activate'}`}
                        title={usuario.activo ? 'Desactivar' : 'Activar'}
                      >
                        {usuario.activo ? '❌' : '✅'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal para editar usuario */}
        <Modal 
          isOpen={showModal} 
          onClose={() => {
            setShowModal(false)
            resetForm()
          }}
          title="Editar Usuario"
        >
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
              <label>Nombre Completo *</label>
              <input
                type="text"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <textarea
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Rol *</label>
              <select
                name="rol_id"
                value={formData.rol_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar rol</option>
                {roles.map(rol => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre} - {rol.descripcion}
                  </option>
                ))}
              </select>
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
              <button type="submit" className="btn-primary">
                Actualizar Usuario
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal para crear nuevo usuario */}
        <Modal 
          isOpen={showCreateModal} 
          onClose={() => {
            setShowCreateModal(false)
            resetNewUserForm()
          }}
          title="Crear Nuevo Usuario"
          size="large"
        >
          <form onSubmit={handleCreateUser} className="user-form">
            <div className="form-section">
              <h3>Información de Acceso</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={newUserData.email}
                    onChange={handleNewUserInputChange}
                    required
                    placeholder="usuario@ejemplo.com"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Contraseña *</label>
                  <input
                    type="password"
                    name="password"
                    value={newUserData.password}
                    onChange={handleNewUserInputChange}
                    required
                    minLength="6"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="form-group">
                  <label>Confirmar Contraseña *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={newUserData.confirmPassword}
                    onChange={handleNewUserInputChange}
                    required
                    placeholder="Repite la contraseña"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Información Personal</h3>
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre_completo"
                  value={newUserData.nombre_completo}
                  onChange={handleNewUserInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={newUserData.telefono}
                  onChange={handleNewUserInputChange}
                  placeholder="Opcional"
                />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <textarea
                  name="direccion"
                  value={newUserData.direccion}
                  onChange={handleNewUserInputChange}
                  rows="3"
                  placeholder="Dirección completa (opcional)"
                />
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select
                  name="rol_id"
                  value={newUserData.rol_id}
                  onChange={handleNewUserInputChange}
                  required
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map(rol => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre} - {rol.descripcion}
                    </option>
                  ))}
                </select>
                <small className="field-help">
                  Por defecto se asigna como Cliente. Solo cambiar si es necesario.
                </small>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => {
                  setShowCreateModal(false)
                  resetNewUserForm()
                }} 
                className="btn-secondary"
                disabled={creatingUser}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={creatingUser}
              >
                {creatingUser ? 'Creando Usuario...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}

export default Usuarios