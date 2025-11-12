// src/pages/auth/Dashboard.jsx
import React from 'react'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/layout/Layout'

const Dashboard = () => {
  const { profile } = useAuth()

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Mi Dashboard</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Bienvenido, {profile?.nombre_completo}
        </h2>
        <p className="text-gray-600">
          Esta es tu área personal donde puedes gestionar tus pedidos y perfil.
        </p>
      </div>
    </div>
  )
}

export default Dashboard