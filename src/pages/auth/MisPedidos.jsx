import React from 'react'

const MisPedidos = () => {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes pedidos aún
          </h3>
          <p className="text-gray-600">
            Cuando realices tu primer pedido, aparecerá aquí.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MisPedidos
