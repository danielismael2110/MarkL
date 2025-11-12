// src/services/supabase/auth.js
import { supabase } from '../../../lib/supabaseClient'

export const authService = {
  // Registro de usuario
  async signUp(email, password, userData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre_completo: userData.nombre_completo,
            telefono: userData.telefono
          }
        }
      })

      if (authError) throw authError

      // Si el registro fue exitoso, crear perfil
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('perfiles')
          .insert([
            {
              id: authData.user.id,
              nombre_completo: userData.nombre_completo,
              telefono: userData.telefono,
              direccion: userData.direccion,
              rol_id: 3 // cliente por defecto
            }
          ])

        if (profileError) throw profileError
      }

      return { data: authData, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Inicio de sesión
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Cerrar sesión
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error }
    }
  },

  // Obtener sesión actual
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      return { session, error }
    } catch (error) {
      return { session: null, error }
    }
  },

  // Obtener perfil de usuario
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select(`
          *,
          roles (*)
        `)
        .eq('id', userId)
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Restablecer contraseña
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email)
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Actualizar contraseña
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}