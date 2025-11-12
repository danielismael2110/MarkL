import React from 'react'
import { useAuth } from '../../context/AuthContext'

const AdminDashboard = () => {
  const { profile } = useAuth()

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Panel de Administración
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {profile?.nombre_completo}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ventas Hoy</p>
              <p className="text-2xl font-bold">Bs. 0</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">📦</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pedidos Activos</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">🍷</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Productos</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Clientes</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold mb-4">Resumen del Sistema</h2>
        <p className="text-gray-600">
          Esta es la vista general del panel de administración. Aquí podrás ver estadísticas, 
          gestionar productos, pedidos, ventas y usuarios del sistema.
        </p>
      </div>
    </div>
  )
}

export default AdminDashboard