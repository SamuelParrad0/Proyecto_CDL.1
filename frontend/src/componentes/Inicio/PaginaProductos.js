import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavegacionPrincipal from '../compartidos/NavegacionPrincipal';
import BarraEntrega from '../compartidos/BarraEntrega';
import RedesSocialesFlotantes from '../compartidos/RedesSocialesFlotantes';
import { useToast } from '../compartidos/useToast';
import { useScrollReveal } from '../compartidos/useScrollReveal';
import { useCarrito } from '../../contexto/CarritoContexto';
import { obtenerProductosAPI, obtenerCategoriasAPI } from '../../servicios/api';

export default function PaginaProductos() {
  const { toastMensaje, toastVisible, mostrarToast } = useToast();
  const { agregarItem } = useCarrito();
  const navigate = useNavigate();
  useScrollReveal();

  const [productosAPI, setProductosAPI] = useState([]);
  const [categoriasAPI, setCategoriasAPI] = useState([]);
  const [cargandoTienda, setCargandoTienda] = useState(true);
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [productoActivo, setProductoActivo] = useState(null);
  const [indiceImagenProducto, setIndiceImagenProducto] = useState(0);
  const [modalFormularioPedido, setModalFormularioPedido] = useState(false);
  const [productoPedido, setProductoPedido] = useState(null);
  const [formularioPedido, setFormularioPedido] = useState({ nombreCompleto: '', telefono: '', correoElectronico: '', nombreDestinatario: '', personalizacion: '' });
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resProd, resCat] = await Promise.all([obtenerProductosAPI(), obtenerCategoriasAPI()]);
        setProductosAPI(resProd);
        setCategoriasAPI(resCat);
      } catch (e) { console.error(e); }
      finally { setCargandoTienda(false); }
    };
    cargar();
  }, []);

  const abrirModalProducto = (id) => {
    const producto = productosAPI.find(p => p.Id_Producto === id);
    if (!producto) return;
    setProductoActivo({ Id_Producto: producto.Id_Producto, nombre: producto.Nombre_Producto, precio: producto.Precio_Producto, imagenes: [producto.Imagen, ...(producto.Imagenes_Adicionales || [])].filter(Boolean) });
    setIndiceImagenProducto(0);
    setModalProductoAbierto(true);
    document.body.style.overflow = 'hidden';
  };

  const cerrarModalProducto = () => { setModalProductoAbierto(false); document.body.style.overflow = ''; setProductoActivo(null); };
  const navImagenProducto = (d) => { if (!productoActivo) return; setIndiceImagenProducto(prev => (prev + d + productoActivo.imagenes.length) % productoActivo.imagenes.length); };

  const abrirFormularioPedido = (producto) => {
    setProductoPedido(producto);
    setFormularioPedido({ nombreCompleto: '', telefono: '', correoElectronico: '', nombreDestinatario: '', personalizacion: '' });
    setModalFormularioPedido(true);
    document.body.style.overflow = 'hidden';
  };

  const cerrarFormularioPedido = () => { setModalFormularioPedido(false); document.body.style.overflow = ''; setProductoPedido(null); };

  const enviarFormularioPedido = async () => {
    if (!formularioPedido.nombreCompleto.trim()) { mostrarToast('⚠️ Ingresa tu nombre completo'); return; }
    if (!formularioPedido.telefono.trim()) { mostrarToast('⚠️ Ingresa tu número de teléfono'); return; }
    setEnviandoPedido(true);
    try {
      const exito = await agregarItem(productoPedido.Id_Producto || productoPedido.id, 1, formularioPedido);
      if (exito) { cerrarFormularioPedido(); cerrarModalProducto(); mostrarToast('✅ Producto agregado al carrito'); setTimeout(() => navigate('/carrito'), 600); }
    } catch { mostrarToast('⚠️ Error al agregar al carrito'); }
    finally { setEnviandoPedido(false); }
  };

  const pedirProducto = (id) => {
    const prod = productosAPI.find(p => p.Id_Producto === id);
    if (prod) abrirFormularioPedido({ Id_Producto: prod.Id_Producto, nombre: prod.Nombre_Producto, precio: prod.Precio_Producto, imagen: prod.Imagen });
  };

  return (
    <div>
      <BarraEntrega mostrarToast={mostrarToast} />
      <NavegacionPrincipal />

      <section className="seccion-productos seccion-espaciado" style={{ paddingTop: '120px' }}>
        <div className="contenedor">
          <div className="encabezado-seccion animar-entrada" style={{ marginBottom: '5rem' }}>
            <h2 className="titulo-seccion">NUESTROS <span>PRODUCTOS</span></h2>
          </div>
          {cargandoTienda ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '4rem 0' }}>Cargando catálogo...</div>
          ) : (
            categoriasAPI.filter(cat => cat.Activo !== false && cat.Activo !== 0).map((cat) => {
              const productosDeCat = productosAPI.filter(p => p.Id_Categoria == cat.Id_Categoria && (p.Activo !== false && p.Activo !== 0));
              if (productosDeCat.length === 0) return null;
              return (
                <div key={cat.Id_Categoria} className="categoria-grupo" style={{ marginBottom: '6rem' }}>
                  <div className="encabezado-categoria animar-entrada" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                    <span className="etiqueta-seccion">{cat.Nombre_Categoria}</span>
                    <p className="subtitulo-seccion" style={{ marginTop: '0.5rem' }}>{cat.Descripcion_Categoria}</p>
                  </div>
                  <div className="productos-cuadricula">
                    {productosDeCat.map(p => (
                      <div key={p.Id_Producto} className="tarjeta-producto animar-entrada">
                        <div className="producto-imagen-contenedor" onClick={() => abrirModalProducto(p.Id_Producto)}>
                          <img className="producto-imagen" src={p.imagenUrl || p.Imagen || p.Imagen_Producto} alt={p.Nombre_Producto} loading="lazy" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=700&q=80'; }} />
                          <div className="producto-imagen-overlay"></div>
                          <div className="producto-precio-etiqueta"><span className="producto-precio-monto">${Number(p.Precio_Producto).toLocaleString('es-CO')}</span></div>
                        </div>
                        <div className="producto-informacion">
                          <div className="producto-nombre">{p.Nombre_Producto}</div>
                          <button className="producto-boton-agregar" style={{ width: '100%', borderRadius: '50px' }} onClick={() => pedirProducto(p.Id_Producto)}>
                            <i className="fas fa-bolt"></i> Pedir Ahora
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Modal Producto */}
      <div className={`modal-producto-fondo${modalProductoAbierto ? ' active' : ''}`}>
        <div className="modal-producto-caja">
          <button className="modal-boton-cerrar" onClick={cerrarModalProducto}><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
          {productoActivo && (
            <div className="modal-disposicion">
              <div className="modal-galeria">
                <img className="modal-imagen-principal" src={productoActivo.imagenes[indiceImagenProducto]} alt={productoActivo.nombre} />
                <button className="modal-boton-navegacion prev" onClick={() => navImagenProducto(-1)}><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg></button>
                <button className="modal-boton-navegacion next" onClick={() => navImagenProducto(1)}><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg></button>
                <div className="modal-contador-imagenes">{indiceImagenProducto + 1} / {productoActivo.imagenes.length}</div>
              </div>
              <div className="modal-detalles">
                <div>
                  <div className="modal-nombre-producto">{productoActivo.nombre}</div>
                  <div className="modal-precio-producto">${productoActivo.precio.toLocaleString('es-CO')}</div>
                  <div className="modal-miniaturas">
                    {productoActivo.imagenes.map((img, i) => (
                      <div key={i} className={`modal-miniatura${i === indiceImagenProducto ? ' active' : ''}`} onClick={() => setIndiceImagenProducto(i)}><img src={img} alt="" /></div>
                    ))}
                  </div>
                </div>
                <div className="modal-grupo-botones">
                  <button className="modal-boton-pedir" onClick={() => abrirFormularioPedido(productoActivo)}><i className="fas fa-bolt"></i> Pedir Ahora</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Formulario Pedido */}
      <div className={`modal-producto-fondo${modalFormularioPedido ? ' active' : ''}`} onClick={(e) => e.target === e.currentTarget && cerrarFormularioPedido()} style={{ zIndex: 10001 }}>
        <div className="modal-producto-caja" style={{ maxWidth: '560px', padding: '0' }}>
          <button className="modal-boton-cerrar" onClick={cerrarFormularioPedido} style={{ zIndex: 2 }}><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
          {productoPedido && (
            <div style={{ padding: '2.5rem 2rem 2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Formulario de Pedido</h2>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{productoPedido.nombre} — ${Number(productoPedido.precio).toLocaleString('es-CO')}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Nombre Completo *', key: 'nombreCompleto', type: 'text', ph: 'Ej: Juan Pérez' },
                  { label: 'Teléfono *', key: 'telefono', type: 'tel', ph: '+57 300 000 0000' },
                  { label: 'Correo Electrónico', key: 'correoElectronico', type: 'email', ph: 'tu@correo.com' },
                  { label: 'Nombre del Destinatario', key: 'nombreDestinatario', type: 'text', ph: 'Si es un regalo, ¿para quién?' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontFamily: "'Rajdhani', sans-serif", fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>{f.label}</label>
                    <input type={f.type} placeholder={f.ph} value={formularioPedido[f.key]} onChange={e => setFormularioPedido(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '1.5rem' }}>
                <button onClick={cerrarFormularioPedido} style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={enviarFormularioPedido} disabled={enviandoPedido} style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, #ff0844, #800020)', border: 'none', borderRadius: '12px', color: '#fff', cursor: enviandoPedido ? 'wait' : 'pointer', opacity: enviandoPedido ? 0.7 : 1 }}>
                  <i className="fas fa-shopping-cart"></i> {enviandoPedido ? 'Agregando...' : 'Agregar al Carrito'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <RedesSocialesFlotantes />
      <div className={`notificacion-emergente${toastVisible ? ' show' : ''}`}>
        <span className="notificacion-icono">✅</span>
        <span className="notificacion-mensaje">{toastMensaje}</span>
        <div className="notificacion-progreso"></div>
      </div>
    </div>
  );
}