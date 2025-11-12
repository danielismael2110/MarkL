import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersService } from '../../services/supabase/orders';
import './css/checkoutForm.css';

const CheckoutForm = ({ onSuccess, onCancel }) => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    direccion_envio: '',
    metodo_pago: 'efectivo',
    observacion: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Debes iniciar sesión para realizar un pedido');
      return;
    }

    if (!formData.direccion_envio.trim()) {
      alert('Por favor ingresa una dirección de envío');
      return;
    }

    setLoading(true);

    try {
      // Preparar datos del pedido
      const pedidoData = {
        cliente_id: user.id,
        direccion_envio: formData.direccion_envio,
        metodo_pago: formData.metodo_pago,
        observacion: formData.observacion,
        total: total,
        estado: 'pendiente'
      };

      // Preparar detalles del pedido
      const detalles = items.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }));

      // Crear pedido en la base de datos
      const pedido = await ordersService.createOrder(pedidoData, detalles);
      
      // Limpiar carrito
      clearCart();
      
      // Mostrar éxito
      onSuccess(pedido);

    } catch (error) {
      console.error('Error creando pedido:', error);
      alert('Error al crear el pedido. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-form-container">
      <div className="checkout-form">
        <h2>Finalizar Compra</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="direccion_envio">Dirección de Envío *</label>
            <textarea
              id="direccion_envio"
              name="direccion_envio"
              value={formData.direccion_envio}
              onChange={handleInputChange}
              required
              rows="3"
              placeholder="Ingresa tu dirección completa para la entrega"
            />
          </div>

          <div className="form-group">
            <label htmlFor="metodo_pago">Método de Pago *</label>
            <select
              id="metodo_pago"
              name="metodo_pago"
              value={formData.metodo_pago}
              onChange={handleInputChange}
              required
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta de Crédito/Débito</option>
              <option value="transferencia">Transferencia Bancaria</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="observacion">Observaciones (Opcional)</label>
            <textarea
              id="observacion"
              name="observacion"
              value={formData.observacion}
              onChange={handleInputChange}
              rows="2"
              placeholder="Instrucciones especiales para la entrega..."
            />
          </div>

          <div className="order-summary">
            <h3>Resumen del Pedido</h3>
            {items.map(item => (
              <div key={item.producto_id} className="order-item">
                <span>{item.nombre} x {item.cantidad}</span>
                <span>Bs. {(item.precio_unitario * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
            <div className="order-total">
              <strong>Total: Bs. {total.toFixed(2)}</strong>
            </div>
          </div>

          <div className="checkout-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-btn"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="confirm-btn"
              disabled={loading || items.length === 0}
            >
              {loading ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;