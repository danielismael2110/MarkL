import React from 'react';
import { useCart } from '../../context/CartContext';
import './css/cartItem.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.stock) {
      alert(`Solo hay ${item.stock} unidades disponibles`);
      return;
    }
    updateQuantity(item.producto_id, newQuantity);
  };

  const handleRemove = () => {
    removeFromCart(item.producto_id);
  };

  const subtotal = item.precio_unitario * item.cantidad;

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <img 
          src={item.imagen || '/placeholder-beer.png'} 
          alt={item.nombre}
          onError={(e) => {
            e.target.src = '/placeholder-beer.png';
          }}
        />
      </div>
      
      <div className="cart-item-details">
        <h3 className="cart-item-name">{item.nombre}</h3>
        <p className="cart-item-price">Bs. {item.precio_unitario.toFixed(2)}</p>
        <p className="cart-item-stock">Stock disponible: {item.stock}</p>
      </div>

      <div className="cart-item-controls">
        <div className="quantity-controls">
          <button
            type="button"
            onClick={() => handleQuantityChange(item.cantidad - 1)}
            disabled={item.cantidad <= 1}
            className="quantity-btn"
          >
            -
          </button>
          
          <span className="quantity-display">{item.cantidad}</span>
          
          <button
            type="button"
            onClick={() => handleQuantityChange(item.cantidad + 1)}
            disabled={item.cantidad >= item.stock}
            className="quantity-btn"
          >
            +
          </button>
        </div>

        <div className="cart-item-subtotal">
          Bs. {subtotal.toFixed(2)}
        </div>

        <button
          type="button"
          onClick={handleRemove}
          className="remove-btn"
          aria-label="Eliminar producto"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default CartItem;