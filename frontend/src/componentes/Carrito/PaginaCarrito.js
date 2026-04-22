import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCarrito } from '../../contexto/CarritoContexto';
import '../../estilos/carrito.css';

function formatearPrecio(precio) {
  return `$${Math.round(precio).toLocaleString('es-CO')}`;
}

export default function PaginaCarrito() {
  const { carrito, eliminarItem, sincronizar, cargando, obtenerCarritoConClientes } = useCarrito();
  const navigate = useNavigate();

  useEffect(() => {
    sincronizar();
  }, [sincronizar]);

  const carritoConClientes = obtenerCarritoConClientes();

  const subtotal = carrito.reduce((s, item) => s + Number(item.producto?.Precio_Producto || item.Precio_Total || 0), 0);
  const iva = subtotal * 0.10;
  const total = subtotal + iva;

  const procederAlPago = () => {
    if (!carrito.length) { alert('⚠️ No hay productos en el carrito'); return; }
    
    // Guardar datos del carrito en localStorage para que Entrega/Pago/Factura los lean
    const resumenCarrito = carritoConClientes.map(item => ({
      id: item.Id_Carrito,
      productoId: item.Id_Producto || item.producto?.Id_Producto,
      nombre: item.producto?.Nombre_Producto || 'Producto',
      precio: Number(item.producto?.Precio_Producto || 0),
      cantidad: item.Cantidad_Productos || 1,
      precioTotal: Number(item.Precio_Total || 0),
      imagen: item.producto?.Imagen || item.producto?.Imagen_Producto || '',
      cliente: item.cliente || null,
      personalizacion: item.personalizacion || null,
    }));
    localStorage.setItem('productoCarrito', JSON.stringify(resumenCarrito));
    
    navigate('/carrito/entrega');
  };

  return (
    <div className="pagina-carrito">
      <header className="encabezado-principal">
        <div className="barra-navegacion-contenido">
          <div className="logo-nombre-marca">
            <i className="fas fa-folder"></i>
            <span>Communicating Design Lion</span>
          </div>
          <button className="boton-carrito-header" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <i className="fas fa-shopping-cart"></i>
            <span>Carrito</span>
            <span className="badge-cantidad-carrito" style={{ display: carrito.length ? 'flex' : 'none' }}>{carrito.length}</span>
          </button>
        </div>
      </header>

      <div className="zona-boton-regresar">
        <Link to="/" className="enlace-regresar-tienda" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          ← Continuar comprando
        </Link>
      </div>

      <main className="estructura-dos-columnas">
        <section className="columna-lista-productos">
          <div className="titulo-seccion-carrito">
            <i className="fas fa-shopping-cart"></i>
            <h1>Mi Carrito</h1>
          </div>
          <div id="listaProductosCarrito" className="contenedor-productos-renderizados">
            {cargando ? (
              <div className="aviso-carrito-vacio">
                <div className="emoji-carrito-vacio">⏳</div>
                <h3>Cargando carrito...</h3>
              </div>
            ) : !carrito.length ? (
              <div className="aviso-carrito-vacio">
                <div className="emoji-carrito-vacio">🛒</div>
                <h3>Tu carrito está vacío</h3>
                <p style={{ color: 'var(--texto-secundario)', margin: '10px 0' }}>Aún no has seleccionado ningún producto o paquete</p>
                <button onClick={() => navigate('/')}>Ir a Productos</button>
              </div>
            ) : (
              carritoConClientes.map((item) => (
                <div key={item.Id_Carrito} className="tarjeta-producto-carrito" style={{ marginBottom: '20px' }}>
                  <div className="imagen-miniatura-producto">
                    <img src={item.producto?.Imagen || item.producto?.Imagen_Producto || ''} alt={item.producto?.Nombre_Producto}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&q=80'; }} />
                  </div>
                  <div className="datos-texto-producto">
                    <div>
                      <h3 className="titulo-nombre-producto">{item.producto?.Nombre_Producto}</h3>
                      <div className="precio-unitario-producto">{formatearPrecio(item.producto?.Precio_Producto || 0)}</div>
                      {item.Cantidad_Productos > 1 && (
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                          Cantidad: {item.Cantidad_Productos}
                        </div>
                      )}
                    </div>
                    {item.cliente && (
                      <div className="bloque-info-cliente">
                        <div className="fila-campo-cliente"><span className="etiqueta-dato-cliente">Cliente:</span><span className="valor-dato-cliente">{item.cliente.nombreCompleto || 'N/A'}</span></div>
                        <div className="fila-campo-cliente"><span className="etiqueta-dato-cliente">Teléfono:</span><span className="valor-dato-cliente">{item.cliente.telefono || 'N/A'}</span></div>
                        {item.cliente.correoElectronico && (
                          <div className="fila-campo-cliente"><span className="etiqueta-dato-cliente">Correo:</span><span className="valor-dato-cliente">{item.cliente.correoElectronico}</span></div>
                        )}
                        {item.cliente.nombreDestinatario && (
                          <div className="fila-campo-cliente"><span className="etiqueta-dato-cliente">Destinatario:</span><span className="valor-dato-cliente">{item.cliente.nombreDestinatario}</span></div>
                        )}
                      </div>
                    )}
                    {item.personalizacion && (
                      <div className="bloque-texto-personalizacion"><strong>Personalización:</strong><br />{item.personalizacion}</div>
                    )}
                    <div style={{ marginTop: '15px' }}>
                      <button onClick={() => eliminarItem(item.Id_Carrito)} style={{ background: 'transparent', border: '1px solid rgba(255,8,68,0.4)', color: '#ff0844', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,8,68,0.15)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {carrito.length > 0 && (
          <aside className="panel-lateral-resumen">
            <h2 className="titulo-resumen-lateral">Resumen</h2>
            <div className="grupo-filas-totales">
              <div className="fila-detalle-precio"><span>Subtotal:</span><span>{formatearPrecio(subtotal)}</span></div>
              <div className="fila-detalle-precio"><span>IVA (10%):</span><span>{formatearPrecio(iva)}</span></div>
              <div className="fila-detalle-precio fila-precio-total"><span>Total:</span><span>{formatearPrecio(total)}</span></div>
            </div>
            <button className="boton-proceder-pago" onClick={procederAlPago}>Proceder al Pago</button>
          </aside>
        )}
      </main>
    </div>
  );
}
