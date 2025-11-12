import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import './css/productoCard.css';

const ProductoCard = ({ producto, onViewDetails }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (producto.stock === 0) {
      alert('Producto agotado');
      return;
    }

    setAdding(true);
    try {
      await addToCart(producto, 1);
    } catch (error) {
      console.error('Error añadiendo al carrito:', error);
      alert('Error al añadir el producto al carrito');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="producto-card">
      <div className="producto-image">
        <img
          src={producto.imagen || '/placeholder-beer.png'}
          alt={producto.nombre}
          onError={(e) => (e.target.src = '/placeholder-beer.png')}
        />
        {producto.stock === 0 && (
          <div className="out-of-stock-badge">Agotado</div>
        )}
      </div>

      <div className="producto-info">
        <h3 className="producto-name">{producto.nombre}</h3>
        <p className="producto-category">{producto.categoria}</p>
        <p className="producto-description">
          {producto.descripcion?.substring(0, 100)}...
        </p>

        <div className="producto-price-stock">
          <span className="producto-price">Bs. {producto.precio.toFixed(2)}</span>
          <span className="producto-stock">
            {producto.stock > 0
              ? `${producto.stock} disponibles`
              : 'Sin stock'}
          </span>
        </div>

        <div className="producto-actions">
          <button
            onClick={handleAddToCart}
            disabled={adding || producto.stock === 0}
            className="add-to-cart-btn"
          >
            {adding ? 'Añadiendo...' : 'Añadir al Carrito'}
          </button>

          <button
            onClick={() => onViewDetails(producto)}
            className="view-details-btn"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoCard;
