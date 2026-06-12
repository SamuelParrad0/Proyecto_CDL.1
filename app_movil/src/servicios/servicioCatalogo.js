/**
 * SERVICIO DE CATÁLOGO
 * Gestiona: productos, categorías, subcategorías.
 * Rutas reales del backend CDL:
 *   GET /api/productos                     → listado público
 *   GET /api/productos/:id                 → detalle
 *   GET /api/productos/categoria/:id       → por categoría
 *   GET /api/categorias                    → listado público
 */

import clienteApi from '../api/clienteApi';

// URL base para imágenes del backend
const ORIGEN_IMAGENES = 'http://10.0.2.2:5000';

const servicioCatalogo = {
  /**
   * Obtiene todas las categorías activas.
   */
  obtenerCategorias: async () => {
    const respuesta = await clienteApi.get('/categorias');
    const datos = respuesta.data;
    if (Array.isArray(datos)) return datos;
    if (Array.isArray(datos?.categorias)) return datos.categorias;
    return [];
  },

  /**
   * Obtiene productos públicos. Acepta filtro por categoríaId.
   */
  obtenerProductos: async (categoriaId = null) => {
    const url = categoriaId
      ? `/productos/categoria/${categoriaId}`
      : '/productos';
    const respuesta = await clienteApi.get(url);
    const datos = respuesta.data;
    if (Array.isArray(datos)) return datos;
    if (Array.isArray(datos?.productos)) return datos.productos;
    return [];
  },

  /**
   * Obtiene el detalle de un producto por ID.
   */
  obtenerProductoPorId: async (id) => {
    const respuesta = await clienteApi.get(`/productos/${id}`);
    const datos = respuesta.data;
    return datos?.producto || datos;
  },

  /**
   * Construye la URL completa de una imagen del backend.
   * @param {string|null} ruta - Ruta relativa de la imagen.
   * @returns {string} URL completa.
   */
  construirUrlImagen: (ruta) => {
    if (!ruta) return 'https://via.placeholder.com/300x200.png?text=Sin+imagen';
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    const rutaLimpia = ruta.replace(/^\//, '');
    return `${ORIGEN_IMAGENES}/uploads/${rutaLimpia}`;
  },
};

export default servicioCatalogo;
