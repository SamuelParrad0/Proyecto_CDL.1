const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { esAdministrador } = require('../middleware/checkRole');
const {
  listarCategorias,
  listarTodasAdmin,
  verCategoria,
  crearCategoria,
  editarCategoria,
  activarDesactivar,
  eliminarCategoria
} = require('../controllers/categoria.controller');

// Rutas públicas
router.get('/', listarCategorias);
router.get('/:id', verCategoria);

// Rutas de admin
router.get('/admin/todas', verificarToken, esAdministrador, listarTodasAdmin);
router.post('/', verificarToken, esAdministrador, crearCategoria);
router.put('/:id', verificarToken, esAdministrador, editarCategoria);
router.patch('/:id/activar', verificarToken, esAdministrador, activarDesactivar);
router.delete('/:id', verificarToken, esAdministrador, eliminarCategoria);

module.exports = router;