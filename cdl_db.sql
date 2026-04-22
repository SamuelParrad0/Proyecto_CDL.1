-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-04-2026 a las 22:01:36
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `cdl_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

CREATE TABLE `carrito` (
  `Id_Carrito` int(11) NOT NULL,
  `Id_Usuario` int(11) DEFAULT NULL,
  `Id_Producto` int(11) DEFAULT NULL,
  `Id_Direccion` int(11) DEFAULT NULL,
  `Cantidad_Productos` int(11) DEFAULT NULL,
  `Precio_Total` decimal(10,2) DEFAULT NULL,
  `Estado_Carrito` varchar(50) DEFAULT NULL,
  `Fecha_Creacion` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `Id_Categoria` int(11) NOT NULL,
  `Nombre_Categoria` varchar(100) DEFAULT NULL,
  `Descripcion_Categoria` text DEFAULT NULL,
  `Activo` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`Id_Categoria`, `Nombre_Categoria`, `Descripcion_Categoria`, `Activo`) VALUES
(1, 'Bodas', NULL, 1),
(2, 'Graduaciones', NULL, 1),
(3, 'Eventos', NULL, 1),
(4, 'Productos', '', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedidos`
--

CREATE TABLE `detalle_pedidos` (
  `id` int(11) NOT NULL,
  `pedidoId` int(11) NOT NULL,
  `productoId` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precioUnitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_pedidos`
--

INSERT INTO `detalle_pedidos` (`id`, `pedidoId`, `productoId`, `cantidad`, `precioUnitario`, `subtotal`, `createdAt`, `updatedAt`) VALUES
(2, 2, 1, 2, 25000.00, 50000.00, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(3, 3, 1, 2, 25000.00, 50000.00, '0000-00-00 00:00:00', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `direccion`
--

CREATE TABLE `direccion` (
  `Id_Direccion` int(11) NOT NULL,
  `Id_Usuario` int(11) DEFAULT NULL,
  `Nombre_Completo` varchar(100) DEFAULT NULL,
  `Direccion` varchar(255) DEFAULT NULL,
  `Departamento` varchar(100) DEFAULT NULL,
  `Municipio_Localidad` varchar(100) DEFAULT NULL,
  `Barrio` varchar(100) DEFAULT NULL,
  `Apart_Casa` varchar(50) DEFAULT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `Indicaciones` text DEFAULT NULL,
  `Residencia_Laboral` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `direccion`
--

INSERT INTO `direccion` (`Id_Direccion`, `Id_Usuario`, `Nombre_Completo`, `Direccion`, `Departamento`, `Municipio_Localidad`, `Barrio`, `Apart_Casa`, `Telefono`, `Indicaciones`, `Residencia_Laboral`) VALUES
(1, 1, 'Admin Dir', 'Cra 5', 'Cun', 'Bog', 'Centro', NULL, '000', NULL, 'residencial'),
(3, 3, 'Admin', 'calle 72 b sur #5 - 13', 'Cundinamarca', 'Usme', 'La Aurora', '501', '3001234567', 'Casa de tres pisos', 'residencial'),
(5, 4, 'Samuel Parrado Rodriguez', 'Diagonal 48L sur #05x-09', 'Cundinamarca', 'Rafael Uribe Uribe', 'Portal de Molinos 2', 'Casa', '3194284396', 'Casa esquinera roja', 'residencial'),
(6, 3, 'Juan Perez', 'Carrera 7 # 32-16', 'Cundinamarca', 'Chapinero', 'Palermo', '16', '3001234567', 'Casa verde de 3 pisos', 'residencial');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paquetes`
--

CREATE TABLE `paquetes` (
  `Id_Paquete` int(11) NOT NULL,
  `Activo` tinyint(1) DEFAULT NULL,
  `Nombre_Paquete` varchar(100) DEFAULT NULL,
  `Descripcion_Paquete` text DEFAULT NULL,
  `Precio_Paquete` decimal(10,2) DEFAULT NULL,
  `Imagen_Paquete` varchar(255) DEFAULT NULL,
  `Id_Imagen` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `paquetes`
--

INSERT INTO `paquetes` (`Id_Paquete`, `Activo`, `Nombre_Paquete`, `Descripcion_Paquete`, `Precio_Paquete`, `Imagen_Paquete`, `Id_Imagen`) VALUES
(1, 1, 'Paquete Alpha', 'Ideal para eventos íntimos y sesiones personales.', 1500000.00, NULL, NULL),
(2, 1, 'Paquete Bravo', 'La opción preferida para bodas y quinceaños medianos.', 2800000.00, NULL, NULL),
(3, 1, 'Paquete Charlie', 'Cobertura completa premium para grandes celebraciones.', 4200000.00, NULL, NULL),
(4, 1, 'Paquete Delta', 'Especializado en graduaciones y eventos escolares.', 1800000.00, NULL, NULL),
(5, 1, 'Paquete Foxtrot', 'Producción de video cinematográfica y streaming.', 3500000.00, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `usuarioId` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` enum('pendiente','pagado','enviado','entregado','cancelado') DEFAULT 'pendiente',
  `direccionEnvio` text NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `notas` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `usuarioId`, `total`, `estado`, `direccionEnvio`, `telefono`, `notas`, `createdAt`, `updatedAt`) VALUES
(2, 1, 50000.00, 'pendiente', 'Calle 100', '3000000', 'Cuidado', '2026-04-20 17:50:40', '2026-04-20 17:50:40'),
(3, 3, 50000.00, 'pendiente', 'Calle 100 #20-30', '3000000000', 'Dejar en apto 201', '2026-04-20 20:48:00', '2026-04-20 20:53:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personalizado`
--

CREATE TABLE `personalizado` (
  `Id_Personalizado` int(11) NOT NULL,
  `Id_Usuario` int(11) DEFAULT NULL,
  `Nombre_Completo` varchar(100) DEFAULT NULL,
  `Correo` varchar(100) DEFAULT NULL,
  `Numero_Telefono` varchar(20) DEFAULT NULL,
  `Destinatario` varchar(100) DEFAULT NULL,
  `Descripcion_Idea` text DEFAULT NULL,
  `Elementos_Esenciales` text DEFAULT NULL,
  `Prioridad_Cliente` varchar(50) DEFAULT NULL,
  `Comentarios_Adicionales` text DEFAULT NULL,
  `Estado_Personalizado` varchar(50) DEFAULT NULL,
  `Fecha_Solicitud` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `personalizado`
--

INSERT INTO `personalizado` (`Id_Personalizado`, `Id_Usuario`, `Nombre_Completo`, `Correo`, `Numero_Telefono`, `Destinatario`, `Descripcion_Idea`, `Elementos_Esenciales`, `Prioridad_Cliente`, `Comentarios_Adicionales`, `Estado_Personalizado`, `Fecha_Solicitud`) VALUES
(1, 1, 'Admin', 'admin@cdl.com', '3000000', 'Cliente 1', 'Caja sorpresa', 'Chocolate', 'alta', 'Urgente', 'pendiente', '2026-04-20'),
(3, 3, 'Juan', 'juan@cliente.com', '300', 'Esposa', 'Arreglo floral gigante', 'Rosas rojas', 'alta', 'Ninguno', 'pendiente', '2026-04-20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `portafolio_galeria`
--

CREATE TABLE `portafolio_galeria` (
  `Id_Imagen` int(11) NOT NULL,
  `Id_Categoria` int(11) DEFAULT NULL,
  `Nombre_Imagen` varchar(100) DEFAULT NULL,
  `Descripcion_Imagen` text DEFAULT NULL,
  `Archivo` varchar(255) DEFAULT NULL,
  `Activo` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `Id_Producto` int(11) NOT NULL,
  `Activo` tinyint(1) DEFAULT NULL,
  `Nombre_Producto` varchar(100) DEFAULT NULL,
  `Descripcion_Producto` text DEFAULT NULL,
  `Precio_Producto` decimal(10,2) DEFAULT NULL,
  `Imagen_Producto` varchar(255) DEFAULT NULL,
  `Id_Imagen` int(11) DEFAULT NULL,
  `Id_Categoria` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`Id_Producto`, `Activo`, `Nombre_Producto`, `Descripcion_Producto`, `Precio_Producto`, `Imagen_Producto`, `Id_Imagen`, `Id_Categoria`) VALUES
(1, 1, 'Cajita Corazón', 'Cajita decorativa con diseño de corazón.', 25000.00, NULL, NULL, 4),
(2, 1, 'Bolsa Sorpresa', 'Bolsa llena de sorpresas personalizadas.', 65000.00, NULL, NULL, 4),
(3, 1, 'Caja Multifotográfica', 'Caja con múltiples fotos desplegables.', 65000.00, NULL, NULL, 4),
(4, 1, 'Libro Emoción', 'Libro álbum para capturar emociones.', 95000.00, NULL, NULL, 4),
(5, 1, 'Arreglo Floral', 'Mix de rosas', 90000.00, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reserva_paquetes`
--

CREATE TABLE `reserva_paquetes` (
  `Id_Reserva_Paquete` int(11) NOT NULL,
  `Id_Paquete` int(11) DEFAULT NULL,
  `Id_Usuario` int(11) DEFAULT NULL,
  `Nombre_Completo` varchar(100) DEFAULT NULL,
  `Correo` varchar(100) DEFAULT NULL,
  `Numero_Telefono` varchar(20) DEFAULT NULL,
  `Tipo_Evento` varchar(100) DEFAULT NULL,
  `Fecha_Evento` date DEFAULT NULL,
  `Fecha_Reserva` date DEFAULT NULL,
  `Numero_Invitados` int(11) DEFAULT NULL,
  `Informacion_Adicional` text DEFAULT NULL,
  `Estado_Reserva_Paquete` varchar(50) DEFAULT NULL,
  `Precio_Total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reserva_paquetes`
--

INSERT INTO `reserva_paquetes` (`Id_Reserva_Paquete`, `Id_Paquete`, `Id_Usuario`, `Nombre_Completo`, `Correo`, `Numero_Telefono`, `Tipo_Evento`, `Fecha_Evento`, `Fecha_Reserva`, `Numero_Invitados`, `Informacion_Adicional`, `Estado_Reserva_Paquete`, `Precio_Total`) VALUES
(2, 1, 1, 'Cliente X', 'x@x.com', '123', 'Cumpleaños', '2024-12-01', '2026-04-20', 50, 'N/A', 'pendiente', NULL),
(3, 1, 3, 'Juan Perez', 'juan@cliente.com', '300000', 'Boda', '2025-05-10', '2026-04-20', 120, 'N/A', 'cancelada', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reseñas`
--

CREATE TABLE `reseñas` (
  `Id_Reseña` int(11) NOT NULL,
  `Nombre_Usuario` varchar(100) DEFAULT NULL,
  `Calificacion` int(11) DEFAULT NULL,
  `Comentario` text DEFAULT NULL,
  `Id_Usuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reseñas`
--

INSERT INTO `reseñas` (`Id_Reseña`, `Nombre_Usuario`, `Calificacion`, `Comentario`, `Id_Usuario`) VALUES
(1, 'Admin', 5, 'Excelente servicio', NULL),
(2, 'Juan', 4, 'Muy buen servicio', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `Id_Rol` int(11) NOT NULL,
  `Nombre_Rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`Id_Rol`, `Nombre_Rol`) VALUES
(1, 'admin'),
(2, 'cliente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `Id_Usuario` int(11) NOT NULL,
  `Nombre` varchar(100) DEFAULT NULL,
  `Apellidos` varchar(100) DEFAULT NULL,
  `Celular` varchar(20) DEFAULT NULL,
  `Correo` varchar(100) DEFAULT NULL,
  `Contraseña` varchar(255) DEFAULT NULL,
  `Id_Rol` int(11) DEFAULT NULL,
  `Activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`Id_Usuario`, `Nombre`, `Apellidos`, `Celular`, `Correo`, `Contraseña`, `Id_Rol`, `Activo`) VALUES
(1, 'Admin', 'Nuevo', '3000000000', 'admin@cdl.com', '$2a$10$a93lXmKVDGf1kGanpvD1QOhh4UW3kEhyfMygoPwsbxsjtYzfTOPeq', 1, 1),
(3, 'Juan Carlos', 'Perez', '3009876543', 'juan@cliente.com', '$2a$10$Y95G2XY9Sur6HVFi/Ojlzet1mZdpRIHo55jL2P6hw8IsM5JOwgj7C', 2, 1),
(4, 'Samuel', 'Parrado', '3194284396', 'samuel.parrado01@gmail.com', '$2a$10$PO1fe/BPvtTsXpRn7RU3SeMtj.qNm5AYs0MA1mOPQYxy23Hy43yF6', 2, 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`Id_Carrito`),
  ADD KEY `Id_Usuario` (`Id_Usuario`),
  ADD KEY `Id_Producto` (`Id_Producto`),
  ADD KEY `Id_Direccion` (`Id_Direccion`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`Id_Categoria`);

--
-- Indices de la tabla `detalle_pedidos`
--
ALTER TABLE `detalle_pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedidoId` (`pedidoId`),
  ADD KEY `productoId` (`productoId`);

--
-- Indices de la tabla `direccion`
--
ALTER TABLE `direccion`
  ADD PRIMARY KEY (`Id_Direccion`),
  ADD KEY `Id_Usuario` (`Id_Usuario`);

--
-- Indices de la tabla `paquetes`
--
ALTER TABLE `paquetes`
  ADD PRIMARY KEY (`Id_Paquete`),
  ADD KEY `Id_Imagen` (`Id_Imagen`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuarioId` (`usuarioId`);

--
-- Indices de la tabla `personalizado`
--
ALTER TABLE `personalizado`
  ADD PRIMARY KEY (`Id_Personalizado`),
  ADD KEY `Id_Usuario` (`Id_Usuario`);

--
-- Indices de la tabla `portafolio_galeria`
--
ALTER TABLE `portafolio_galeria`
  ADD PRIMARY KEY (`Id_Imagen`),
  ADD KEY `Id_Categoria` (`Id_Categoria`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`Id_Producto`),
  ADD KEY `Id_Imagen` (`Id_Imagen`),
  ADD KEY `Id_Categoria` (`Id_Categoria`);

--
-- Indices de la tabla `reserva_paquetes`
--
ALTER TABLE `reserva_paquetes`
  ADD PRIMARY KEY (`Id_Reserva_Paquete`),
  ADD KEY `Id_Paquete` (`Id_Paquete`),
  ADD KEY `Id_Usuario` (`Id_Usuario`);

--
-- Indices de la tabla `reseñas`
--
ALTER TABLE `reseñas`
  ADD PRIMARY KEY (`Id_Reseña`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`Id_Rol`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`Id_Usuario`),
  ADD KEY `Id_Rol` (`Id_Rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carrito`
--
ALTER TABLE `carrito`
  MODIFY `Id_Carrito` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `Id_Categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `detalle_pedidos`
--
ALTER TABLE `detalle_pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `direccion`
--
ALTER TABLE `direccion`
  MODIFY `Id_Direccion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `paquetes`
--
ALTER TABLE `paquetes`
  MODIFY `Id_Paquete` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `personalizado`
--
ALTER TABLE `personalizado`
  MODIFY `Id_Personalizado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `portafolio_galeria`
--
ALTER TABLE `portafolio_galeria`
  MODIFY `Id_Imagen` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `Id_Producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `reserva_paquetes`
--
ALTER TABLE `reserva_paquetes`
  MODIFY `Id_Reserva_Paquete` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `reseñas`
--
ALTER TABLE `reseñas`
  MODIFY `Id_Reseña` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `Id_Rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `Id_Usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuarios` (`Id_Usuario`),
  ADD CONSTRAINT `carrito_ibfk_2` FOREIGN KEY (`Id_Producto`) REFERENCES `productos` (`Id_Producto`),
  ADD CONSTRAINT `carrito_ibfk_3` FOREIGN KEY (`Id_Direccion`) REFERENCES `direccion` (`Id_Direccion`),
  ADD CONSTRAINT `direccion_ibfk_1` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuarios` (`Id_Usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `detalle_pedidos`
--
ALTER TABLE `detalle_pedidos`
  ADD CONSTRAINT `detalle_pedidos_ibfk_1` FOREIGN KEY (`pedidoId`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_pedidos_ibfk_2` FOREIGN KEY (`productoId`) REFERENCES `productos` (`Id_Producto`);

--
-- Filtros para la tabla `paquetes`
--
ALTER TABLE `paquetes`
  ADD CONSTRAINT `paquetes_ibfk_1` FOREIGN KEY (`Id_Imagen`) REFERENCES `portafolio_galeria` (`Id_Imagen`);

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios` (`Id_Usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `personalizado`
--
ALTER TABLE `personalizado`
  ADD CONSTRAINT `personalizado_ibfk_1` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuarios` (`Id_Usuario`);

--
-- Filtros para la tabla `portafolio_galeria`
--
ALTER TABLE `portafolio_galeria`
  ADD CONSTRAINT `portafolio_galeria_ibfk_1` FOREIGN KEY (`Id_Categoria`) REFERENCES `categorias` (`Id_Categoria`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`Id_Imagen`) REFERENCES `portafolio_galeria` (`Id_Imagen`),
  ADD CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`Id_Categoria`) REFERENCES `categorias` (`Id_Categoria`);

--
-- Filtros para la tabla `reserva_paquetes`
--
ALTER TABLE `reserva_paquetes`
  ADD CONSTRAINT `reserva_paquetes_ibfk_1` FOREIGN KEY (`Id_Paquete`) REFERENCES `paquetes` (`Id_Paquete`),
  ADD CONSTRAINT `reserva_paquetes_ibfk_2` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuarios` (`Id_Usuario`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`Id_Rol`) REFERENCES `rol` (`Id_Rol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
