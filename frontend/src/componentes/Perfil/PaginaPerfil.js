import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  obtenerPerfilAPI, 
  actualizarPerfilAPI,
  obtenerDireccionesAPI, 
  obtenerMisSolicitudesAPI, 
  obtenerMisReservasAPI,
  obtenerMisPedidosAPI,
  cancelarReservaAPI,
  crearDireccionAPI,
  eliminarDireccionAPI,
  cerrarSesion as logoutAPI,
  haySesionActiva,
  getUsuarioLocal
} from '../../servicios/api';
import '../../estilos/perfil.css';

const DEPARTAMENTOS = ['Amazonas','Antioquia','Arauca','Atlántico','Bogotá','Bolívar','Boyacá','Caldas','Caquetá','Casanare','Cauca','Cesar','Chocó','Córdoba','Cundinamarca','Guainía','Guaviare','Huila','La Guajira','Magdalena','Meta','Nariño','Norte de Santander','Putumayo','Quindío','Risaralda','San Andrés y Providencia','Santander','Sucre','Tolima','Valle del Cauca','Vaupés','Vichada'];

const EST_CLASS = { 'Entregado':'estado-entregado','En proceso':'estado-en-proceso','Pendiente':'estado-pendiente','Cancelado':'estado-cancelado' };

const formatearCOP = (valor) => {
  if (valor === undefined || valor === null) return '$ 0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);
};

