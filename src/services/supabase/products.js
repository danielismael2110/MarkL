import { supabase } from '../../lib/supabaseClient';

export const productsService = {
  // Obtener todos los productos activos
  async getAllProducts() {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias: categoria_id (nombre),
        proveedores: proveedor_id (nombre)
      `)
      .eq('activo', true)
      .order('nombre');
    
    if (error) throw error;
    
    // Transformar los datos para que sean consistentes
    return data.map(producto => ({
      ...producto,
      categoria: producto.categorias?.nombre || 'Sin categoría',
      proveedor: producto.proveedores?.nombre || 'Sin proveedor'
    }));
  },

  // Obtener productos por categoría
  async getProductsByCategory(categoriaId) {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias: categoria_id (nombre),
        proveedores: proveedor_id (nombre)
      `)
      .eq('categoria_id', categoriaId)
      .eq('activo', true)
      .order('nombre');
    
    if (error) throw error;
    
    return data.map(producto => ({
      ...producto,
      categoria: producto.categorias?.nombre || 'Sin categoría',
      proveedor: producto.proveedores?.nombre || 'Sin proveedor'
    }));
  },

  // Obtener productos destacados
  async getFeaturedProducts() {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias: categoria_id (nombre)
      `)
      .eq('activo', true)
      .gt('stock', 0)
      .order('ventas_totales', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    
    return data.map(producto => ({
      ...producto,
      categoria: producto.categorias?.nombre || 'Sin categoría'
    }));
  },

  // Obtener un producto por ID
  async getProductById(id) {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias: categoria_id (nombre),
        proveedores: proveedor_id (nombre)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      categoria: data.categorias?.nombre || 'Sin categoría',
      proveedor: data.proveedores?.nombre || 'Sin proveedor'
    };
  },

  // Crear nuevo producto (admin)
  async createProduct(productData) {
    const { data, error } = await supabase
      .from('productos')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Actualizar producto (admin)
  async updateProduct(id, productData) {
    const { data, error } = await supabase
      .from('productos')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Eliminar producto (soft delete)
  async deleteProduct(id) {
    const { data, error } = await supabase
      .from('productos')
      .update({ activo: false })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Obtener categorías
  async getCategories() {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre');
    
    if (error) throw error;
    return data;
  },

  // Buscar productos
  async searchProducts(query) {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias: categoria_id (nombre),
        proveedores: proveedor_id (nombre)
      `)
      .ilike('nombre', `%${query}%`)
      .eq('activo', true)
      .order('nombre');
    
    if (error) throw error;
    
    return data.map(producto => ({
      ...producto,
      categoria: producto.categorias?.nombre || 'Sin categoría',
      proveedor: producto.proveedores?.nombre || 'Sin proveedor'
    }));
  }
};