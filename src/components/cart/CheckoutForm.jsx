import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import './css/checkoutForm.css';

const CheckoutForm = ({ onSuccess, onCancel }) => {
  const { items, subtotal, iva, total, clearCart } = useCart();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    direccion_envio: profile?.direccion || '',
    metodo_pago: 'efectivo',
    nit_ci: profile?.nit_ci || '',
    comentario_entrega: '',
    observacion: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.direccion_envio.trim()) {
      alert('Por favor ingresa tu dirección de envío');
      return;
    }

    if (!formData.nit_ci.trim()) {
      alert('Por favor ingresa tu NIT/CI');
      return;
    }

    if (items.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setLoading(true);
    
    try {
      // Combinar observaciones y comentarios de entrega
      const observacionesCompletas = [
        formData.observacion,
        formData.comentario_entrega && `Instrucciones entrega: ${formData.comentario_entrega}`
      ].filter(text => text && text.trim()).join(' | ');

      // 1. Crear el pedido CON nit_ci
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([{
          cliente_id: user.id,
          direccion_envio: formData.direccion_envio.trim(),
          metodo_pago: formData.metodo_pago,
          observacion: observacionesCompletas,
          nit_ci: formData.nit_ci.trim(),
          total: total,
          estado: 'pendiente'
        }])
        .select()
        .single();

      if (pedidoError) {
        console.error('Error creando pedido:', pedidoError);
        throw new Error(`Error al crear el pedido: ${pedidoError.message}`);
      }

      // 2. Crear los detalles del pedido
      const detallesPedido = items.map(item => ({
        pedido_id: pedido.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }));

      const { error: detallesError } = await supabase
        .from('pedido_detalles')
        .insert(detallesPedido);

      if (detallesError) {
        console.error('Error creando detalles:', detallesError);
        throw new Error(`Error al crear los detalles: ${detallesError.message}`);
      }

      // 3. Crear la venta en la tabla ventas SIN nit_ci (por ahora)
      const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .insert([{
          cliente_id: user.id,
          cajero_id: user.id,
          total: total,
          metodo_pago: formData.metodo_pago
          // NOTA: No incluir nit_ci aquí hasta que la columna exista
        }])
        .select()
        .single();

      if (ventaError) {
        console.error('Error creando venta:', ventaError);
        
        // Si el error es por nit_ci, intentar sin ese campo
        if (ventaError.message.includes('nit_ci')) {
          const { data: ventaRetry, error: ventaRetryError } = await supabase
            .from('ventas')
            .insert([{
              cliente_id: user.id,
              cajero_id: user.id,
              total: total,
              metodo_pago: formData.metodo_pago
            }])
            .select()
            .single();

          if (ventaRetryError) throw ventaRetryError;
        } else {
          throw ventaError;
        }
      }

      // 4. Crear los detalles de la venta
      const detallesVenta = items.map(item => ({
        venta_id: venta.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }));

      const { error: ventaDetallesError } = await supabase
        .from('venta_detalles')
        .insert(detallesVenta);

      if (ventaDetallesError) {
        console.error('Error creando detalles de venta:', ventaDetallesError);
        throw new Error(`Error al registrar los detalles de venta: ${ventaDetallesError.message}`);
      }

      // 5. Actualizar el perfil del usuario
      const updateData = {
        direccion: formData.direccion_envio.trim(),
        actualizado_en: new Date().toISOString()
      };

      // Solo actualizar NIT/CI si es diferente
      if (formData.nit_ci !== profile?.nit_ci) {
        updateData.nit_ci = formData.nit_ci.trim();
      }

      await supabase
        .from('perfiles')
        .update(updateData)
        .eq('id', user.id);

      console.log('Pedido procesado exitosamente:', pedido);
      
      // 6. Limpiar carrito y mostrar éxito
      clearCart();
      onSuccess(pedido);

    } catch (error) {
      console.error('Error completo procesando pedido:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-overlay">
      <div className="checkout-modal">
        <div className="checkout-header">
          <h2>Finalizar Compra</h2>
          <button onClick={onCancel} className="close-btn" disabled={loading}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          {/* Información del Cliente */}
          <div className="form-section">
            <h3>Información del Cliente</h3>
            <div className="client-info">
              <div className="info-row">
                <span className="label">Nombre:</span>
                <span className="value">{profile?.nombre_completo || 'Usuario'}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <label htmlFor="nit_ci">NIT/CI *</label>
            <input
              type="text"
              id="nit_ci"
              name="nit_ci"
              value={formData.nit_ci}
              onChange={handleInputChange}
              placeholder="Ingresa tu NIT o Cédula de Identidad"
              required
              disabled={loading}
            />
            <small className="field-help">Requerido para facturación. Si no tienes, usa: 1234</small>
          </div>

          <div className="form-section">
            <label htmlFor="direccion_envio">Dirección de Envío *</label>
            <textarea
              id="direccion_envio"
              name="direccion_envio"
              value={formData.direccion_envio}
              onChange={handleInputChange}
              placeholder="Ingresa tu dirección completa para la entrega"
              required
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="form-section">
            <label>Método de Pago *</label>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="metodo_pago"
                  value="efectivo"
                  checked={formData.metodo_pago === 'efectivo'}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span>Efectivo</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="metodo_pago"
                  value="tarjeta"
                  checked={formData.metodo_pago === 'tarjeta'}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span>Tarjeta</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="metodo_pago"
                  value="transferencia"
                  checked={formData.metodo_pago === 'transferencia'}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span>Transferencia</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <label htmlFor="comentario_entrega">Instrucciones Especiales de Entrega</label>
            <textarea
              id="comentario_entrega"
              name="comentario_entrega"
              value={formData.comentario_entrega}
              onChange={handleInputChange}
              placeholder="Ej: Llamar antes de llegar, entregar con vecino, horario preferido, etc."
              rows="2"
              disabled={loading}
            />
            <small className="field-help">Opcional - Instrucciones específicas para el repartidor</small>
          </div>

          <div className="form-section">
            <label htmlFor="observacion">Observaciones Generales (Opcional)</label>
            <textarea
              id="observacion"
              name="observacion"
              value={formData.observacion}
              onChange={handleInputChange}
              placeholder="Comentarios adicionales sobre tu pedido..."
              rows="2"
              disabled={loading}
            />
          </div>

          <div className="order-summary">
            <h3>Resumen del Pedido</h3>
            {items.map(item => (
              <div key={item.producto_id} className="summary-item">
                <span>{item.nombre} x {item.cantidad}</span>
                <span>Bs. {(item.precio_unitario * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>Bs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>IVA (13%):</span>
              <span>Bs. {iva.toFixed(2)}</span>
            </div>
            <div className="summary-total">
              <span>Total: Bs. {total.toFixed(2)}</span>
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
              disabled={loading}
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