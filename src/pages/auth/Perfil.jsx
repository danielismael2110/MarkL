import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const Perfil = () => {
  const { user, profile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    nombre_completo: profile?.nombre_completo || '',
    telefono: profile?.telefono || '',
    direccion: profile?.direccion || ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const { error } = await updateProfile(formData)
      if (error) throw error
      setMessage('Perfil actualizado correctamente')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                El email no se puede modificar
              </p>
            </div>

            <Input
              label="Nombre Completo"
              type="text"
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              required
              placeholder="Tu nombre completo"
            />

            <Input
              label="Teléfono"
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+591 71234567"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <textarea
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tu dirección completa"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Actualizar Perfil'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Perfil