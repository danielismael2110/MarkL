import { supabase } from '../../lib/supabaseClient'

export const dashboardService = {
  // Estadísticas generales
  async getStats() {
    const { data: products, error: productsError } = await supabase
      .from('productos')
      .select('id, stock')
    
    const { data: orders, error: ordersError } = await supabase
      .from('pedidos')
      .select('id, total, estado')
    
    const { data: sales, error: salesError } = await supabase
      .from('ventas')
      .select('total')
    
    const { data: users, error: usersError } = await supabase
      .from('perfiles')
      .select('id')

    if (productsError || ordersError || salesError || usersError) {
      throw new Error('Error fetching stats')
    }

    const totalRevenue = sales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0
    const pendingOrders = orders?.filter(order => order.estado === 'pendiente').length || 0
    const lowStockCount = products?.filter(product => product.stock < 10).length || 0

    return {
      totalProducts: products?.length || 0,
      totalOrders: orders?.length || 0,
      totalRevenue,
      pendingOrders,
      totalUsers: users?.length || 0,
      lowStockCount
    }
  },

  // Pedidos recientes
  async getRecentOrders(limit = 5) {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        perfiles(nombre_completo)
      `)
      .order('creado_en', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Productos con stock bajo
  async getLowStockProducts(limit = 5) {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .lt('stock', 10)
      .order('stock', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Ventas del día
  async getTodaySales() {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('ventas')
      .select('total')
      .gte('fecha', today)

    if (error) throw error
    return data
  }
}