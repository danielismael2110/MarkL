// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabaseClient'
import { authService } from '../services/supabase/auth'

const AuthContext = createContext({})

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Obtener sesión inicial
    getSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        
        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const getSession = async () => {
    try {
      const { session } = await authService.getSession()
      setSession(session)
      
      if (session?.user) {
        setUser(session.user)
        await loadProfile(session.user.id)
      }
    } catch (error) {
      console.error('Error getting session:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProfile = async (userId) => {
    try {
      const { data, error } = await authService.getProfile(userId)
      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const signUp = async (email, password, userData) => {
    setLoading(true)
    try {
      const { data, error } = await authService.signUp(email, password, userData)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await authService.signIn(email, password)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await authService.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      const { data, error } = await authService.resetPassword(email)
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
    isAdmin: profile?.roles?.nombre === 'admin',
    isCajero: profile?.roles?.nombre === 'cajero',
    isCliente: profile?.roles?.nombre === 'cliente'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}