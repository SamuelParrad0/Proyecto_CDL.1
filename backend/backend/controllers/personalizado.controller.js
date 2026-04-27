const { Personalizado, Usuario } = require('../models');

// POST /api/personalizado
const crearPersonalizado = async (req, res) => {
  try {
    const { nombreCompleto, correo, telefono, destinatario,
      descripcionIdea, elementosEsenciales, prioridadCliente, comentariosAdicionales } = req.body;

    const solicitud = await Personalizado.create({
      Id_Usuario: req.usuarioId,
      Nombre_Completo: nombreCompleto,
      Correo: correo,
      Numero_Telefono: telefono,
      Destinatario: destinatario || 'para_mi',
      Descripcion_Idea: descripcionIdea,
      Elementos_Esenciales: elementosEsenciales,
      Prioridad_Cliente: prioridadCliente,
      Comentarios_Adicionales: comentariosAdicionales,
      Estado_Personalizado: 'pendiente',
      Fecha_Solicitud: new Date()
    });

    res.status(201).json({ ok: true, mensaje: 'Solicitud creada correctamente', solicitud });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};

// GET /api/personalizado
const obtenerMisSolicitudes = async (req, res) => {
  try {
    const solicitudes = await Personalizado.findAll({
      where: { Id_Usuario: req.usuarioId },
      order: [['Fecha_Solicitud', 'DESC']]
    });
    res.json({ ok: true, solicitudes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener solicitudes' });
  }
};

// GET /api/personalizado/:id
const obtenerSolicitudPorId = async (req, res) => {
  try {
    const esAdmin = req.usuarioRol === 'admin'; // CORREGIDO: era req.rolNombre

    const where = esAdmin
      ? { Id_Personalizado: req.params.id }
      : { Id_Personalizado: req.params.id, Id_Usuario: req.usuarioId };

    const solicitud = await Personalizado.findOne({ where });

    if (!solicitud) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
    }

    res.json({ ok: true, solicitud });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener la solicitud' });
  }
};

// PUT /api/personalizado/:id
const editarSolicitud = async (req, res) => {
  try {
    const esAdmin = req.usuarioRol === 'admin';

    const where = esAdmin
      ? { Id_Personalizado: req.params.id }
      : { Id_Personalizado: req.params.id, Id_Usuario: req.usuarioId };

    const solicitud = await Personalizado.findOne({ where });

    if (!solicitud) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
    }

    // Cliente solo puede editar si está pendiente
    if (!esAdmin && solicitud.Estado_Personalizado !== 'pendiente') {
      return res.status(400).json({ ok: false, mensaje: 'Solo puedes editar solicitudes en estado pendiente' });
    }

    const { nombreCompleto, correo, telefono, destinatario,
      descripcionIdea, elementosEsenciales, prioridadCliente, comentariosAdicionales,
      Nombre_Completo, Correo: CorreoBody, Numero_Telefono, Destinatario,
      Descripcion_Idea, Elementos_Esenciales, Prioridad_Cliente, Comentarios_Adicionales
    } = req.body;

    await solicitud.update({
      Nombre_Completo:         (nombreCompleto || Nombre_Completo)                   ?? solicitud.Nombre_Completo,
      Correo:                  (correo || CorreoBody)                                ?? solicitud.Correo,
      Numero_Telefono:         (telefono || Numero_Telefono)                         ?? solicitud.Numero_Telefono,
      Destinatario:            (destinatario || Destinatario)                        ?? solicitud.Destinatario,
      Descripcion_Idea:        (descripcionIdea || Descripcion_Idea)                 ?? solicitud.Descripcion_Idea,
      Elementos_Esenciales:    (elementosEsenciales || Elementos_Esenciales)         ?? solicitud.Elementos_Esenciales,
      Prioridad_Cliente:       (prioridadCliente || Prioridad_Cliente)               ?? solicitud.Prioridad_Cliente,
      Comentarios_Adicionales: (comentariosAdicionales || Comentarios_Adicionales)   ?? solicitud.Comentarios_Adicionales
    });

    res.json({ ok: true, mensaje: 'Solicitud actualizada', solicitud });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};

// PATCH /api/personalizado/:id/toggle
const toggleSolicitud = async (req, res) => {
  try {
    const esAdmin = req.usuarioRol === 'admin'; // CORREGIDO: era req.rolNombre

    const where = esAdmin
      ? { Id_Personalizado: req.params.id }
      : { Id_Personalizado: req.params.id, Id_Usuario: req.usuarioId };

    const solicitud = await Personalizado.findOne({ where });

    if (!solicitud) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
    }

    const nuevoEstado = solicitud.Estado_Personalizado === 'pendiente' ? 'cancelado' : 'pendiente';
    await solicitud.update({ Estado_Personalizado: nuevoEstado });

    res.json({ ok: true, mensaje: `Solicitud ${nuevoEstado}`, solicitud });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al cambiar estado' });
  }
};

// DELETE /api/personalizado/:id
const eliminarSolicitud = async (req, res) => {
  try {
    const solicitud = await Personalizado.findOne({
      where: { Id_Personalizado: req.params.id, Id_Usuario: req.usuarioId }
    });

    if (!solicitud) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
    }

    await solicitud.destroy();
    res.json({ ok: true, mensaje: 'Solicitud eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar la solicitud' });
  }
};

// GET /api/personalizado/admin/todas
const verTodasSolicitudes = async (req, res) => {
  try {
    const { estado } = req.query;
    const where = estado ? { Estado_Personalizado: estado } : {};

    const solicitudes = await Personalizado.findAll({
      where,
      include: [{ model: Usuario, as: 'usuario', attributes: ['Id_Usuario', 'Nombre', 'Correo'] }],
      order: [['Fecha_Solicitud', 'DESC']]
    });

    res.json({ ok: true, solicitudes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener solicitudes' });
  }
};

// PUT /api/personalizado/admin/:id/estado
const cambiarEstadoSolicitud = async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'en-revision', 'aprobado', 'rechazado', 'completado'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ ok: false, mensaje: 'Estado inválido' });
    }

    const solicitud = await Personalizado.findByPk(req.params.id);
    if (!solicitud) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada' });
    }

    await solicitud.update({ Estado_Personalizado: estado });
    res.json({ ok: true, mensaje: 'Estado actualizado correctamente', solicitud });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};

module.exports = {
  crearPersonalizado, obtenerMisSolicitudes, obtenerSolicitudPorId,
  editarSolicitud, toggleSolicitud, eliminarSolicitud,
  verTodasSolicitudes, cambiarEstadoSolicitud
};