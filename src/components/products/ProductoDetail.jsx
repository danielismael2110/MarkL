import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import './css/productoDetail.css';

const ProductoDetail = ({ producto, onClose }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [cantidad, setCantidad] = useState(1);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (producto.stock === 0) {
      alert('Producto agotado');
      return;
    }

    if (cantidad > producto.stock) {
      alert(`Solo hay ${producto.stock} unidades disponibles`);
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
      await addToCart(producto, cantidad);
      // Producto añadido silenciosamente, sin alert
      // Opcional: cerrar el modal después de añadir
      // onClose();
    } catch (error) {
      console.error('Error añadiendo al carrito:', error);
      alert('Error al añadir el producto al carrito');
    } finally {
      setAdding(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = cantidad + change;
    if (newQuantity >= 1 && newQuantity <= producto.stock) {
      setCantidad(newQuantity);
    }
  };

  if (!producto) return null;

  return (
    <div className="producto-detail-overlay" onClick={onClose}>
      <div className="producto-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="producto-detail-content">
          <div className="producto-detail-image">
            <img 
              src={producto.imagen || '/placeholder-beer.png'} 
              alt={producto.nombre}
              onError={(e) => {
                e.target.src = '/placeholder-beer.png';
              }}
            />
          </div>
          
          <div className="producto-detail-info">
            <h1>{producto.nombre}</h1>
            <p className="producto-category">{producto.categoria}</p>
            <p className="producto-description">{producto.descripcion}</p>
            
            <div className="producto-price">
              <span>Bs. {producto.precio.toFixed(2)}</span>
            </div>
            
            <div className="producto-stock">
              {producto.stock > 0 ? (
                <span className="in-stock">✓ En stock ({producto.stock} disponibles)</span>
              ) : (
                <span className="out-of-stock">✗ Agotado</span>
              )}
            </div>

            {producto.stock > 0 && (
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <label>Cantidad:</label>
                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={cantidad <= 1}
                    >
                      -
                    </button>
                    <span>{cantidad}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      disabled={cantidad >= producto.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="add-to-cart-btn"
                >
                  {adding ? 'Añadiendo...' : `Añadir al Carrito - Bs. ${(producto.precio * cantidad).toFixed(2)}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetail;