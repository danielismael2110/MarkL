import React, { useState, useEffect } from 'react';
import { productsService } from '../../services/supabase/products';
import ProductoGrid from '../../components/products/ProductoGrid';
import CategoriasFilter from '../../components/products/CategoriasFilter';
import ProductoDetail from '../../components/products/ProductoDetail';
import './css/productosPublic.css';

const ProductosPublic = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log('Cargando datos iniciales...');
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    console.log('Categoría seleccionada cambió:', categoriaSeleccionada);
    if (categoriaSeleccionada) {
      cargarProductosPorCategoria();
    } else {
      cargarTodosLosProductos();
    }
  }, [categoriaSeleccionada]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);
      console.log('Cargando productos y categorías...');
      const [productosData, categoriasData] = await Promise.all([
        productsService.getAllProducts(),
        productsService.getCategories()
      ]);
      
      console.log('Productos cargados:', productosData);
      console.log('Categorías cargadas:', categoriasData);
      
      setProductos(productosData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarTodosLosProductos = async () => {
    try {
      setLoading(true);
      console.log('Cargando todos los productos...');
      const productosData = await productsService.getAllProducts();
      console.log('Todos los productos:', productosData);
      setProductos(productosData);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarProductosPorCategoria = async () => {
    try {
      setLoading(true);
      console.log('Cargando productos para categoría:', categoriaSeleccionada);
      const productosData = await productsService.getProductsByCategory(categoriaSeleccionada);
      console.log('Productos por categoría:', productosData);
      setProductos(productosData);
    } catch (error) {
      console.error('Error cargando productos por categoría:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      cargarTodosLosProductos();
      return;
    }

    try {
      setLoading(true);
      const resultados = await productsService.searchProducts(searchQuery);
      setProductos(resultados);
    } catch (error) {
      console.error('Error buscando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (producto) => {
    setProductoSeleccionado(producto);
  };

  const handleCloseDetails = () => {
    setProductoSeleccionado(null);
  };

  return (
    <div className="productos-public-container">
      <div className="productos-header">
        <h1>Nuestros Productos</h1>
        <p>Descubre nuestra selección de licores y bebidas</p>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            Buscar
          </button>
          <button 
            type="button" 
            onClick={cargarTodosLosProductos}
            className="clear-btn"
          >
            Mostrar Todos
          </button>
        </form>
      </div>

      <div className="productos-content">
        <aside className="productos-sidebar">
          <CategoriasFilter
            categorias={categorias}
            categoriaSeleccionada={categoriaSeleccionada}
            onCategoriaChange={setCategoriaSeleccionada}
            loading={loading}
          />
        </aside>

        <main className="productos-main">
          <div className="productos-stats">
            <p>{productos.length} productos encontrados</p>
            {categoriaSeleccionada && (
              <button 
                onClick={() => setCategoriaSeleccionada(null)}
                className="clear-filter-btn"
              >
                Limpiar filtro
              </button>
            )}
          </div>

          <ProductoGrid
            productos={productos}
            onViewDetails={handleViewDetails}
            loading={loading}
          />
        </main>
      </div>

      {productoSeleccionado && (
        <ProductoDetail
          producto={productoSeleccionado}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default ProductosPublic;