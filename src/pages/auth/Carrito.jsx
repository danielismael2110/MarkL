import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import CartItem from '../../components/cart/CartItem';
import CheckoutForm from '../../components/cart/CheckoutForm';
import './css/carrito.css';

const Carrito = () => {
  const { items, subtotal, iva, total, itemCount, clearCart } = useCart();
  const { darkMode } = useTheme();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Aplicar tema oscuro (dos métodos de compatibilidad)
  useEffect(() => {
    const root = document.documentElement;
    const container = document.querySelector('.carrito-container');
    
    if (darkMode) {
      root.setAttribute('data-theme', 'dark');
      container?.classList.add('dark-mode');
    } else {
      root.removeAttribute('data-theme');
      container?.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Simular carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (pedido) => {
    setOrderSuccess(pedido);
    setShowCheckout(false);
    clearCart();
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
  };

  const handleContinueShopping = () => {
    setOrderSuccess(null);
    window.location.href = '/productos';
  };

  if (isLoading) {
    return (
      <div className="carrito-container">
        <div className="loading">Cargando carrito...</div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="carrito-container">
        <div className="order-success">
          <div className="success-icon">✅</div>
          <h1>¡Pedido Realizado con Éxito!</h1>
          <p>Tu pedido <strong>{orderSuccess.numero_pedido}</strong> ha sido procesado correctamente.</p>
          <p>Total: <strong>Bs. {orderSuccess.total?.toFixed(2)}</strong></p>
          <p>Te contactaremos pronto para coordinar la entrega.</p>
          <div className="success-actions">
            <button onClick={handleContinueShopping} className="continue-btn">
              Seguir Comprando
            </button>
            <a href="/mis-pedidos" className="view-orders-btn">
              Ver Mis Pedidos
            </a>
          </div>
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