const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { esAdministrador } = require('../middleware/checkRole');
const {
  listarProductos,
  verProducto,
  listarPorCategoria,
  listarTodos,
  crearProducto,
  editarProducto,
  activarDesactivar,
  eliminarProducto
} = require('../controllers/productos.controller');

// Rutas de admin — van ANTES de /:id para que Express no las confunda
router.get('/admin/todos', verificarToken, esAdministrador, listarTodos);
router.post('/admin', verificarToken, esAdministrador, crearProducto);
router.put('/admin/:id', verificarToken, esAdministrador, editarProducto);
router.patch('/admin/:id/activar', verificarToken, esAdministrador, activarDesactivar);
router.delete('/admin/:id', verificarToken, esAdministrador, eliminarProducto);

// Rutas públicas
router.get('/', listarProductos);
router.get('/categoria/:categoriaId', listarPorCategoria);

// Ruta pública con parámetro — va AL FINAL
router.get('/:id', verProducto);

module.exports = router;