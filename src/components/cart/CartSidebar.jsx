import React from 'react';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import './css/cartSidebar.css';

const CartSidebar = ({ isOpen, onClose, onCheckout }) => {
  const { items, subtotal, iva, total, itemCount, clearCart } = useCart();

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="cart-sidebar-overlay" onClick={handleOverlayClick}>
      <div className="cart-sidebar">
        <div className="cart-sidebar-header">
          <h2>Tu Carrito ({itemCount})</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="cart-sidebar-content">
          {items.length === 0 ? (
            <div className="empty-cart">
              <p>Tu carrito está vacío</p>
              <span>¡Agrega algunos productos!</span>
            </div>
          ) : (
            <>
              <div className="cart-items-list">
                {items.map(item => (
                  <CartItem key={item.producto_id} item={item} />
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>Bs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>IVA (13%):</span>
                  <span>Bs. {iva.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>Bs. {total.toFixed(2)}</span>
                </div>

                <div className="cart-actions">
                  <button 
                    onClick={onCheckout}
                    className="checkout-btn"
                    disabled={items.length === 0}
                  >
                    Proceder al Pago
                  </button>
                  
                  <button 
                    onClick={clearCart}
                    className="clear-cart-btn"
                    disabled={items.length === 0}
                  >
                    Vaciar Carrito
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;