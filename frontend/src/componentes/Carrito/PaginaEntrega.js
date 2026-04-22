import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../estilos/entrega.css';

const CART_KEY = 'productoCarrito';
const DIR_KEY = 'cdl_direccion';
const DIRS_KEY = 'cdl_dirs_entrega';

function obtenerCarrito() {
  try { const d = localStorage.getItem(CART_KEY); if (!d) return []; const p = JSON.parse(d); return Array.isArray(p) ? p : [p]; } catch { return []; }
}
function formatearPrecio(p) { return `$${Math.round(p).toLocaleString('es-CO')}`; }

function obtenerDirecciones() {
  const dirs = [];
  try { const r = localStorage.getItem(DIR_KEY); if (r) { const d = JSON.parse(r); if (d.direccion) dirs.push(d); } } catch {}
  try { const r = localStorage.getItem(DIRS_KEY); if (r) { const e = JSON.parse(r); if (Array.isArray(e)) dirs.push(...e); } } catch {}
  return dirs;
}

export default function PaginaEntrega() {
  const navigate = useNavigate();
  const [carrito] = useState(obtenerCarrito);
  const [dirs, setDirs] = useState(obtenerDirecciones);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(0);
  const [panelVisible, setPanelVisible] = useState(false);
  const [mostrarFormNueva, setMostrarFormNueva] = useState(false);
  const [nuevaDireccion, setNuevaDireccion] = useState('');
  const [nuevaCiudad, setNuevaCiudad] = useState('');
  const [nuevaTelefono, setNuevaTelefono] = useState('');

  useEffect(() => { if (!carrito.length) navigate('/carrito'); }, [carrito, navigate]);

  const subtotal = carrito.reduce((s, i) => s + (Number(i.precio) || Number(i.precioTotal) || 0), 0);

  const eliminarDireccion = () => {
    if (!window.confirm('¿Eliminar esta dirección?')) return;
    const nuevas = dirs.filter((_, i) => i !== indiceSeleccionado);
    const hayPrincipal = (() => { try { const r=localStorage.getItem(DIR_KEY); return r && JSON.parse(r).direccion; } catch { return false; } })();
    if (indiceSeleccionado === 0 && hayPrincipal) localStorage.removeItem(DIR_KEY);
    localStorage.setItem(DIRS_KEY, JSON.stringify(hayPrincipal ? nuevas.slice(1) : nuevas));
    setDirs(nuevas);
    setIndiceSeleccionado(0);
    setPanelVisible(false);
  };

  const agregarNueva = () => {
    if (!nuevaDireccion.trim()) { alert('⚠️ Ingresa la dirección'); return; }
    const nueva = { direccion: nuevaDireccion, municipio: nuevaCiudad, telefono: nuevaTelefono };
    const hayPrincipal = (() => { try { const r=localStorage.getItem(DIR_KEY); return r && JSON.parse(r).direccion; } catch { return false; } })();
    const extras = hayPrincipal ? dirs.slice(1) : dirs;
    localStorage.setItem(DIRS_KEY, JSON.stringify([...extras, nueva]));
    setDirs(obtenerDirecciones());
    setMostrarFormNueva(false);
    setNuevaDireccion(''); setNuevaCiudad(''); setNuevaTelefono('');
  };

  const continuar = () => {
    if (!dirs.length) { alert('⚠️ Agrega una dirección de entrega'); return; }
    localStorage.setItem('cdl_entrega_seleccionada', JSON.stringify(dirs[indiceSeleccionado]));
    navigate('/carrito/pago');
  };

  const dirActual = dirs[indiceSeleccionado];

  return (
    <div className="pagina-entrega">
      <header className="encabezado-pagina-entrega">
        <div className="barra-navegacion-entrega">
          <div className="logo-nombre-entrega"><i className="fas fa-truck"></i><span>Communicating Design Lion</span></div>
          <div className="indicador-pasos-compra">
            <div className="paso-proceso completado"><span className="circulo-numero-paso">✓</span><span className="etiqueta-nombre-paso">Carrito</span></div>
            <div className="linea-separadora-paso completada"></div>
            <div className="paso-proceso activo"><span className="circulo-numero-paso">2</span><span className="etiqueta-nombre-paso">Entrega</span></div>
            <div className="linea-separadora-paso"></div>
            <div className="paso-proceso"><span className="circulo-numero-paso">3</span><span className="etiqueta-nombre-paso">Pago</span></div>
          </div>
        </div>
      </header>

      <div className="zona-boton-volver">
        <button className="boton-regresar-carrito" onClick={() => navigate('/carrito')}>
          <i className="fas fa-arrow-left"></i> Volver al carrito
        </button>
      </div>

      <main className="estructura-dos-columnas-entrega">
        <section className="columna-formulario-entrega">
          <h1 className="titulo-principal-entrega">Elige dónde recibir tus compras</h1>
          <p className="descripcion-entrega">Podrás ver costos y tiempos de entrega precisos en todo lo que busques.</p>

          <div className="bloque-seleccion-direccion">
            <h3 className="subtitulo-bloque-direccion">En una de tus direcciones</h3>
            <div id="listaDireccionesGuardadas">
              {!dirs.length ? (
                <p className="aviso-sin-direcciones">No tienes ninguna dirección guardada. Agrega una abajo.</p>
              ) : (
                dirs.map((dir, i) => {
                  const linea1 = [dir.direccion, dir.apto].filter(Boolean).join(' ');
                  const linea2 = [dir.barrio, dir.municipio, dir.departamento].filter(Boolean).join(' - ') + (dir.nombre && dir.telefono ? ` | ${dir.nombre} - ${dir.telefono}` : '');
                  return (
                    <div key={i} className={`tarjeta-opcion-direccion${i === indiceSeleccionado ? ' seleccionada' : ''}`} onClick={() => { setIndiceSeleccionado(i); setPanelVisible(false); }}>
                      <div className="radio-seleccion-direccion"></div>
                      <div>
                        <div className="texto-principal-direccion">{linea1}</div>
                        {linea2 && <div className="texto-secundario-direccion">{linea2}</div>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {dirs.length > 0 && (
              <div className="grupo-botones-direccion">
                <button className="boton-accion-direccion boton-eliminar-direccion" onClick={eliminarDireccion}>
                  <i className="fas fa-trash-alt"></i> Eliminar dirección
                </button>
                <button className="boton-accion-direccion boton-ver-detalle-direccion" onClick={() => setPanelVisible(p => !p)}>
                  <i className="fas fa-eye"></i> {panelVisible ? 'Ocultar' : 'Ver dirección completa'}
                </button>
              </div>
            )}

            {panelVisible && dirActual && (
              <div className="panel-detalle-direccion" id="panelDetalleDireccion" style={{ display: 'block' }}>
                <div className="contenido-detalle-direccion">
                  {[
                    ['Nombre', dirActual.nombre], ['Dirección', dirActual.direccion], ['Barrio', dirActual.barrio],
                    ['Municipio', dirActual.municipio], ['Departamento', dirActual.departamento],
                    ['Apto/Casa', dirActual.apto], ['Teléfono', dirActual.telefono],
                    ['Indicaciones', dirActual.indicaciones], ['Tipo', dirActual.tipo]
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="fila-detalle-dir"><span className="etiqueta-detalle-dir">{k}:</span><span className="valor-detalle-dir">{v}</span></div>
                  ))}
                </div>
              </div>
            )}

            <button className="boton-agregar-nueva-direccion" onClick={() => setMostrarFormNueva(p => !p)}>
              <i className="fas fa-plus"></i> Agregar otra dirección
            </button>

            {mostrarFormNueva && (
              <div className="formulario-nueva-direccion" style={{ display: 'block' }}>
                <h4 className="titulo-formulario-direccion">Nueva dirección</h4>
                <div className="campo-input-direccion">
                  <label>Dirección <span className="req">*</span></label>
                  <input type="text" value={nuevaDireccion} onChange={e => setNuevaDireccion(e.target.value)} placeholder="Ej: Carrera 71d #1-14 Sur" />
                </div>
                <div className="campo-input-direccion">
                  <label>Ciudad</label>
                  <input type="text" value={nuevaCiudad} onChange={e => setNuevaCiudad(e.target.value)} placeholder="Bogotá" />
                </div>
                <div className="campo-input-direccion">
                  <label>Teléfono</label>
                  <input type="tel" value={nuevaTelefono} onChange={e => setNuevaTelefono(e.target.value)} placeholder="+57 300 000 0000" />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button className="boton-guardar-nueva-dir" onClick={agregarNueva}>Guardar dirección</button>
                  <button className="boton-cancelar-nueva-dir" onClick={() => setMostrarFormNueva(false)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>

          <button className="boton-continuar-entrega" onClick={continuar}>
            Continuar al Pago <i className="fas fa-arrow-right"></i>
          </button>
        </section>

        <aside className="columna-resumen-entrega">
          <h2 className="titulo-resumen-entrega">Resumen del pedido</h2>
          <div id="listaItemsResumen">
            {carrito.map((item, i) => (
              <div key={i} className="fila-item-resumen">
                <span className="nombre-item-resumen">{item.nombre || item.producto?.Nombre_Producto || 'Producto'}</span>
                <span className="precio-item-resumen">{formatearPrecio(Number(item.precio) || Number(item.precioTotal) || 0)}</span>
              </div>
            ))}
          </div>
          <div className="separador-resumen"></div>
          <div className="fila-total-resumen">
            <span id="montoSubtotalEntrega">Subtotal</span><span>{formatearPrecio(subtotal)}</span>
          </div>
          <div className="fila-envio-resumen"><span>Envío</span><span className="envio-gratis">GRATIS</span></div>
          <div className="separador-resumen"></div>
          <div className="fila-gran-total">
            <span id="montoTotalEntrega">Total</span><span>{formatearPrecio(subtotal)}</span>
          </div>
        </aside>
      </main>
    </div>
  );
}
