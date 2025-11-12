import React from 'react';
import ProductoCard from './ProductoCard';
import './css/productoGrid.css';

const ProductoGrid = ({ productos, onViewDetails, loading = false }) => {
  if (loading) {
    return (
      <div className="producto-grid-loading">
        <div className="loading-spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (!productos || productos.length === 0) {
    return (
      <div className="producto-grid-empty">
        <p>No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div className="producto-grid">
      {productos.map((producto) => (
        <ProductoCard
          key={producto.id}
          producto={producto}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default ProductoGrid;