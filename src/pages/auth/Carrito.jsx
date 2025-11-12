import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import CartItem from '../../components/cart/CartItem';
import CheckoutForm from '../../components/cart/CheckoutForm';
import './css/carrito.css';

const Carrito = () => {
  const { items, subtotal, iva, total, itemCount, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (pedido) => {
    setOrderSuccess(pedido);
    setShowCheckout(false);
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
  };

  const handleContinueShopping = () => {
    setOrderSuccess(null);
  };

  if (orderSuccess) {
    return (
      <div className="carrito-container">
        <div className="order-success">
          <div className="success-icon">✅</div>
          <h1>¡Pedido Realizado con Éxito!</h1>
          <p>Tu pedido <strong>{orderSuccess.numero_pedido}</strong> ha sido procesado correctamente.</p>
          <p>Total: <strong>Bs. {orderSuccess.total.toFixed(2)}</strong></p>
          <p>Te contactaremos pronto para coordinar la entrega.</p>
          <button onClick={handleContinueShopping} className="continue-btn">
            Seguir Comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <div className="carrito-header">
        <h1>Mi Carrito de Compras</h1>
        <p>Revisa y gestiona tus productos</p>
      </div>

      {items.length === 0 ? (
        <div className="empty-cart">
          <h2>Tu carrito está vacío</h2>
          <p>¡Explora nuestros productos y añade algunos a tu carrito!</p>
          <a href="/productos" className="shop-btn">
            Ver Productos
          </a>
        </div>
      ) : (
        <div className="carrito-content">
          <div className="cart-items-section">
            <div className="section-header">
              <h2>Productos ({itemCount})</h2>
              <button onClick={clearCart} className="clear-all-btn">
                Vaciar Carrito
              </button>
            </div>
            
            <div className="cart-items">
              {items.map(item => (
                <CartItem key={item.producto_id} item={item} />
              ))}
            </div>
          </div>

          <div className="cart-summary-section">
            <div className="summary-card">
              <h3>Resumen del Pedido</h3>
              
              <div className="summary-details">
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
              </div>

              <button onClick={handleCheckout} className="checkout-btn">
                Proceder al Pago
              </button>

              <a href="/productos" className="continue-shopping">
                ← Seguir comprando
              </a>
            </div>
          </div>
        </div>
      )}

      {showCheckout && (
        <CheckoutForm
          onSuccess={handleCheckoutSuccess}
          onCancel={handleCheckoutCancel}
        />
      )}
    </div>
  );
};

export default Carrito;