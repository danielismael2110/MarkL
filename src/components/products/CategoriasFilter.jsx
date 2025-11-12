import React from 'react';
import './css/categoriasFilter.css';

const CategoriasFilter = ({ 
  categorias, 
  categoriaSeleccionada, 
  onCategoriaChange,
  loading = false 
}) => {
  console.log('CategoriasFilter - categorias:', categorias);
  console.log('CategoriasFilter - categoriaSeleccionada:', categoriaSeleccionada);

  if (loading && categorias.length === 0) {
    return (
      <div className="categorias-filter-loading">
        <p>Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="categorias-filter">
      <h3 className="categorias-titulo">Categorías</h3>
      <div className="categorias-lista">
        <button
          className={`categoria-btn ${!categoriaSeleccionada ? 'active' : ''}`}
          onClick={() => {
            console.log('Seleccionando todas las categorías');
            onCategoriaChange(null);
          }}
        >
          Todas las Categorías
        </button>
        
        {categorias.map((categoria) => (
          <button
            key={categoria.id}
            className={`categoria-btn ${categoriaSeleccionada === categoria.id ? 'active' : ''}`}
            onClick={() => {
              console.log('Seleccionando categoría:', categoria.id, categoria.nombre);
              onCategoriaChange(categoria.id);
            }}
          >
            {categoria.nombre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoriasFilter;