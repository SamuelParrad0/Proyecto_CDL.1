const express = require('express');
const router = express.Router();
const {
  registrar,
  registrarAdmin,
  login,
  obtenerPerfil,
  listarUsuarios,
  obtenerUsuarioId,
  editarUsuarioAdmin,
  toggleUsuario,
  eliminarUsuario,
  actualizarPerfil,
  cambiarRol
} = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth');
const { esAdministrador } = require('../middleware/checkRole');

// ── AUTENTICACIÓN ──────────────────────────────────────
router.post('/registro', registrar);
router.post('/registro-admin', registrarAdmin);
router.post('/login', login);

// ── PERFIL PROPIO — van ANTES de /usuarios/:id ─────────
router.get('/perfil', verificarToken, obtenerPerfil);
router.put('/perfil', verificarToken, actualizarPerfil);

router.patch('/perfil/toggle', verificarToken, async (req, res) => {
  req.params.id = req.usuarioId;
  return toggleUsuario(req, res);
});

router.delete('/perfil', verificarToken, async (req, res) => {
  req.params.id = req.usuarioId;
  return eliminarUsuario(req, res);
});

// ── ADMIN ──────────────────────────────────────────────
router.get('/usuarios', verificarToken, esAdministrador, listarUsuarios);
router.get('/usuarios/:id', verificarToken, esAdministrador, obtenerUsuarioId);
router.put('/usuarios/:id', verificarToken, esAdministrador, editarUsuarioAdmin);
router.patch('/usuarios/:id/toggle', verificarToken, esAdministrador, toggleUsuario);
router.delete('/usuarios/:id', verificarToken, esAdministrador, eliminarUsuario);
router.put('/admin/:id/rol', verificarToken, esAdministrador, cambiarRol);

module.exports = router;