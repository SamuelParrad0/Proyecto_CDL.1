const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { esAdministrador } = require('../middleware/checkRole');
const {
  listarPaquetes,
  obtenerPaquetePorId,
  crearPaquete,
  editarPaquete,
  togglePaquete,
  eliminarPaquete
} = require('../controllers/paquetes.controller');

// Rutas públicas
router.get('/', listarPaquetes);
router.get('/:id', obtenerPaquetePorId);

// Rutas admin
router.post('/admin', verificarToken, esAdministrador, crearPaquete);
router.put('/admin/:id', verificarToken, esAdministrador, editarPaquete);
router.patch('/admin/:id/toggle', verificarToken, esAdministrador, togglePaquete);
router.delete('/admin/:id', verificarToken, esAdministrador, eliminarPaquete);

module.exports = router;
