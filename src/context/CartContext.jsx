import React, { createContext, useContext, useReducer, useEffect } from 'react';

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
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
        return { ...state, items: updatedItems };
      } else {
        const newItems = [...state.items, action.payload];
        localStorage.setItem('cartItems', JSON.stringify(newItems));
        return { ...state, items: newItems };
      }
    
    case 'UPDATE_QUANTITY':
      const itemsWithUpdatedQuantity = state.items.map(item =>
        item.producto_id === action.payload.producto_id
          ? { ...item, cantidad: action.payload.cantidad }
          : item
      ).filter(item => item.cantidad > 0);
      
      localStorage.setItem('cartItems', JSON.stringify(itemsWithUpdatedQuantity));
      return { ...state, items: itemsWithUpdatedQuantity };
    
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(
        item => item.producto_id !== action.payload
      );
      localStorage.setItem('cartItems', JSON.stringify(filteredItems));
      return { ...state, items: filteredItems };
    
    case 'CLEAR_CART':
      localStorage.removeItem('cartItems');
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

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        dispatch({ type: 'LOAD_CART', payload: [] });
      }
    } else {
      dispatch({ type: 'LOAD_CART', payload: [] });
    }
  }, []);

  // Calcular totales - CORREGIDO: usar precio_unitario en lugar de precio
  const subtotal = state.items.reduce((total, item) => 
    total + (item.precio_unitario * item.cantidad), 0
  );
  
  const iva = subtotal * 0.13;
  const total = subtotal + iva;

  const addToCart = (producto, cantidad = 1) => {
    // Validar stock disponible
    if (cantidad > producto.stock) {
      throw new Error(`Solo hay ${producto.stock} unidades disponibles`);
    }

    const cartItem = {
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio, // Mantener consistencia con la base de datos
      precio: producto.precio, // Duplicado para compatibilidad
      cantidad: cantidad,
      imagen: producto.imagen,
      stock: producto.stock
    };
    
    dispatch({ type: 'ADD_ITEM', payload: cartItem });
  };

  const updateQuantity = (productoId, cantidad) => {
    // Validar que la cantidad no exceda el stock
    const item = state.items.find(item => item.producto_id === productoId);
    if (item && cantidad > item.stock) {
      throw new Error(`Solo hay ${item.stock} unidades disponibles`);
    }
    
    dispatch({ type: 'UPDATE_QUANTITY', payload: { producto_id: productoId, cantidad } });
  };

  const removeFromCart = (productoId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productoId });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.cantidad, 0);
  };

  const value = {
    items: state.items,
    loading: state.loading,
    error: state.error,
    subtotal,
    iva,
    total,
    itemCount: getItemCount(),
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