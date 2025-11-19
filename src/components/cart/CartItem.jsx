import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import './css/cartItem.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [quantity, setQuantity] = useState(item.cantidad);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.stock) {
      alert(`Solo hay ${item.stock} unidades disponibles`);
      return;
    }

    try {
      updateQuantity(item.producto_id, newQuantity);
      setQuantity(newQuantity);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRemove = () => {
    if (window.confirm('¿Estás seguro de eliminar este producto del carrito?')) {
      removeFromCart(item.producto_id);
    }
  };

  const subtotal = item.precio_unitario * item.cantidad;

  return (
    <div className="cart-item">
      <div className="item-image">
        {item.imagen ? (
          <img src={item.imagen} alt={item.nombre} />
        ) : (
          <div className="no-image">🍷</div>
        )}
      </div>

      <div className="item-details">
        <h3 className="item-name">{item.nombre}</h3>
        <p className="item-price">Bs. {item.precio_unitario.toFixed(2)}</p>
        <p className="item-stock">Stock disponible: {item.stock}</p>
      </div>

      <div className="item-controls">
        <div className="quantity-controls">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            className="quantity-btn"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="quantity">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            className="quantity-btn"
            disabled={quantity >= item.stock}
          >
            +
          </button>
        </div>

        <div className="item-subtotal">
          Bs. {subtotal.toFixed(2)}
        </div>

        <button
          onClick={handleRemove}
          className="remove-btn"
          title="Eliminar producto"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default CartItem;