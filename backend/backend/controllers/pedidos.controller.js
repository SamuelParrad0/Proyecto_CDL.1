const { Pedido, DetallePedido, Carrito, Producto, Usuario } = require('../models');

// POST /api/pedidos — Crear pedido
const crearPedido = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;
    const { direccionEnvio, telefono, notas } = req.body;

    // Obtener items del carrito del usuario
    const itemsCarrito = await Carrito.findAll({
      where: { Id_Usuario: usuarioId, Estado_Carrito: 'activo' },
      include: [{ model: Producto, as: 'producto' }]
    });

    if (!itemsCarrito.length) {
      return res.status(400).json({ ok: false, mensaje: 'El carrito está vacío' });
    }

    // Crear pedido base
    const pedido = await Pedido.create({
      usuarioId,
      total: 0,
      direccionEnvio,
      telefono,
      notas
    });

    // Crear detalles desde el carrito
    const detalles = [];
    for (const item of itemsCarrito) {
      const precioUnitario = parseFloat(item.Precio_Total) / item.Cantidad_Productos;
      const detalle = await DetallePedido.create({
        pedidoId: pedido.id,
        productoId: item.Id_Producto,
        cantidad: item.Cantidad_Productos,
        precioUnitario: precioUnitario,
        subtotal: parseFloat(item.Precio_Total)
      });
      detalles.push(detalle);
    }

    // Calcular total
    const total = detalles.reduce((acc, d) => acc + parseFloat(d.subtotal), 0);
    await pedido.update({ total });

    // Vaciar carrito
    await Carrito.destroy({ where: { Id_Usuario: usuarioId, Estado_Carrito: 'activo' } });

    res.status(201).json({
      ok: true,
      mensaje: 'Pedido creado correctamente',
      pedido,
      detalles
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};


// GET /api/pedidos — Mis pedidos
const verMisPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      where: { usuarioId: req.usuarioId },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['Id_Usuario', 'Nombre', 'Correo'] },
        { model: DetallePedido, as: 'detalles', include: [{ model: Producto, as: 'producto' }] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ ok: true, pedidos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener pedidos: ' + error.message });
  }
};


// GET /api/pedidos/:id — Detalle
const verDetallePedido = async (req, res) => {
  try {
    const esAdmin = req.usuarioRol === 'admin';

    const where = esAdmin
      ? { id: req.params.id }
      : { id: req.params.id, usuarioId: req.usuarioId };

    const pedido = await Pedido.findOne({
      where,
      include: [
        { model: Usuario, as: 'usuario', attributes: ['Id_Usuario', 'Nombre', 'Correo'] },
        { model: DetallePedido, as: 'detalles', include: [{ model: Producto, as: 'producto' }] }
      ]
    });

    if (!pedido) {
      return res.status(404).json({ ok: false, mensaje: 'Pedido no encontrado' });
    }

    res.json({ ok: true, pedido });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener el pedido' });
  }
};


// PATCH /api/pedidos/:id/cancelar
const cancelarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findOne({
      where: { id: req.params.id, usuarioId: req.usuarioId }
    });

    if (!pedido) {
      return res.status(404).json({ ok: false, mensaje: 'Pedido no encontrado' });
    }

    if (pedido.estado !== 'pendiente' && pedido.estado !== 'pagado') {
      return res.status(400).json({ ok: false, mensaje: 'No se puede cancelar este pedido' });
    }

    await pedido.update({ estado: 'cancelado' });

    res.json({ ok: true, mensaje: 'Pedido cancelado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};


// GET /api/pedidos/admin/todos
const verTodosPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['Id_Usuario', 'Nombre', 'Correo', 'Celular'] },
        { model: DetallePedido, as: 'detalles', include: [{ model: Producto, as: 'producto' }] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ ok: true, pedidos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al obtener pedidos: ' + error.message });
  }
};


// PUT /api/pedidos/admin/:id/estado
const cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body;

    const pedido = await Pedido.findByPk(req.params.id);

    if (!pedido) {
      return res.status(404).json({ ok: false, mensaje: 'Pedido no encontrado' });
    }

    await pedido.cambiarEstado(estado);

    res.json({ ok: true, mensaje: 'Estado actualizado', pedido });

  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};


// PUT /api/pedidos/:id
const editarPedido = async (req, res) => {
  try {
    const esAdmin = req.usuarioRol === 'admin';
    const where = esAdmin
      ? { id: req.params.id }
      : { id: req.params.id, usuarioId: req.usuarioId };

    const pedido = await Pedido.findOne({ where });

    if (!pedido) {
      return res.status(404).json({ ok: false, mensaje: 'Pedido no encontrado' });
    }

    const { direccionEnvio, telefono, notas } = req.body;

    await pedido.update({
      direccionEnvio: direccionEnvio ?? pedido.direccionEnvio,
      telefono:       telefono       ?? pedido.telefono,
      notas:          notas          ?? pedido.notas
    });

    res.json({ ok: true, mensaje: 'Pedido actualizado', pedido });

  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};



const togglePedido = async (req, res) => {
  try {
    const esAdmin = req.usuarioRol === 'admin';
    const where = esAdmin
      ? { id: req.params.id }
      : { id: req.params.id, usuarioId: req.usuarioId };

    const pedido = await Pedido.findOne({ where });

    if (!pedido) {
      return res.status(404).json({ ok: false, mensaje: 'Pedido no encontrado' });
    }

    const nuevoEstado = pedido.estado === 'cancelado' ? 'pendiente' : 'cancelado';
    await pedido.update({ estado: nuevoEstado });

    res.json({ ok: true, mensaje: `Pedido ${nuevoEstado}`, pedido });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};


// DELETE /api/pedidos/admin/:id
const eliminarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id);

    if (!pedido) {
      return res.status(404).json({ ok: false, mensaje: 'Pedido no encontrado' });
    }

    await pedido.destroy();

    res.json({ ok: true, mensaje: 'Pedido eliminado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};


module.exports = {
  crearPedido,
  verMisPedidos,
  verDetallePedido,
  editarPedido,
  cancelarPedido,
  togglePedido,
  eliminarPedido,
  verTodosPedidos,
  cambiarEstado
};