import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { ShoppingCart, Eye, Loader, Package, Star } from 'lucide-react';
import './css/productoCard.css';

const ProductoCard = ({ producto, onViewDetails }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    if (producto.stock === 0) {
      alert('Producto agotado');
      return;
    }

    // Verificar si el usuario está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Redirección directa al login sin mensaje
      navigate('/login');
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

  const formatPrice = (price) => {
    return `Bs. ${parseFloat(price).toFixed(2)}`;
  };

  const getStockText = (stock) => {
    if (stock > 10) return `${stock} disponibles`;
    if (stock > 5) return `${stock} disponibles`;
    if (stock > 0) return `${stock} disponibles`;
    return 'Agotado';
  };

  const getStockClass = (stock) => {
    if (stock > 10) return 'stock-high';
    if (stock > 5) return 'stock-medium';
    if (stock > 0) return 'stock-low';
    return 'stock-out';
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="producto-card">
      {/* Imagen del producto */}
      <div className="producto-image-container">
        <img
          src={imageError ? '/placeholder-beer.png' : (producto.imagen || '/placeholder-beer.png')}
          alt={producto.nombre}
          onError={handleImageError}
          className="producto-image"
          loading="lazy"
        />
        
        {/* Badges superpuestos */}
        <div className="card-badges">
          {producto.stock === 0 && (
            <span className="badge badge-out">
              Agotado
            </span>
          )}
          {producto.ventas_totales > 50 && producto.stock > 0 && (
            <span className="badge badge-popular">
              <Star size={12} />
              Popular
            </span>
          )}
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="producto-content">
        {/* Información del producto */}
        <div className="producto-info">
          <span className="producto-category">{producto.categoria}</span>
          <h3 className="producto-name">{producto.nombre}</h3>
          <p className="producto-description">
            {producto.descripcion?.substring(0, 80)}...
          </p>
        </div>

        {/* Precio y stock */}
        <div className="producto-meta">
          <div className="price-section">
            <span className="producto-price">{formatPrice(producto.precio)}</span>
          </div>
          <div className="stock-section">
            <span className={`stock-info ${getStockClass(producto.stock)}`}>
              <Package size={14} />
              {getStockText(producto.stock)}
            </span>
          </div>
        </div>

        {/* BOTONES EN COLUMNA - CORREGIDO */}
        <div className="producto-actions">
          {/* Botón Añadir al Carrito (ARRIBA) */}
          <button
            onClick={handleAddToCart}
            disabled={adding || producto.stock === 0}
            className={`btn btn-primary ${adding ? 'loading' : ''}`}
          >
            {adding ? (
              <>
                <Loader className="btn-spinner" size={16} />
                <span>Añadiendo...</span>
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Añadir al carrito</span>
              </>
            )}
          </button>

          {/* Botón Ver Detalles (ABAJO) */}
          <button
            onClick={() => onViewDetails(producto)}
            className="btn btn-secondary"
          >
            <Eye size={16} />
            <span>Ver detalles</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoCard;