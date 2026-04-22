/**
 * MODELO PRODUCTO — Coincide con tabla `productos` de la BD
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Producto = sequelize.define('Producto', {

  Id_Producto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  Activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  Nombre_Producto: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      notEmpty: { msg: 'El nombre no puede estar vacío' }
    }
  },

  Descripcion_Producto: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  Precio_Producto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      isDecimal: { msg: 'El precio debe ser válido' },
      min: {
        args: [0],
        msg: 'El precio no puede ser negativo'
      }
    }
  },

  Imagen_Producto: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  Id_Imagen: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  Id_Categoria: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categorias',
      key: 'Id_Categoria'
    }
  }

}, {
  tableName: 'productos',
  timestamps: false
});

// ==========================================
// MÉTODOS DE INSTANCIA
// ==========================================

Producto.prototype.obtenerUrlImagen = function () {
  if (!this.Imagen_Producto) return null;
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${this.Imagen_Producto}`;
};

module.exports = Producto;