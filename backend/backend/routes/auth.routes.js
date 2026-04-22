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

// POST /api/auth/registro → registrar nuevo usuario
router.post('/registro', registrar);

// POST /api/auth/registro-admin → registrar admin (protegido por header)
router.post('/registro-admin', registrarAdmin);

// POST /api/auth/login → iniciar sesión
router.post('/login', login);

// GET /api/auth/perfil → obtener perfil (requiere token)
router.get('/perfil', verificarToken, obtenerPerfil);

// PUT /api/auth/perfil → actualizar perfil (requiere token)
router.put('/perfil', verificarToken, actualizarPerfil);

// GET /api/auth/usuarios → listar todos los usuarios (admin)
router.get('/usuarios', verificarToken, esAdministrador, listarUsuarios);

// GET /api/auth/usuarios/:id → obtener un usuario por id (admin)
router.get('/usuarios/:id', verificarToken, esAdministrador, obtenerUsuarioId);

// PUT /api/auth/usuarios/:id → editar usuario (admin)
router.put('/usuarios/:id', verificarToken, esAdministrador, editarUsuarioAdmin);

// PATCH /api/auth/usuarios/:id/toggle → activar/desactivar usuario (admin)
router.patch('/usuarios/:id/toggle', verificarToken, esAdministrador, toggleUsuario);

// DELETE /api/auth/usuarios/:id → desactivar usuario (admin)
router.delete('/usuarios/:id', verificarToken, esAdministrador, eliminarUsuario);

// PUT /api/auth/admin/:id/rol → cambiar rol usuario (admin)
router.put('/admin/:id/rol', verificarToken, esAdministrador, cambiarRol);

module.exports = router;