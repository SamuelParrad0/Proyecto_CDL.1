const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { esAdministrador } = require('../middleware/checkRole');
const {
  crearPersonalizado,
  obtenerMisSolicitudes,
  obtenerSolicitudPorId,
  editarSolicitud,
  eliminarSolicitud,
  verTodasSolicitudes,
  cambiarEstadoSolicitud,
  toggleSolicitud
} = require('../controllers/personalizado.controller');

// ── ADMIN ──────────────────────────────────────────────
router.get('/admin/todas', verificarToken, esAdministrador, verTodasSolicitudes);
router.put('/admin/:id/estado', verificarToken, esAdministrador, cambiarEstadoSolicitud);

// ── CLIENTE ────────────────────────────────────────────
router.post('/', verificarToken, crearPersonalizado);
router.get('/', verificarToken, obtenerMisSolicitudes);
router.get('/:id', verificarToken, obtenerSolicitudPorId);
router.put('/:id', verificarToken, editarSolicitud);
router.patch('/:id/toggle', verificarToken, toggleSolicitud);
router.delete('/:id', verificarToken, eliminarSolicitud);

module.exports = router;