import React, { createContext, useState, useEffect, useContext } from 'react';
import servicioCarrito from '../servicios/servicioCarrito';
import { AuthContext } from './ContextoAuth';

export const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const { estaAutenticado } = useContext(AuthContext);
  
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrecio, setTotalPrecio] = useState(0);
  const [cargando, setCargando] = useState(true);

  const cargarCarrito = async () => {
    try {
      setCargando(true);
      const resumen = await servicioCarrito.obtenerCarrito(estaAutenticado);
      setItems(resumen.items);
      setTotalItems(resumen.totalItems);
      setTotalPrecio(resumen.total);
    } catch (error) {
      console.error('Error cargando carrito:', error);
    } finally {
      setCargando(false);
    }
  };

  // Recargar carrito cuando cambia el estado de autenticación
  useEffect(() => {
    cargarCarrito();
  }, [estaAutenticado]);

  const agregarAlCarrito = async (producto, cantidad = 1) => {
    try {
      setCargando(true);
      await servicioCarrito.agregarAlCarrito({ estaAutenticado, producto, cantidad });
      await cargarCarrito();
    } finally {
      setCargando(false);
    }
  };

  const actualizarCantidad = async (itemId, cantidad) => {
    try {
      setCargando(true);
      await servicioCarrito.actualizarCantidad({ estaAutenticado, itemId, cantidad });
      await cargarCarrito();
    } finally {
      setCargando(false);
    }
  };

  const eliminarItem = async (itemId) => {
    try {
      setCargando(true);
      await servicioCarrito.eliminarItem({ estaAutenticado, itemId });
      await cargarCarrito();
    } finally {
      setCargando(false);
    }
  };

  const vaciarCarrito = async () => {
    try {
      setCargando(true);
      await servicioCarrito.vaciarCarrito(estaAutenticado);
      await cargarCarrito();
    } finally {
      setCargando(false);
    }
  };

  return (
    <CarritoContext.Provider
      value={{
        items,
        totalItems,
        totalPrecio,
        cargando,
        agregarAlCarrito,
        actualizarCantidad,
        eliminarItem,
        vaciarCarrito,
        recargarCarrito: cargarCarrito,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};