export default function PaginaPerfil() {
  const navigate = useNavigate();
  const [vista, setVista] = useState('grid');
  const [usuario, setUsuario] = useState({ nombre:'', apellido:'', email:'', telefono:'', rol: 'cliente' });
  const [dirs, setDirs] = useState([]);
  const [compras, setCompras] = useState({ productos:[], paquetes:[], personalizado:[] });
  const [solicitudes, setSolicitudes] = useState({ productos:[], paquetes:[], personalizado:[] });
  const [cargando, setCargando] = useState(true);
  const [tabCompras, setTabCompras] = useState('productos');
  const [tabSolicitudes, setTabSolicitudes] = useState('productos');
  const [toast, setToast] = useState({ msg:'', visible:false, warn:false });
  const [modalEdicion, setModalEdicion] = useState(false);
  const [campoEdicion, setCampoEdicion] = useState(null);
  const [editVals, setEditVals] = useState({});
  const [modalDir, setModalDir] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({ open:false, icono:'', titulo:'', desc:'', btnLabel:'', color:'', cb:null });
  const [formDir, setFormDir] = useState({ direccion:'', departamento:'', municipio:'', barrio:'', apto:'', nombre:'', telefono:'', tipo:'residencial' });
  const [depListaAbierta, setDepListaAbierta] = useState(false);

  // Cargar datos reales desde el API
  useEffect(() => {
    if (!haySesionActiva()) { navigate('/login'); return; }

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const results = await Promise.allSettled([
          obtenerPerfilAPI(),
          obtenerDireccionesAPI(),
          obtenerMisSolicitudesAPI(),
          obtenerMisReservasAPI(),
          obtenerMisPedidosAPI()
        ]);
        
        const [uRes, dRes, sRes, rRes, pRes] = results;
        
        const u = uRes.status === 'fulfilled' ? uRes.value : { usuario: {} };
        const d = dRes.status === 'fulfilled' ? dRes.value : [];
        const s = sRes.status === 'fulfilled' ? sRes.value : [];
        const r = rRes.status === 'fulfilled' ? rRes.value : [];
        const p = pRes.status === 'fulfilled' ? pRes.value : [];

        
        const dataUsuario = u.usuario && u.usuario.Nombre ? u.usuario : getUsuarioLocal() || {};
        const rolUsuario = dataUsuario.Rol?.Nombre_Rol || dataUsuario.rol || 'cliente';
        
        setUsuario({
          nombre: dataUsuario.Nombre || '',
          apellido: dataUsuario.Apellidos || '',
          email: dataUsuario.Correo || '',
          telefono: dataUsuario.Celular || '',
          rol: rolUsuario
        });

        // Normalizar direcciones
        setDirs(d.map(item => ({
          id: item.Id_Direccion,
          direccion: item.Direccion,
          departamento: item.Departamento,
          municipio: item.Municipio_Localidad,
          barrio: item.Barrio,
          apto: item.Apart_Casa,
          nombre: item.Nombre_Completo,
          telefono: item.Telefono,
          tipo: item.Residencia_Laboral
        })));

        // Normalizar solicitudes (Personalizado + Reservas + Pedidos)
        setSolicitudes({
          productos: p.map(ped => ({
            ...ped, // Guardamos el objeto completo para renderizar detalles
            id: `PED-${ped.id}`,
            _rawId: ped.id, // Id real
            nombre: 'Pedido de Productos',
            precio: ped.total,
            fecha: new Date(ped.createdAt).toLocaleDateString(),
            estado: ped.estado
          })),
          paquetes: r.map(res => ({
            ...res,
            id: `RES-${res.Id_Reserva_Paquete}`,
            _rawId: res.Id_Reserva_Paquete,
            nombre: res.paquete?.Nombre_Paquete || 'Paquete',
            precio: res.paquete?.Precio_Paquete || 0,
            fecha: new Date(res.Fecha_Reserva).toLocaleDateString(),
            estado: res.Estado_Reserva_Paquete
          })),
          personalizado: s.map(pers => ({
            ...pers,
            id: `PERS-${pers.Id_Personalizado}`,
            _rawId: pers.Id_Personalizado,
            nombre: 'Servicio Personalizado',
            precio: 0,
            fecha: new Date(pers.Fecha_Solicitud).toLocaleDateString(),
            estado: pers.Estado_Personalizado
          }))
        });

      } catch (error) {
        console.error('Error al cargar perfil:', error);
        if (error.message.includes('token')) logoutAPI();
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [navigate]);

  const mostrarToast = useCallback((msg, warn=false) => {
    setToast({ msg, visible:true, warn });
    setTimeout(() => setToast(p=>({...p,visible:false})), 3500);
  }, []);

  const abrirConfirm = (cfg) => setModalConfirm({ open:true, ...cfg });
  const cerrarConfirm = () => setModalConfirm(p=>({...p,open:false}));
  const ejecutarConfirm = () => { cerrarConfirm(); if (typeof modalConfirm.cb==='function') modalConfirm.cb(); };

  const irA = (s) => { 
    if (s === 'admin') { navigate('/admin'); return; }
    setVista(s); 
    window.scrollTo({top:0,behavior:'smooth'}); 
  };

  const eliminarDir = (i) => {
    const dirABorrar = dirs[i];
    abrirConfirm({ icono:'🗑️', titulo:'¿Eliminar dirección?', desc:`Se eliminará: <strong>${dirABorrar.direccion}</strong>`, btnLabel:'Sí, eliminar', color:'rojo',
      cb: async () => { 
        try {
          await eliminarDireccionAPI(dirABorrar.id);
          const nd=[...dirs]; nd.splice(i,1); setDirs(nd); 
          mostrarToast('📍 Dirección eliminada',true); 
        } catch (e) {
          mostrarToast('❌ Error al eliminar', true);
        }
      }
    });
  };

  const cancelarSolicitud = (id, cat) => {
    if (cat !== 'paquetes') {
      mostrarToast('⚠️ Esta solicitud solo puede ser cancelada por un asesor', true);
      return;
    }

    abrirConfirm({ icono:'✕', titulo:'¿Cancelar solicitud?', desc:'Esta acción cancelará tu solicitud. No se puede deshacer.', btnLabel:'Sí, cancelar', color:'rojo',
      cb: async () => {
        try {
          const numericId = id.replace('RES-', '');
          await cancelarReservaAPI(numericId);
          
          const s = { ...solicitudes };
          const it = (s[cat]||[]).find(i=>i.id===id);
          if (it) it.estado='Cancelado'; 
          setSolicitudes({...s});
          
          mostrarToast('✕ Solicitud cancelada', true);
        } catch (e) {
          mostrarToast('❌ Error: ' + e.message, true);
        }
      }
    });
  };

  const CFG_EDICION = {
    email:    { titulo:'Correo electrónico', campos:[{id:'nuevo',label:'Nuevo correo',type:'email',ph:'nuevo@correo.com'},{id:'confirmar',label:'Confirmar correo',type:'email',ph:'nuevo@correo.com'}] },
    telefono: { titulo:'Teléfono',           campos:[{id:'nuevo',label:'Nuevo teléfono',type:'tel',ph:'+57 300 123 4567'}] },
    password: { titulo:'Contraseña',         campos:[{id:'actual',label:'Contraseña actual',type:'password',ph:'••••••••'},{id:'nueva',label:'Nueva contraseña',type:'password',ph:'Mínimo 8 caracteres'},{id:'confirmar',label:'Confirmar contraseña',type:'password',ph:'Repite la contraseña'}] }
  };

  const abrirEdicion = (campo) => { setCampoEdicion(campo); setEditVals({}); setModalEdicion(true); };

  const confirmarEdicion = () => {
    if (campoEdicion === 'email') {
      if (!editVals.nuevo) { mostrarToast('⚠️ Ingresa el nuevo correo', true); return; }
      if (editVals.nuevo !== editVals.confirmar) { mostrarToast('⚠️ Los correos no coinciden', true); return; }
      setModalEdicion(false);
      abrirConfirm({
        icono: '✉️', titulo: '¿Cambiar correo?', desc: 'Se actualizará tu correo electrónico. ¿Confirmas?', btnLabel: 'Sí, cambiar', color: 'rojo',
        cb: async () => {
          try {
            await actualizarPerfilAPI({ correo: editVals.nuevo });
            setUsuario(prev => ({ ...prev, email: editVals.nuevo }));
            mostrarToast('✅ Correo actualizado');
          } catch (e) {
            mostrarToast(e.message, true);
          }
        }
      });
    } else if (campoEdicion === 'telefono') {
      if (!editVals.nuevo) { mostrarToast('⚠️ Ingresa el nuevo teléfono', true); return; }
      setModalEdicion(false);
      abrirConfirm({
        icono: '📞', titulo: '¿Cambiar teléfono?', desc: 'Se actualizará el número de celular. ¿Confirmas?', btnLabel: 'Sí, cambiar', color: 'rojo',
        cb: async () => {
          try {
            await actualizarPerfilAPI({ celular: editVals.nuevo });
            setUsuario(prev => ({ ...prev, telefono: editVals.nuevo }));
            mostrarToast('✅ Teléfono actualizado');
          } catch (e) {
            mostrarToast(e.message, true);
          }
        }
      });
    } else if (campoEdicion === 'password') {
      if (!editVals.actual) { mostrarToast('⚠️ Ingresa la contraseña actual', true); return; }
      if ((editVals.nueva || '').length < 6) { mostrarToast('⚠️ Mínimo 6 caracteres', true); return; }
      if (editVals.nueva !== editVals.confirmar) { mostrarToast('⚠️ Las contraseñas no coinciden', true); return; }
      setModalEdicion(false);
      abrirConfirm({
        icono: '🔒', titulo: '¿Cambiar contraseña?', desc: 'Se actualizará tu clave de acceso. ¿Confirmas?', btnLabel: 'Sí, cambiar', color: 'rojo',
        cb: async () => {
          try {
            await actualizarPerfilAPI({ 
              passwordActual: editVals.actual,
              passwordNuevo: editVals.nueva 
            });
            mostrarToast('✅ Contraseña actualizada');
          } catch (e) {
            mostrarToast(e.message, true);
          }
        }
      });
    }
  };

  const guardarDir = async () => {
  console.log('formDir:', formDir);
  if (!formDir.direccion.trim()) { mostrarToast('⚠️ Ingresa la dirección',true); return; }
    
    try {
      const res = await crearDireccionAPI(formDir);
      const nueva = {
        id: res.direccion.Id_Direccion,
        ...formDir
      };
      setDirs(prev => [...prev, nueva]);
      setModalDir(false);
      setFormDir({ direccion:'', departamento:'', municipio:'', barrio:'', apto:'', nombre:'', telefono:'', tipo:'residencial' });
      mostrarToast('📍 Dirección guardada');
    } catch (e) {
      mostrarToast('❌ ' + e.message, true);
    }
  };

  const cancelarCuenta = () => {
    abrirConfirm({ icono:'⛔', titulo:'¿Eliminar tu cuenta?', desc:'Se eliminarán todos tus datos guardados. Esta acción <strong>no se puede deshacer</strong>.', btnLabel:'Sí, eliminar cuenta', color:'rojo',
      cb: () => { localStorage.clear(); mostrarToast('Cuenta cancelada...',true); setTimeout(()=>navigate('/'),2000); }
    });
  };

  const cerrarSesion = () => {
    abrirConfirm({
      icono: '🚪', titulo: '¿Cerrar sesión?', desc: '¿Estás seguro de que deseas salir de tu cuenta?', btnLabel: 'Sí, cerrar sesión', color: 'rojo',
      cb: () => {
        logoutAPI();
        navigate('/');
      }
    });
  };

  const iniciales = ((usuario.nombre||'')[0]||'').toUpperCase() + ((usuario.apellido||'')[0]||'').toUpperCase();
  const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || 'Usuario';

  return (
    <div className="pagina-perfil">
      {/* NAV */}
      <nav className="nav-barra-principal">
        <Link className="nav-logo" to="/">COMMUNICATING DESIGN <span>LION</span></Link>
        <div className="nav-controles-perfil">
          <button className="nav-btn-logout-premium" onClick={cerrarSesion}>
            <i className="fas fa-sign-out-alt"></i> Cerrar sesión
          </button>
          <Link className="nav-btn-volver-inicio" to="/"><i className="fas fa-arrow-left"></i> Volver al inicio</Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero-perfil">
        <div className="hero-perfil-contenido">
          <div className="hero-avatar-iniciales">{iniciales||'?'}</div>
          <div className="hero-info-usuario">
            <h1 className="hero-nombre-usuario">{nombreCompleto}</h1>
            <p className="hero-email-usuario">{usuario.email||'—'}</p>
            <div className="hero-insignia-cliente"><i className="fas fa-crown"></i> Cliente CDL</div>
          </div>
        </div>
      </div>

      {/* VISTA GRID */}
      {vista==='grid' && (
        <div className="contenedor-seccion" id="vistaGridPrincipal">
          <div className="grid-tarjetas-menu">
            {[
              { id:'datos',       icono:'fa-id-card',     titulo:'Datos de tu cuenta',   desc:'Nombre, correo, teléfono y contraseña.' },
              { id:'direcciones', icono:'fa-map-marker-alt',titulo:'Direcciones',          desc:'Direcciones guardadas en tu cuenta.' },
              { id:'compras',     icono:'fa-shopping-bag', titulo:'Mis compras',           desc:'Servicios pagados y realizados.' },
              { id:'solicitudes', icono:'fa-file-alt',     titulo:'Mis solicitudes',       desc:'Solicitudes enviadas en proceso.' },
              ...((usuario.rol === 'admin' || usuario.rol === 'Administrador' || usuario.rol === 'Auxiliar') ? [{ id:'admin', icono:'fa-user-shield', titulo:'Panel de Control', desc:'Gestión de usuarios, catálogo y solicitudes.' }] : [])
            ].map(m => (
              <div key={m.id} className="tarjeta-menu-item" onClick={() => irA(m.id)}>
                <i className={`fas ${m.icono} tarjeta-menu-icono`}></i>
                <div className="tarjeta-menu-titulo">{m.titulo}</div>
                <div className="tarjeta-menu-descripcion">{m.desc}</div>
              </div>
            ))}
          </div>
          <div className="footer-opciones-peligro">
            <p className="texto-peligro-pie">¿Deseas dejar de formar parte de CDL?</p>
            <button className="btn-eliminar-cuenta-premium" onClick={cancelarCuenta}>
              <i className="fas fa-user-times"></i> Eliminar mi cuenta permanentemente
            </button>
          </div>
        </div>
      )}

      {/* VISTA DATOS PREMIUM */}
      {vista==='datos' && (
        <div className="contenedor-seccion vista-seccion slide-up">
          <button className="btn-volver-grid premium-hover" onClick={() => irA('grid')}><i className="fas fa-arrow-left"></i> Volver al panel</button>
          
          <section className="seccion-tarjeta premium-card">
            <div className="seccion-encabezado">
              <i className="fas fa-id-card seccion-encabezado-icono glow-text"></i>
              <div>
                <div className="seccion-etiqueta-categoria">— Configuración</div>
                <h2 className="seccion-titulo">Datos de tu cuenta</h2>
              </div>
            </div>

            <div className="premium-data-grid">
              <div className="premium-data-item">
                <label className="premium-data-label">Nombre</label>
                <div className="premium-data-value">{usuario.nombre||'—'}</div>
              </div>
              <div className="premium-data-item">
                <label className="premium-data-label">Apellido</label>
                <div className="premium-data-value">{usuario.apellido||'—'}</div>
              </div>
            </div>

            <div className="premium-divider"></div>

            {[
              { campo:'email',    icono:'fa-envelope', label:'Correo electrónico', valor:usuario.email||'—' },
              { campo:'telefono', icono:'fa-phone',    label:'Teléfono',           valor:usuario.telefono||'—' },
              { campo:'password', icono:'fa-lock',     label:'Contraseña',         valor: '••••••••••' },
            ].map(f => (
              <div key={f.campo} className="premium-row-editable">
                <div className="premium-row-info">
                  <label className="premium-row-label">
                    <i className={`fas ${f.icono}`}></i> {f.label}
                  </label>
                  <div className="premium-row-value">{f.valor}</div>
                </div>
                <button className="premium-btn-edit" onClick={() => abrirEdicion(f.campo)}>
                  <i className="fas fa-pen"></i> Modificar
                </button>
              </div>
            ))}
          </section>
        </div>
      )}

      {/* VISTA DIRECCIONES PREMIUM */}
      {vista==='direcciones' && (
        <div className="contenedor-seccion vista-seccion slide-up">
          <button className="btn-volver-grid premium-hover" onClick={() => irA('grid')}><i className="fas fa-arrow-left"></i> Volver al panel</button>
          
          <section className="seccion-tarjeta premium-card">
            <div className="seccion-encabezado">
              <i className="fas fa-map-marker-alt seccion-encabezado-icono glow-text"></i>
              <div>
                <div className="seccion-etiqueta-categoria">— Gestionar</div>
                <h2 className="seccion-titulo">Tus direcciones</h2>
              </div>
            </div>

            <div className="premium-address-list">
              {!dirs.length ? (
                <div className="premium-empty-state">
                  <i className="fas fa-map-marked-alt"></i>
                  <p>No tienes direcciones guardadas aún.</p>
                </div>
              ) : (
                dirs.map((d, i) => (
                  <div key={d.id||i} className="premium-address-card">
                    <div className="premium-address-header">
                      <div className="premium-address-badge">
                        <i className={`fas fa-${d.tipo==='laboral'?'briefcase':'home'}`}></i> 
                        {d.tipo==='laboral'?'Laboral':'Residencial'}
                      </div>
                      <button className="premium-btn-delete" onClick={() => eliminarDir(i)} title="Eliminar">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                    <div className="premium-address-main">
                      <div className="premium-address-line">{d.direccion}{d.apto?', '+d.apto:''}</div>
                      <div className="premium-address-sub">{d.municipio?d.municipio+' — ':''}{d.departamento}</div>
                      {d.barrio && <div className="premium-address-tag"><i className="fas fa-map-pin"></i> {d.barrio}</div>}
                    </div>
                    <div className="premium-address-footer">
                      <div className="premium-footer-item"><i className="fas fa-user"></i> {d.nombre||'—'}</div>
                      <div className="premium-footer-item"><i className="fas fa-phone"></i> {d.telefono||'—'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="premium-actions-footer">
              <button className="premium-btn-add" onClick={() => setModalDir(true)}>
                <i className="fas fa-plus"></i> Añadir Nueva Dirección
              </button>
            </div>
          </section>
        </div>
      )}

      {/* VISTA COMPRAS */}
      {vista==='compras' && (
        <div className="contenedor-seccion vista-seccion" id="vistaCompras">
          <button className="btn-volver-grid" onClick={() => irA('grid')}><i className="fas fa-arrow-left"></i> Volver</button>
          <section className="seccion-tarjeta">
            <div className="seccion-encabezado">
              <i className="fas fa-shopping-bag seccion-encabezado-icono"></i>
              <div><div className="seccion-etiqueta-categoria">— Historial</div><h2 className="seccion-titulo">Mis compras</h2></div>
            </div>
            <div className="pestanas-navegacion">
              {['productos','paquetes','personalizado'].map(cat => (
                <button key={cat} className={`pestana-btn${tabCompras===cat?' active':''}`} onClick={() => setTabCompras(cat)}>
                  {cat.charAt(0).toUpperCase()+cat.slice(1)}
                </button>
              ))}
            </div>
            {['productos','paquetes','personalizado'].map(cat => (
              <div key={cat} className={`pestana-contenido${tabCompras===cat?' active':''}`}>
                {!(compras[cat]||[]).length ? (
                  <p className="historial-mensaje-vacio">No hay registros en esta categoría.</p>
                ) : (
                  (compras[cat]||[]).map((it, i) => (
                    <div key={i} className="historial-tarjeta">
                      <div className="historial-tarjeta-encabezado">
                        <div><div className="historial-id-pedido">{it.id}</div><div className="historial-nombre-pedido">{it.nombre}</div></div>
                        <div className={`historial-estado-badge ${EST_CLASS[it.estado]||'estado-pendiente'}`}>{it.estado}</div>
                      </div>
                      <div className="historial-tarjeta-pie">
                        <span className="historial-precio">{it.precio}</span>
                        <span className="historial-fecha"><i className="fas fa-calendar-alt"></i> {it.fecha}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </section>
        </div>
      )}

      {/* VISTA SOLICITUDES */}
      {vista==='solicitudes' && (
        <div className="contenedor-seccion vista-seccion" id="vistaSolicitudes">
          <button className="btn-volver-grid" onClick={() => irA('grid')}><i className="fas fa-arrow-left"></i> Volver</button>
          <section className="seccion-tarjeta">
            <div className="seccion-encabezado">
              <i className="fas fa-file-alt seccion-encabezado-icono"></i>
              <div><div className="seccion-etiqueta-categoria">— Seguimiento</div><h2 className="seccion-titulo">Mis solicitudes</h2></div>
            </div>
            <div className="pestanas-navegacion">
              {['productos','paquetes','personalizado'].map(cat => (
                <button key={cat} className={`pestana-btn${tabSolicitudes===cat?' active':''}`} onClick={() => setTabSolicitudes(cat)}>
                  {cat.charAt(0).toUpperCase()+cat.slice(1)}
                </button>
              ))}
            </div>
            {['productos','paquetes','personalizado'].map(cat => (
              <div key={cat} className={`pestana-contenido${tabSolicitudes===cat?' active':''}`}>
                {!(solicitudes[cat]||[]).length ? (
                  <p className="historial-mensaje-vacio">No hay registros en esta categoría.</p>
                ) : (
                  (solicitudes[cat]||[]).map((it, i) => (
                    <div key={i} className="historial-tarjeta" style={{borderTop: '3px solid var(--rojo)', padding:'20px', flexDirection:'column', alignItems:'stretch'}}>
                      
                      {/* ENCABEZADO */}
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'15px', width:'100%'}}>
                        <div>
                          <div style={{fontWeight:700, fontSize:'1.1rem'}}>{it.nombre}</div>
                          <div style={{fontSize:'0.7rem', opacity:0.5, marginTop:'4px'}}>
                            <i className="fas fa-clock"></i> Creado: {it.fecha}
                          </div>
                        </div>
                        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'5px'}}>
                          <div className={`historial-estado-badge ${EST_CLASS[it.estado]||'estado-pendiente'}`}>{it.estado}</div>
                          <div style={{background: 'rgba(255,8,68,0.1)', color: 'var(--rojo)', padding:'2px 6px', borderRadius:'4px', fontSize:'0.7rem', fontWeight:'bold'}}>
                             {it.id}
                          </div>
                        </div>
                      </div>

                      <hr style={{borderColor: 'rgba(255,255,255,0.05)', margin: '5px 0 15px 0'}} />

                      {/* DETALLES ESPECÍFICOS SEGÚN TIPO */}
                      <div style={{marginBottom:'20px'}}>  
                        {/* --- CITAS (PAQUETES) --- */}
                        {cat === 'paquetes' && (
                          <div style={{fontSize:'0.85rem'}}>
                            <div style={{marginBottom:'10px', background:'rgba(255,255,255,0.03)', padding:'10px', borderRadius:'6px'}}>
                              <div style={{fontSize:'0.7rem', color: 'var(--rojo)', fontWeight:700, letterSpacing:'1px', marginBottom:'5px'}}>🎯 PAQUETE RESERVADO</div>
                              <div style={{fontWeight:'bold'}}>{it.paquete?.Nombre_Paquete || 'Paquete no encontrado'}</div>
                              <div style={{color:'var(--rojo)'}}>{formatearCOP(it.precio)}</div>
                            </div>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px'}}>
                              <div><strong>Tipo de Evento:</strong> <br/>{it.Tipo_Evento || 'No especificado'}</div>
                              <div><strong>Fecha del Evento:</strong> <br/>{it.Fecha_Evento || 'No especificada'}</div>
                              <div><strong>Invitados:</strong> <br/>{it.Numero_Invitados || 'N/A'}</div>
                            </div>
                            <div>
                              <strong>Información Adicional:</strong>
                              <p style={{opacity:0.8, marginTop:'3px', background:'rgba(0,0,0,0.2)', padding:'8px', borderRadius:'4px'}}>{it.Informacion_Adicional || 'Sin notas adicionales.'}</p>
                            </div>
                          </div>
                        )}

                        {/* --- PEDIDOS (PRODUCTOS) --- */}
                        {cat === 'productos' && (
                          <div style={{fontSize:'0.85rem'}}>
                            <div style={{marginBottom:'10px', background:'rgba(255,255,255,0.03)', padding:'10px', borderRadius:'6px'}}>
                              <div style={{fontSize:'0.7rem', color: 'var(--rojo)', fontWeight:700, letterSpacing:'1px', marginBottom:'5px'}}>📍 DATOS DE ENVÍO</div>
                              <div style={{opacity:0.9}}>{it.direccionEnvio || 'Sin dirección ingresada'}</div>
                              <div style={{opacity:0.9}}><i className="fas fa-phone"></i> {it.telefono || 'Sin teléfono'}</div>
                              {it.notas && <div style={{marginTop:'5px', color:'#ccc'}}><em>Notas: {it.notas}</em></div>}
                            </div>
                            <div style={{fontSize:'0.7rem', color: 'var(--rojo)', fontWeight:700, letterSpacing:'1px', marginBottom:'5px'}}>🛒 PRODUCTOS ({it.detalles ? it.detalles.length : 0})</div>
                            <div style={{maxHeight:'120px', overflowY:'auto', background:'rgba(0,0,0,0.2)', padding:'10px', borderRadius:'6px', marginBottom:'10px'}}>
                              {it.detalles && it.detalles.length > 0 ? it.detalles.map(d => (
                                <div key={d.id} style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'4px'}}>
                                  <div>
                                    <div style={{fontWeight:'bold'}}>{d.producto?.Nombre_Producto || 'Producto eliminado'}</div>
                                    <div style={{fontSize:'0.75rem', opacity:0.7}}>Cant: {d.cantidad} x {formatearCOP(d.precioUnitario)}</div>
                                  </div>
                                  <div style={{fontWeight:'bold', color:'var(--blanco)'}}>{formatearCOP(d.subtotal)}</div>
                                </div>
                              )) : <div style={{opacity:0.5}}>No hay detalles.</div>}
                            </div>
                            <div style={{textAlign:'right', fontWeight:'bold', fontSize:'1.1rem', color:'var(--cian)'}}>
                              TOTAL: {formatearCOP(it.precio)}
                            </div>
                          </div>
                        )}

                        {/* --- PERSONALIZADO --- */}
                        {cat === 'personalizado' && (
                          <div style={{fontSize:'0.85rem'}}>
                            <div style={{marginBottom:'10px', background:'rgba(255,255,255,0.03)', padding:'10px', borderRadius:'6px'}}>
                               <div style={{fontSize:'0.7rem', color: 'var(--rojo)', fontWeight:700, letterSpacing:'1px', marginBottom:'5px'}}>🎁 DESTINATARIO</div>
                               <div style={{textTransform:'uppercase', fontWeight:'bold'}}>{(it.Destinatario || '').replace('_', ' ')}</div>
                            </div>
                            <div style={{marginBottom:'10px'}}>
                              <strong><i className="fas fa-lightbulb"></i> Idea Principal:</strong>
                              <p style={{opacity:0.8, marginTop:'3px', background:'rgba(0,0,0,0.2)', padding:'8px', borderRadius:'4px'}}>{it.Descripcion_Idea}</p>
                            </div>
                            <div style={{marginBottom:'10px'}}>
                              <strong><i className="fas fa-puzzle-piece"></i> Elementos Esenciales:</strong>
                              <p style={{opacity:0.8, marginTop:'3px', background:'rgba(0,0,0,0.2)', padding:'8px', borderRadius:'4px'}}>{it.Elementos_Esenciales}</p>
                            </div>
                            <div style={{display:'grid', gridTemplateColumns:'1fr', gap:'5px', marginBottom:'10px'}}>
                              <div><strong>Prioridad:</strong> <span style={{background:'rgba(255,255,255,0.1)', padding:'2px 6px', borderRadius:'3px'}}>{(it.Prioridad_Cliente || 'normal').toUpperCase()}</span></div>
                            </div>
                            {it.Comentarios_Adicionales && (
                              <div>
                                <strong>Comentarios:</strong>
                                <p style={{opacity:0.8, marginTop:'3px'}}>{it.Comentarios_Adicionales}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                         {it.estado !== 'Cancelado' && it.estado !== 'cancelada' && it.estado !== 'cancelado' && (
                           <button className="historial-btn-cancelar-solicitud" onClick={() => cancelarSolicitud(it.id, cat)}>✕ Cancelar solicitud</button>
                         )}
                         <div style={{marginLeft:'auto', opacity:0.6, fontSize:'0.7rem'}}>
                            ESTADO DE SOLO LECTURA
                         </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </section>
        </div>
      )}

      {/* ── MODAL EDICIÓN PREMIUM ── */}
      {modalEdicion && campoEdicion && (
        <div className="modal-fondo-oscuro glass-blur" style={{display:'flex'}} onClick={e=>e.target===e.currentTarget&&setModalEdicion(false)}>
          <div className="modal-caja-edicion-premium">
            <button className="modal-btn-cerrar-premium" onClick={() => setModalEdicion(false)}>×</button>
            
            <div className="modal-cabecera-premium">
              <div className="modal-accent-line"></div>
              <h2 className="modal-titulo-premium">{CFG_EDICION[campoEdicion].titulo}</h2>
              <p className="modal-subtitulo-premium">Seguridad y Personalización de Cuenta</p>
            </div>

            <div className="modal-cuerpo-premium">
              {CFG_EDICION[campoEdicion].campos.map(f => (
                <div key={f.id} className="modal-campo-premium">
                  <label className="modal-label-premium">{f.label}</label>
                  <div className="modal-input-premium-container">
                    <input 
                      id={f.id} 
                      type={f.type} 
                      placeholder={f.ph} 
                      className="modal-input-premium-field"
                      value={editVals[f.id]||''}
                      onChange={e => setEditVals(p=>({...p,[f.id]:e.target.value}))} 
                    />
                    <div className="modal-input-glow"></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-pie-premium">
              <button className="modal-btn-premium-cancel" onClick={() => setModalEdicion(false)}>Descartar</button>
              <button className="modal-btn-premium-action" onClick={confirmarEdicion}>
                <span>Guardar Cambios</span>
                <i className="fas fa-shield-alt"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL NUEVA DIRECCIÓN ── */}
      {modalDir && (
        <div className="modal-fondo-oscuro" style={{display:'flex'}} onClick={e=>e.target===e.currentTarget&&setModalDir(false)}>
          <div className="modal-caja-edicion" style={{maxWidth:'520px'}}>
            <button className="modal-btn-cerrar" onClick={() => setModalDir(false)}>×</button>
            <div className="modal-titulo-edicion">Nueva dirección</div>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {[
                {label:'Dirección *', campo:'direccion', ph:'Ej: Carrera 71d #1-14 Sur'},
                {label:'Municipio',   campo:'municipio', ph:'Tu municipio'},
                {label:'Barrio',      campo:'barrio',    ph:'Nombre del barrio'},
                {label:'Apto / Casa', campo:'apto',      ph:'Ej: 201'},
                {label:'Nombre contacto', campo:'nombre', ph:'Nombre de quien recibe'},
                {label:'Teléfono',    campo:'telefono',  ph:'+57 300 000 0000'},
              ].map(f => (
                <div key={f.campo} className="modal-campo-grupo">
                  <label className="modal-campo-etiqueta">{f.label}</label>
                  <input type="text" placeholder={f.ph} className="modal-campo-input"
                    value={formDir[f.campo]||''}
                    onChange={e => setFormDir(p=>({...p,[f.campo]:e.target.value}))} />
                </div>
              ))}
              {/* Departamento */}
              <div className="modal-campo-grupo" style={{position:'relative'}}>
                <label className="modal-campo-etiqueta">Departamento *</label>
                <div onClick={()=>setDepListaAbierta(p=>!p)} style={{background:'var(--bg-0,#030308)',border:'1px solid var(--border,rgba(255,255,255,0.055))',color:formDir.departamento?'#fff':'var(--text-secondary,#8484a8)',padding:'10px 14px',borderRadius:'8px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span>{formDir.departamento||'Selecciona departamento'}</span>
                  <i className="fas fa-chevron-down" style={{fontSize:'0.65rem',transform:depListaAbierta?'rotate(180deg)':'rotate(0deg)',transition:'transform 0.3s'}}></i>
                </div>
                {depListaAbierta && (
                  <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:'var(--bg-1,#07070f)',border:'1px solid rgba(255,8,68,0.18)',borderRadius:'8px',zIndex:9999,maxHeight:'180px',overflowY:'auto',boxShadow:'0 8px 24px rgba(0,0,0,0.7)'}}>
                    {DEPARTAMENTOS.map(dep => (
                      <div key={dep} className="departamento-opcion dep-opt-p"
                        style={{color:formDir.departamento===dep?'var(--red,#ff0844)':''}}
                        onClick={()=>{setFormDir(p=>({...p,departamento:dep}));setDepListaAbierta(false);}}>
                        {dep}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Tipo */}
              <div className="modal-campo-grupo">
                <label className="modal-campo-etiqueta">Tipo de domicilio</label>
                <div style={{display:'flex',gap:'10px'}}>
                  {['residencial','laboral'].map(t => (
                    <label key={t} style={{flex:1,display:'flex',alignItems:'center',gap:'8px',background:'var(--bg-0,#030308)',border:`1px solid ${formDir.tipo===t?'var(--red,#ff0844)':'var(--border,rgba(255,255,255,0.055))'}`,borderRadius:'8px',padding:'10px 14px',cursor:'pointer',fontSize:'0.85rem',color:'var(--text-secondary,#8484a8)'}}>
                      <input type="radio" name="mdTipo" value={t} checked={formDir.tipo===t} onChange={()=>setFormDir(p=>({...p,tipo:t}))} style={{accentColor:'var(--red,#ff0844)'}}/>
                      <i className={`fas fa-${t==='residencial'?'home':'briefcase'}`} style={{color:'var(--red,#ff0844)',fontSize:'0.8rem'}}></i>
                      {t.charAt(0).toUpperCase()+t.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-acciones" style={{marginTop:'16px'}}>
              <button className="modal-btn-cancelar" onClick={()=>setModalDir(false)}>Cancelar</button>
              <button className="modal-btn-confirmar" onClick={guardarDir}>Guardar dirección</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMACIÓN ── */}
      {modalConfirm.open && (
        <div className="modal-fondo-oscuro glass-blur" style={{display:'flex'}} onClick={e=>e.target===e.currentTarget&&cerrarConfirm()}>
          <div className="modal-caja-confirmacion confirm-box premium-card slide-up">
            <div className="confirm-icon glow-text" style={{fontSize: '3rem', marginBottom: '15px'}}>{modalConfirm.icono}</div>
            <div className="modal-titulo-premium glow-text" style={{fontSize: '1.8rem', marginBottom: '10px'}}>{modalConfirm.titulo}</div>
            <div className="confirm-desc" dangerouslySetInnerHTML={{__html:modalConfirm.desc}}></div>
            <div className="confirm-btns" style={{marginTop:'25px'}}>
              <button className="confirm-btn-cancel" onClick={cerrarConfirm}>Cancelar</button>
              <button className={`confirm-btn-ok ${modalConfirm.color||''}`} onClick={ejecutarConfirm}>
                {modalConfirm.btnLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      <div id="toastNotificacion" className={`toast-notificacion${toast.visible?' show':''}${toast.warn?' warn':''}`}>
        <span id="perfilToastMsg">{toast.msg}</span>
      </div>
    </div>
  );
}
