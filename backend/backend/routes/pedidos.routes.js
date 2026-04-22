const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { esAdministrador, esAdminOAuxiliar } = require('../middleware/checkRole');
const {
  crearPedido,
  verMisPedidos,
  verDetallePedido,
  editarPedido,
  cancelarPedido,
  togglePedido,
  eliminarPedido,
  verTodosPedidos,
  cambiarEstado
} = require('../controllers/pedidos.controller');

// ── ADMIN — van ANTES que /:id para evitar conflictos ──
router.get('/admin/todos', verificarToken, esAdminOAuxiliar, verTodosPedidos);
router.put('/admin/:id/estado', verificarToken, esAdministrador, cambiarEstado);
router.delete('/admin/:id', verificarToken, esAdministrador, eliminarPedido);

// ── CLIENTE ────────────────────────────────────────────
router.post('/', verificarToken, crearPedido);
router.get('/', verificarToken, verMisPedidos);
router.get('/:id', verificarToken, verDetallePedido);
router.put('/:id', verificarToken, editarPedido);
router.patch('/:id/cancelar', verificarToken, cancelarPedido);
router.patch('/:id/toggle', verificarToken, togglePedido);

module.exports = router;