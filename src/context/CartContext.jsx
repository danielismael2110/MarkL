import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Exportar el contexto para que pueda ser importado
export const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload || [],
        loading: false
      };
    
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => 
        item.producto_id === action.payload.producto_id
      );
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.producto_id === action.payload.producto_id
            ? { ...item, cantidad: item.cantidad + action.payload.cantidad }
            : item
        );
        return { ...state, items: updatedItems };
      } else {
        return { ...state, items: [...state.items, action.payload] };
      }
    
    case 'UPDATE_QUANTITY':
      const itemsWithUpdatedQuantity = state.items.map(item =>
        item.producto_id === action.payload.producto_id
          ? { ...item, cantidad: action.payload.cantidad }
          : item
      ).filter(item => item.cantidad > 0);
      
      return { ...state, items: itemsWithUpdatedQuantity };
    
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(
        item => item.producto_id !== action.payload
      );
      return { ...state, items: filteredItems };
    
    case 'CLEAR_CART':
      return { ...state, items: [] };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    default:
      return state;
  }
};

const initialState = {
  items: [],
  loading: false,
  error: null
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Calcular totales
  const subtotal = state.items.reduce((total, item) => 
    total + (item.precio_unitario * item.cantidad), 0
  );
  
  const iva = subtotal * 0.13; // 13% IVA (ajusta según tu país)
  const total = subtotal + iva;

  const addToCart = (producto, cantidad = 1) => {
    const cartItem = {
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio,
      cantidad: cantidad,
      imagen: producto.imagen,
      stock: producto.stock
    };
    
    dispatch({ type: 'ADD_ITEM', payload: cartItem });
  };

  const updateQuantity = (productoId, cantidad) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { producto_id: productoId, cantidad } });
  };

  const removeFromCart = (productoId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productoId });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const value = {
    items: state.items,
    loading: state.loading,
    error: state.error,
    subtotal,
    iva,
    total,
    itemCount: state.items.reduce((count, item) => count + item.cantidad, 0),
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};