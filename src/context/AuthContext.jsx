import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) await fetchProfile(session.user.id)
      setLoading(false)
    }

    fetchSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const fetchProfile = async (id) => {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', id)
      .single()

    if (!error) {
      // FIX: Si los datos vienen como string JSON, los parseamos
      let fixedProfile = { ...data }
      
      if (typeof data.nombre_completo === 'string' && data.nombre_completo.startsWith('{')) {
        try {
          const parsed = JSON.parse(data.nombre_completo)
          fixedProfile = {
            ...data,
            nombre_completo: parsed.nombre_completo || data.nombre_completo,
            telefono: parsed.telefono || data.telefono,
            direccion: parsed.direccion || data.direccion
          }
        } catch (e) {
          console.log('No se pudo parsear el perfil:', e)
        }
      }
      
      setProfile(fixedProfile)
    }
  }

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  // FIX: Función de registro ACTUALIZADA
  const register = async (email, password, nombreCompleto, telefono = '', direccion = '') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          nombre_completo: nombreCompleto,
          telefono: telefono,
          direccion: direccion
        } 
      }
    })
    if (error) throw error
    return data
  }

  const updateProfile = async (profileData) => {
    const { data, error } = await supabase
      .from('perfiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single()

    if (!error) {
      setProfile(data)
      setMessage('Perfil actualizado correctamente')
    }
    return { data, error }
  }

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) setMessage('Contraseña actualizada correctamente')
    return { error }
  }

  const uploadAvatar = async (file) => {
    try {
      setAvatarLoading(true)
      setError('')
      setMessage('')

      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen (JPEG, PNG, WebP)')
      }
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('La imagen debe ser menor a 2MB')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `avatar.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, cacheControl: '3600' })

      if (uploadError) throw new Error(`Error al subir: ${uploadError.message}`)

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('perfiles')
        .update({ 
          avatar_url: publicUrl,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw new Error(`Error al guardar en perfil: ${updateError.message}`)

      setProfile(prev => ({ 
        ...prev, 
        avatar_url: publicUrl + '?t=' + new Date().getTime()
      }))

      setMessage('Foto de perfil actualizada correctamente')
      return publicUrl

    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setAvatarLoading(false)
    }
  }

  const fetchUserOrders = async () => {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        pedido_detalles (
          *,
          productos (*)
        )
      `)
      .eq('cliente_id', user.id)
      .order('creado_en', { ascending: false })
      .limit(5)

    return { data, error }
  }

  // Función para limpiar mensajes
  const clearMessages = () => {
    setError('')
    setMessage('')
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      avatarLoading,
      error,
      message,
      login, 
      logout, 
      register,
      updateProfile,
      updatePassword,
      uploadAvatar,
      fetchUserOrders,
      clearMessages
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)