const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { esAdministrador } = require('../middleware/checkRole');
const {
  crearCita,
  obtenerMisCitas,
  obtenerCitaPorId,
  editarCita,
  cancelarCita,
  toggleCita,
  eliminarCita,
  verTodasCitas,
  cambiarEstadoCita
} = require('../controllers/citas.controller');

// ── ADMIN — van ANTES que /:id ─────────────────────────
router.get('/admin/todas', verificarToken, esAdministrador, verTodasCitas);
router.put('/admin/:id/estado', verificarToken, esAdministrador, cambiarEstadoCita);
router.delete('/admin/:id', verificarToken, esAdministrador, eliminarCita);

// ── CLIENTE ────────────────────────────────────────────
router.post('/', verificarToken, crearCita);
router.get('/', verificarToken, obtenerMisCitas);
router.get('/:id', verificarToken, obtenerCitaPorId);
router.put('/:id', verificarToken, editarCita);
router.patch('/:id/cancelar', verificarToken, cancelarCita);
router.patch('/:id/toggle', verificarToken, toggleCita);

module.exports = router;