// src/pages/public/Logout.jsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

const Logout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const logout = async () => {
      try {
        console.log('🔐 Cerrando sesión...')
        await supabase.auth.signOut()
        localStorage.clear()
        console.log('✅ Sesión cerrada')
        navigate('/')
        window.location.reload()
      } catch (error) {
        console.error('Error:', error)
        navigate('/')
        window.location.reload()
      }
    }

    logout()
  }, [navigate])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <h2>Cerrando sesión...</h2>
      <p>Serás redirigido al inicio</p>
    </div>
  )
}

export default Logout