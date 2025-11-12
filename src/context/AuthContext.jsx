import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verifica si hay sesión activa
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) await fetchProfile(session.user.id)
      setLoading(false)
    }

    fetchSession()

    // Escucha cambios en la sesión (login/logout)
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
      .select('id, nombre_completo, rol_id, avatar_url')
      .eq('id', id)
      .single()

    if (!error) setProfile(data)
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

  const register = async (email, password, nombreCompleto) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre_completo: nombreCompleto } }
    })
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
