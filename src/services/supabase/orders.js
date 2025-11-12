import { supabase } from '../../lib/supabaseClient';

export const ordersService = {
  // Crear un nuevo pedido
  async createOrder(pedidoData, detalles) {
    try {
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([pedidoData])
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // Insertar detalles del pedido
      const detallesConPedidoId = detalles.map(detalle => ({
        ...detalle,
        pedido_id: pedido.id
      }));

      const { error: detallesError } = await supabase
        .from('pedido_detalles')
        .insert(detallesConPedidoId);

      if (detallesError) throw detallesError;

      return pedido;
    } catch (error) {
      console.error('Error creando pedido:', error);
      throw error;
    }
  },

  // Obtener pedidos del usuario
  async getUserOrders(userId) {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          pedido_detalles (
            *,
            productos (*)
          )
        `)
        .eq('cliente_id', userId)
        .order('creado_en', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo pedidos:', error);
      throw error;
    }
  },

  // Obtener un pedido específico
  async getOrderById(orderId) {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          pedido_detalles (
            *,
            productos (*)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo pedido:', error);
      throw error;
    }
  }
};