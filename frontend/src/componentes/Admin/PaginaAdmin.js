import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../estilos/admin.css';
import { 
  listarUsuariosAPI, eliminarUsuarioAPI, actualizarRolAPI,
  obtenerProductosAPI, listarProductosAdminAPI, crearProductoAPI, actualizarProductoAPI, eliminarProductoAPI, toggleProductoAPI,
  obtenerPaquetesAPI, crearPaqueteAPI, actualizarPaqueteAPI, eliminarPaqueteAPI, togglePaqueteAPI,
  obtenerTodasLasSolicitudesAPI, actualizarEstadoSolicitudAPI,
  obtenerOpinionesAPI, eliminarOpinionAPI,
  obtenerCategoriasAPI, listarCategoriasAdminAPI, crearCategoriaAPI, actualizarCategoriaAPI, eliminarCategoriaAPI, toggleCategoriaAPI,
  getUsuarioLocal, cerrarSesion
} from '../../servicios/api';

const ESTADOS_PAQUETE  = ['pendiente', 'En contacto contigo', 'Agendada', '¡Misión cumplida!'];
const ESTADOS_PRODUCTO = ['Pendiente', '¡Manos a la obra!', 'Viajando hacia ti', '¡Ya contigo!'];
const ESTADOS_PERSONAL = ['pendiente', 'Analizando tu idea', 'Creando tu idea junto a ti', 'Dando vida a tu idea', '¡Tu creación ya está contigo!'];

const formatearCOP = (valor) => {
  if (valor === undefined || valor === null) return '$ 0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(valor);
};

const PaginaAdmin = () => {
  const navigate = useNavigate();
  const [userLocal] = useState(getUsuarioLocal());
  
  // Estados de interfaz
  const [vistaActiva, setVistaActiva] = useState('usuarios');
  const [pestanaSolicitudes, setPestanaSolicitudes] = useState('paquetes');
  const [cargando, setCargando] = useState(false);
  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: 'exito' });
  const [dialogo, setDialogo] = useState({ abierto: false, titulo: '', mensaje: '', onConfirm: null, variante: 'peligro' });

  // Estados de datos
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [opiniones, setOpiniones] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  // Estados de Modales
  const [modalAbierto, setModalAbierto] = useState(null); // 'usuario' | 'producto' | 'categoria' | 'paquete'
  const [elementoEditable, setElementoEditable] = useState(null);

  // Seguridad
  useEffect(() => {
    if (!userLocal || (userLocal.rol !== 'admin' && userLocal.rol !== 'administrador')) {
      navigate('/login');
    }
  }, [userLocal, navigate]);

  // Carga de datos dinámica
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      let data = [];
      if (vistaActiva === 'usuarios') {
        data = await listarUsuariosAPI();
        setUsuarios(data);
      } else if (vistaActiva === 'productos') {
        // Al cargar productos para admin, usamos la ruta que trae TODOS (incluidos ocultos)
        const [resProd, resCat] = await Promise.all([listarProductosAdminAPI(), obtenerCategoriasAPI()]);
        setProductos(resProd);
        setCategorias(resCat);
      } else if (vistaActiva === 'categorias') {
        data = await listarCategoriasAdminAPI();
        setCategorias(data);
      } else if (vistaActiva === 'paquetes') {
        data = await obtenerPaquetesAPI();
        setPaquetes(data);
      } else if (vistaActiva === 'opiniones') {
        data = await obtenerOpinionesAPI();
        setOpiniones(data);
      } else if (vistaActiva === 'solicitudes') {
        data = await obtenerTodasLasSolicitudesAPI(pestanaSolicitudes);
        setSolicitudes(data);
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setCargando(false);
    }
  }, [vistaActiva, pestanaSolicitudes]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const showToast = (mensaje, tipo = 'exito') => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: '', tipo: 'exito' }), 6500);
  };

  const pedirConfirmacion = (titulo, mensaje, onConfirm, variante = 'peligro') => {
    setDialogo({ abierto: true, titulo, mensaje, onConfirm, variante });
  };

  // --- HANDLERS USUARIOS ---
  const cambiarRolUsuario = async (id, rolActual) => {
    const nuevoRol = rolActual === 'admin' || rolActual === 'administrador' ? 'cliente' : 'admin';
    pedirConfirmacion(
      '¿Cambiar rol?',
      `¿Deseas cambiar el rol de este usuario a ${nuevoRol.toUpperCase()}?`,
      async () => {
        try {
          await actualizarRolAPI(id, nuevoRol);
          showToast(`Usuario actualizado a ${nuevoRol}`);
          cargarDatos();
        } catch (e) { showToast(e.message, 'error'); }
      },
      'info'
    );
  };

  const eliminarUsuario = async (id) => {
    pedirConfirmacion(
      '¿Eliminar usuario?',
      'Esta acción no se puede deshacer. El usuario perderá acceso permanentemente.',
      async () => {
        try {
          await eliminarUsuarioAPI(id);
          showToast('Usuario eliminado');
          cargarDatos();
        } catch (e) { showToast(e.message, 'error'); }
      }
    );
  };

  // --- HANDLERS PAQUETES ---
  const handleGuardarPaquete = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData.entries());
    try {
      if (elementoEditable) {
        await actualizarPaqueteAPI(elementoEditable.Id_Paquete, {
          nombre: datos.nombre,
          descripcion: datos.descripcion,
          precio: Number(datos.precio),
          imagen: datos.imagen
        });
        showToast(`✏️ Paquete "${datos.nombre}" editado correctamente`);
      } else {
        await crearPaqueteAPI({
          nombre: datos.nombre,
          descripcion: datos.descripcion,
          precio: Number(datos.precio),
          imagen: datos.imagen
        });
        showToast(`✅ Paquete "${datos.nombre}" creado exitosamente`);
      }
      setModalAbierto(null);
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData.entries());
    try {
      const payload = {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        precio: Number(datos.precio),
        imagen: datos.imagen,
        categoriaId: Number(datos.categoriaId), // Añadido para que coincida con la API
        Activo: true
      };
      if (elementoEditable) {
        await actualizarProductoAPI(elementoEditable.Id_Producto, payload);
        showToast(`✏️ Producto "${datos.nombre}" editado correctamente`);
      } else {
        await crearProductoAPI(payload);
        showToast(`✅ Producto "${datos.nombre}" creado exitosamente`);
      }
      setModalAbierto(null);
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleToggleProducto = async (id) => {
    const producto = productos.find(p => p.Id_Producto === id);
    const nombreProd = producto?.Nombre_Producto || 'Producto';
    const estaActivo = producto?.Activo;
    try {
      await toggleProductoAPI(id);
      showToast(estaActivo ? `🔒 "${nombreProd}" oculto — ya no aparece en la tienda` : `🔓 "${nombreProd}" visible — ya aparece en la tienda`);
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEliminarProducto = (id) => {
    const producto = productos.find(p => p.Id_Producto === id);
    const nombreProd = producto?.Nombre_Producto || 'este producto';
    pedirConfirmacion(
      '¿Eliminar producto?',
      `Estás a punto de eliminar "${nombreProd}". Esta acción no se puede deshacer.`,
      async () => {
        try {
          await eliminarProductoAPI(id);
          showToast(`🗑️ Producto "${nombreProd}" eliminado permanentemente`);
          cargarDatos();
        } catch (e) { showToast(e.message, 'error'); }
      }
    );
  };

  // --- HANDLERS CATEGORÍAS ---
  const handleGuardarCategoria = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData.entries());
    datos.Activo = true;
    try {
      if (elementoEditable) {
        await actualizarCategoriaAPI(elementoEditable.Id_Categoria, datos);
        showToast(`✏️ Categoría "${datos.nombre}" editada correctamente`);
      } else {
        await crearCategoriaAPI(datos);
        showToast(`✅ Categoría "${datos.nombre}" creada exitosamente`);
      }
      setModalAbierto(null);
      cargarDatos();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleToggleCategoria = async (id) => {
    const cat = categorias.find(c => c.Id_Categoria === id);
    const nombreCat = cat?.Nombre_Categoria || 'Categoría';
    const estaActiva = cat?.Activo;
    try {
      await toggleCategoriaAPI(id);
      showToast(estaActiva ? `🔒 "${nombreCat}" desactivada — ya no es visible` : `🔓 "${nombreCat}" activada — ahora es visible`);
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEliminarCategoria = (id) => {
    const cat = categorias.find(c => c.Id_Categoria === id);
    const nombreCat = cat?.Nombre_Categoria || 'esta categoría';
    pedirConfirmacion(
      '¿Eliminar categoría?',
      `Estás a punto de eliminar "${nombreCat}". Si tiene productos asociados podría ocasionar conflictos.`,
      async () => {
        try {
          await eliminarCategoriaAPI(id);
          showToast(`🗑️ Categoría "${nombreCat}" eliminada permanentemente`);
          cargarDatos();
        } catch (e) { showToast(e.message, 'error'); }
      }
    );
  };

  const handleTogglePaquete = async (id) => {
    const paquete = paquetes.find(p => p.Id_Paquete === id);
    const nombrePaq = paquete?.Nombre_Paquete || 'Paquete';
    const estaActivo = paquete?.Activo;
    try {
      await togglePaqueteAPI(id);
      showToast(estaActivo ? `🔒 "${nombrePaq}" desactivado — ya no es visible para los clientes` : `🔓 "${nombrePaq}" activado — ahora es visible para los clientes`);
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleEliminarPaquete = (id) => {
    const paquete = paquetes.find(p => p.Id_Paquete === id);
    const nombrePaq = paquete?.Nombre_Paquete || 'este paquete';
    pedirConfirmacion(
      '¿Eliminar paquete?',
      `Estás a punto de eliminar "${nombrePaq}". Esta acción no se puede deshacer.`,
      async () => {
        try {
          await eliminarPaqueteAPI(id);
          showToast(`🗑️ Paquete "${nombrePaq}" eliminado permanentemente`);
          cargarDatos();
        } catch (e) { showToast(e.message, 'error'); }
      }
    );
  };

  // --- HANDLERS SOLICITUDES ---
  const handleCambiarEstadoSolicitud = async (id, nuevoEstado) => {
    try {
      await actualizarEstadoSolicitudAPI(pestanaSolicitudes, id, nuevoEstado);
      showToast('Estado actualizado');
      cargarDatos();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const countSolicitudes = solicitudes.length;

  const filteredData = () => {
    const text = busqueda.toLowerCase();
    if (vistaActiva === 'usuarios') return usuarios.filter(u => (u.Nombre || '').toLowerCase().includes(text) || (u.Correo || '').toLowerCase().includes(text));
    if (vistaActiva === 'paquetes') return paquetes.filter(p => (p.Nombre_Paquete || '').toLowerCase().includes(text));
    if (vistaActiva === 'productos') return productos.filter(p => (p.Nombre_Producto || '').toLowerCase().includes(text));
    if (vistaActiva === 'categorias') return categorias.filter(c => (c.Nombre_Categoria || '').toLowerCase().includes(text) || (c.Descripcion_Categoria || '').toLowerCase().includes(text));
    return [];
  };

  return (
    <div className="pagina-admin-root">
      {/* SIDEBAR */}
      <aside className="menu-lateral">
        <div className="menu-lateral__contenedor-logo">
          <div className="menu-lateral__texto-logo">Lion <span>Admin</span></div>
          <p style={{fontSize:'0.6rem', opacity:0.5, letterSpacing:'2px'}}>CONTROL PANEL</p>
        </div>
        <nav className="menu-lateral__navegacion">
          <div className={`menu-lateral__enlace ${vistaActiva === 'usuarios' && 'menu-lateral__enlace--activo'}`} onClick={() => setVistaActiva('usuarios')}>
            <i className="fas fa-users"></i> Usuarios
          </div>
          <div className={`menu-lateral__enlace ${vistaActiva === 'paquetes' && 'menu-lateral__enlace--activo'}`} onClick={() => setVistaActiva('paquetes')}>
            <i className="fas fa-camera"></i> Paquetes
          </div>
          <div className={`menu-lateral__enlace ${vistaActiva === 'productos' && 'menu-lateral__enlace--activo'}`} onClick={() => setVistaActiva('productos')}>
            <i className="fas fa-box"></i> Productos
          </div>
          <div className={`menu-lateral__enlace ${vistaActiva === 'categorias' && 'menu-lateral__enlace--activo'}`} onClick={() => setVistaActiva('categorias')}>
            <i className="fas fa-tags"></i> Categorías
          </div>
          <div className={`menu-lateral__enlace ${vistaActiva === 'solicitudes' && 'menu-lateral__enlace--activo'}`} onClick={() => setVistaActiva('solicitudes')}>
            <i className="fas fa-envelope-open-text"></i> Solicitudes
            {countSolicitudes > 0 && <span className="menu-lateral__contador-pendientes">{countSolicitudes}</span>}
          </div>
          <div className={`menu-lateral__enlace ${vistaActiva === 'opiniones' && 'menu-lateral__enlace--activo'}`} onClick={() => setVistaActiva('opiniones')}>
            <i className="fas fa-star"></i> Opiniones
          </div>
        </nav>
        <div className="menu-lateral__pie">
           <div className="menu-lateral__informacion-admin" onClick={() => {cerrarSesion(); navigate('/login');}} style={{cursor:'pointer'}}>
             <div className="menu-lateral__avatar-admin">{userLocal?.Nombre?.[0] || 'A'}</div>
             <div>
               <div className="menu-lateral__nombre-admin">{userLocal?.Nombre}</div>
               <div className="menu-lateral__rol-admin">Cerrar Sesión</div>
             </div>
           </div>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="area-contenido">
        <header className="barra-encabezado">
          <div className="barra-encabezado__titulo" style={{textTransform:'uppercase'}}>
            Gestión de <span>{vistaActiva}</span>
          </div>
          <div className="barra-encabezado__acciones">
            <div className="indicador-sistema-activo"></div>
            <span style={{fontSize:'10px', letterSpacing:'1px'}}>ONLINE</span>
          </div>
        </header>

        <div className="contenedor-secciones">
          {cargando ? (
            <div style={{textAlign:'center', marginTop:'5rem'}}>
               <i className="fas fa-sync fa-spin fa-2x" style={{color:'var(--rojo)'}}></i>
               <p style={{marginTop:'1rem', fontFamily:'Rajdhani'}}>Sincronizando con base de datos...</p>
            </div>
          ) : (
            <>
              {/* VISTA USUARIOS */}
              {vistaActiva === 'usuarios' && (
                <div>
                  <div className="barra-busqueda-filtros" style={{marginBottom:'2rem'}}>
                    <div className="contenedor-campo-busqueda">
                      <i className="fas fa-search"></i>
                      <input className="campo-busqueda-texto" type="text" placeholder="Buscar usuario..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    </div>
                  </div>
                  <div className="cuadricula-general">
                    {filteredData().map(u => (
                    <div key={u.Id_Usuario} className="tarjeta-admin">
                      <div className="tarjeta-admin__barra"></div>
                      <div className="tarjeta-admin__cuerpo">
                        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'1rem'}}>
                          <div className="menu-lateral__avatar-admin" style={{width:'40px', height:'40px'}}>{u.Nombre[0]}</div>
                          <div>
                            <div style={{fontWeight:700}}>{u.Nombre} {u.Apellidos}</div>
                            <span className={`etiqueta-rol ${u.Rol?.Nombre_Rol === 'admin' || u.Rol?.Nombre_Rol === 'administrador' ? 'etiqueta-rol--administrador' : 'etiqueta-rol--cliente'}`}>
                              {u.Rol?.Nombre_Rol || 'cliente'}
                            </span>
                          </div>
                        </div>
                        <div style={{fontSize:'0.8rem', opacity:0.7}}>{u.Correo}</div>
                        <div style={{fontSize:'0.8rem', opacity:0.7}}>{u.Celular}</div>
                      </div>
                      <div style={{padding:'1rem', background:'rgba(0,0,0,0.2)', display:'flex', gap:'10px'}}>
                        <button className="boton-accion boton-accion--editar" onClick={() => cambiarRolUsuario(u.Id_Usuario, u.Rol?.Nombre_Rol)}>
                          <i className="fas fa-user-shield"></i> Rol
                        </button>
                        <button className="boton-accion boton-accion--eliminar" onClick={() => eliminarUsuario(u.Id_Usuario)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

              {/* VISTA PAQUETES */}
              {vistaActiva === 'paquetes' && (
                <div>
                   <div style={{display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap'}}>
                      <button className="boton-accion boton-accion--guardar" onClick={() => {setElementoEditable(null); setModalAbierto('paquete');}}>
                        <i className="fas fa-plus"></i> Nuevo Paquete
                      </button>
                      <div className="contenedor-campo-busqueda">
                        <i className="fas fa-search"></i>
                        <input className="campo-busqueda-texto" type="text" placeholder="Buscar paquete..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                      </div>
                   </div>
                   <div className="cuadricula-general">
                    {filteredData().map(p => (
                      <div key={p.Id_Paquete} className="tarjeta-admin">
                        <div className="tarjeta-admin__barra"></div>
                        <div className="tarjeta-admin__cuerpo">
                           <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                             <div style={{fontFamily:'Bebas Neue', fontSize:'1.5rem'}}>{p.Nombre_Paquete}</div>
                             <span className={p.Activo ? 'etiqueta-rol--cliente' : 'etiqueta-rol--administrador'} style={{fontSize:'9px'}}>
                                {p.Activo ? 'ACTIVO' : 'OCULTO'}
                             </span>
                           </div>
                           <div style={{color:'var(--rojo)', fontWeight:700, margin:'5px 0'}}>{formatearCOP(p.Precio_Paquete)}</div>
                           <p style={{fontSize:'0.75rem', opacity:0.7}}>{p.Descripcion_Paquete}</p>
                        </div>
                        <div style={{padding:'1rem', background:'rgba(0,0,0,0.2)', display:'flex', gap:'10px'}}>
                           <button className="boton-accion" onClick={() => {setElementoEditable(p); setModalAbierto('paquete');}}>
                             <i className="fas fa-pen"></i>
                           </button>
                           <button className={`boton-accion ${p.Activo ? 'boton-accion--desactivar' : 'boton-accion--activar'}`} onClick={() => handleTogglePaquete(p.Id_Paquete)}>
                             <i className={`fas fa-${p.Activo ? 'eye-slash' : 'eye'}`}></i>
                           </button>
                           <button className="boton-accion boton-accion--eliminar" onClick={() => handleEliminarPaquete(p.Id_Paquete)}>
                             <i className="fas fa-trash"></i>
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VISTA PRODUCTOS */}
              {vistaActiva === 'productos' && (
                <div>
                  <div style={{display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap'}}>
                    <button className="boton-accion boton-accion--guardar" onClick={() => {setElementoEditable(null); setModalAbierto('producto');}}>
                      <i className="fas fa-plus"></i> Nuevo Producto
                    </button>
                    <div className="contenedor-campo-busqueda">
                        <i className="fas fa-search"></i>
                        <input className="campo-busqueda-texto" type="text" placeholder="Buscar producto..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    </div>
                  </div>
                  <div className="cuadricula-general">
                    {filteredData().map(p => (
                      <div key={p.Id_Producto} className="tarjeta-admin">
                        <div className="tarjeta-admin__barra" style={{background:'linear-gradient(90deg, var(--cian), var(--rojo))'}}></div>
                        <div className="tarjeta-admin__cuerpo">
                           <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                             <div style={{fontFamily:'Bebas Neue', fontSize:'1.5rem'}}>{p.Nombre_Producto}</div>
                             <span className={p.Activo ? 'etiqueta-rol--cliente' : 'etiqueta-rol--administrador'} style={{fontSize:'9px'}}>
                                {p.Activo ? 'ACTIVO' : 'OCULTO'}
                             </span>
                           </div>
                           <div style={{color:'var(--cian)', fontWeight:700, margin:'5px 0'}}>{formatearCOP(p.Precio_Producto)}</div>
                           <p style={{fontSize:'0.75rem', opacity:0.7}}>{p.Descripcion_Producto}</p>
                        </div>
                        <div style={{padding:'1rem', background:'rgba(0,0,0,0.2)', display:'flex', gap:'10px'}}>
                           <button className="boton-accion" onClick={() => {setElementoEditable(p); setModalAbierto('producto');}}>
                             <i className="fas fa-pen"></i>
                           </button>
                           <button className={`boton-accion ${p.Activo ? 'boton-accion--desactivar' : 'boton-accion--activar'}`} onClick={() => handleToggleProducto(p.Id_Producto)}>
                             <i className={`fas fa-${p.Activo ? 'eye-slash' : 'eye'}`}></i>
                           </button>
                           <button className="boton-accion boton-accion--eliminar" onClick={() => handleEliminarProducto(p.Id_Producto)}>
                             <i className="fas fa-trash"></i>
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VISTA CATEGORÍAS */}
              {vistaActiva === 'categorias' && (
                <div>
                  <div style={{display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap'}}>
                    <button className="boton-accion boton-accion--guardar" onClick={() => {setElementoEditable(null); setModalAbierto('categoria');}}>
                      <i className="fas fa-plus"></i> Nueva Categoría
                    </button>
                    <div className="contenedor-campo-busqueda">
                        <i className="fas fa-search"></i>
                        <input className="campo-busqueda-texto" type="text" placeholder="Buscar categoría..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    </div>
                  </div>
                  <div className="cuadricula-general">
                    {filteredData().map(c => (
                      <div key={c.Id_Categoria} className="tarjeta-admin">
                        <div className="tarjeta-admin__barra" style={{background:'linear-gradient(90deg, #8A2BE2, #FF00FF)'}}></div>
                        <div className="tarjeta-admin__cuerpo">
                           <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                             <div style={{fontFamily:'Bebas Neue', fontSize:'1.5rem'}}>{c.Nombre_Categoria}</div>
                             <span className={c.Activo ? 'etiqueta-rol--cliente' : 'etiqueta-rol--administrador'} style={{fontSize:'9px'}}>
                                {c.Activo ? 'ACTIVA' : 'OCULTA'}
                             </span>
                           </div>
                           <p style={{fontSize:'0.75rem', opacity:0.7, marginTop:'10px'}}>{c.Descripcion_Categoria || 'Sin descripción'}</p>
                        </div>
                        <div style={{padding:'1rem', background:'rgba(0,0,0,0.2)', display:'flex', gap:'10px'}}>
                           <button className="boton-accion" onClick={() => {setElementoEditable(c); setModalAbierto('categoria');}}>
                             <i className="fas fa-pen"></i>
                           </button>
                           <button className={`boton-accion ${c.Activo ? 'boton-accion--desactivar' : 'boton-accion--activar'}`} onClick={() => handleToggleCategoria(c.Id_Categoria)}>
                             <i className={`fas fa-${c.Activo ? 'eye-slash' : 'eye'}`}></i>
                           </button>
                           <button className="boton-accion boton-accion--eliminar" onClick={() => handleEliminarCategoria(c.Id_Categoria)}>
                             <i className="fas fa-trash"></i>
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VISTA SOLICITUDES */}
              {vistaActiva === 'solicitudes' && (
                <div>
                  <div className="barra-pestanas">
                    <button className={`pestana-boton ${pestanaSolicitudes === 'paquetes' && 'pestana-boton--activa'}`} onClick={() => setPestanaSolicitudes('paquetes')}>Citas</button>
                    <button className={`pestana-boton ${pestanaSolicitudes === 'productos' && 'pestana-boton--activa'}`} onClick={() => setPestanaSolicitudes('productos')}>Pedidos</button>
                    <button className={`pestana-boton ${pestanaSolicitudes === 'personalizado' && 'pestana-boton--activa'}`} onClick={() => setPestanaSolicitudes('personalizado')}>Personalizado</button>
                  </div>
                  <div className="cuadricula-general">
                    {solicitudes.map(s => {
                      const id = s.Id_Reserva_Paquete || s.id || s.Id_Personalizado;
                      const estado = s.Estado_Reserva_Paquete || s.estado || s.Estado_Personalizado;
                      const nombre = s.Nombre_Completo || s.usuario?.Nombre || 'Cliente sin nombre';
                      const correo = s.Correo || s.usuario?.Correo || 'Sin correo asociado';
                      const telefono = s.Numero_Telefono || s.telefono || s.usuario?.Celular || 'N/A';

                      return (
                        <div key={id} className="tarjeta-admin" style={{borderTop: '3px solid var(--rojo)'}}>
                          <div className="tarjeta-admin__cuerpo">
                            {/* ENCABEZADO CLIENTE */}
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'15px'}}>
                              <div>
                                <div style={{fontWeight:700, fontSize:'1.1rem'}}>{nombre}</div>
                                <div style={{fontSize:'0.8rem', opacity:0.7}}><i className="fas fa-envelope"></i> {correo}</div>
                                <div style={{fontSize:'0.8rem', opacity:0.7}}><i className="fas fa-phone"></i> {telefono}</div>
                                <div style={{fontSize:'0.7rem', opacity:0.5, marginTop:'4px'}}>
                                  <i className="fas fa-clock"></i> Creado: {new Date(s.Fecha_Reserva || s.createdAt || s.Fecha_Solicitud).toLocaleString()}
                                </div>
                              </div>
                              <div style={{background: 'rgba(255,8,68,0.1)', color: 'var(--rojo)', padding:'4px 8px', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'bold'}}>
                                #{id}
                              </div>
                            </div>

                            <hr style={{borderColor: 'rgba(255,255,255,0.05)', margin: '15px 0'}} />

                            {/* DETALLES ESPECÍFICOS SEGÚN TIPO */}
                            <div style={{marginBottom:'20px'}}>
                              
                              {/* --- CITAS (PAQUETES) --- */}
                              {pestanaSolicitudes === 'paquetes' && (
                                <div style={{fontSize:'0.85rem'}}>
                                  <div style={{marginBottom:'10px', background:'rgba(255,255,255,0.03)', padding:'10px', borderRadius:'6px'}}>
                                    <div style={{fontSize:'0.7rem', color: 'var(--rojo)', fontWeight:700, letterSpacing:'1px', marginBottom:'5px'}}>🎯 PAQUETE SOLICITADO</div>
                                    <div style={{fontWeight:'bold'}}>{s.paquete?.Nombre_Paquete || 'Paquete Eliminado'}</div>
                                    <div style={{color:'var(--rojo)'}}>{formatearCOP(s.paquete?.Precio_Paquete)}</div>
                                  </div>
                                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px'}}>
                                    <div><strong>Tipo de Evento:</strong> <br/>{s.Tipo_Evento || 'No especificado'}</div>
                                    <div><strong>Fecha del Evento:</strong> <br/>{s.Fecha_Evento || 'No especificada'}</div>
                                    <div><strong>Invitados:</strong> <br/>{s.Numero_Invitados || 'N/A'}</div>
                                  </div>
                                  <div>
                                    <strong>Información Adicional:</strong>
                                    <p style={{opacity:0.8, marginTop:'3px', background:'rgba(0,0,0,0.2)', padding:'8px', borderRadius:'4px'}}>{s.Informacion_Adicional || 'Sin notas adicionales.'}</p>
                                  </div>
                                </div>
                              )}

                              {/* --- PEDIDOS (PRODUCTOS) --- */}
                              {pestanaSolicitudes === 'productos' && (
                                <div style={{fontSize:'0.85rem'}}>
                                  <div style={{marginBottom:'10px', background:'rgba(255,255,255,0.03)', padding:'10px', borderRadius:'6px'}}>
                                    <div style={{fontSize:'0.7rem', color: 'var(--rojo)', fontWeight:700, letterSpacing:'1px', marginBottom:'5px'}}>📍 DATOS DE ENVÍO</div>
                                    <div style={{opacity:0.9}}>{s.direccionEnvio || 'Sin dirección ingresada'}</div>
                                    {s.notas && <div style={{marginTop:'5px', color:'#ccc'}}><em>Notas: {s.notas}</em></div>}
                                  </div>
                                  <div style={{fontSize:'0.7rem', color: 'var(--rojo)', fontWeight:700, letterSpacing:'1px', marginBottom:'5px'}}>🛒 PRODUCTOS ({s.detalles ? s.detalles.length : 0})</div>
                                  <div style={{maxHeight:'120px', overflowY:'auto', background:'rgba(0,0,0,0.2)', padding:'10px', borderRadius:'6px', marginBottom:'10px'}}>
                                    {s.detalles && s.detalles.length > 0 ? s.detalles.map(d => (
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
                                    TOTAL: {formatearCOP(s.total)}
                                  </div>
                                </div>
                              )}

                              {/* --- PERSONALIZADO --- */}
                              {pestanaSolicitudes === 'personalizado' && (
                                <div style={{fontSize:'0.85rem'}}>
                                  <div style={{marginBottom:'10px', background:'rgba(255,255,255,0.03)', padding:'10px', borderRadius:'6px'}}>
                                     <div style={{fontSize:'0.7rem', color: 'var(--rojo)', fontWeight:700, letterSpacing:'1px', marginBottom:'5px'}}>🎁 DESTINATARIO</div>
                                     <div style={{textTransform:'uppercase', fontWeight:'bold'}}>{(s.Destinatario || '').replace('_', ' ')}</div>
                                  </div>
                                  <div style={{marginBottom:'10px'}}>
                                    <strong><i className="fas fa-lightbulb"></i> Idea Principal:</strong>
                                    <p style={{opacity:0.8, marginTop:'3px', background:'rgba(0,0,0,0.2)', padding:'8px', borderRadius:'4px'}}>{s.Descripcion_Idea}</p>
                                  </div>
                                  <div style={{marginBottom:'10px'}}>
                                    <strong><i className="fas fa-puzzle-piece"></i> Elementos Esenciales:</strong>
                                    <p style={{opacity:0.8, marginTop:'3px', background:'rgba(0,0,0,0.2)', padding:'8px', borderRadius:'4px'}}>{s.Elementos_Esenciales}</p>
                                  </div>
                                  <div style={{display:'grid', gridTemplateColumns:'1fr', gap:'5px', marginBottom:'10px'}}>
                                    <div><strong>Prioridad:</strong> <span style={{background:'rgba(255,255,255,0.1)', padding:'2px 6px', borderRadius:'3px'}}>{(s.Prioridad_Cliente || 'normal').toUpperCase()}</span></div>
                                  </div>
                                  {s.Comentarios_Adicionales && (
                                    <div>
                                      <strong>Comentarios:</strong>
                                      <p style={{opacity:0.8, marginTop:'3px'}}>{s.Comentarios_Adicionales}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* SELECTOR DE ESTADO */}
                            <div style={{fontSize:'0.75rem', fontWeight:'bold', marginBottom:'5px', color:'var(--rojo)'}}>ACTUALIZAR ESTADO:</div>
                            <select 
                              className="selector-estado-solicitud"
                              value={estado}
                              onChange={(e) => handleCambiarEstadoSolicitud(id, e.target.value)}
                              style={{width:'100%', padding:'10px', background:'var(--bg-1)', color:'#fff', border:'1px solid var(--borde)', borderRadius:'6px'}}
                            >
                               {(pestanaSolicitudes === 'paquetes' ? ESTADOS_PAQUETE : pestanaSolicitudes === 'productos' ? ESTADOS_PRODUCTO : ESTADOS_PERSONAL).map(e => (
                                 <option key={e} value={e}>{e}</option>
                               ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VISTA OPINIONES */}
              {vistaActiva === 'opiniones' && (
                <div className="cuadricula-general">
                   {opiniones.map(o => (
                     <div key={o.Id_Reseña} className="tarjeta-admin">
                        <div className="tarjeta-admin__cuerpo">
                           <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
                              <div style={{fontWeight:700}}>{o.Nombre_Usuario}</div>
                              <div style={{color:'var(--rojo)'}}>{'★'.repeat(o.Calificacion)}</div>
                           </div>
                           <p style={{fontSize:'0.85rem', fontStyle:'italic', opacity:0.8}}>"{o.Comentario}"</p>
                        </div>
                        <div style={{padding:'0.8rem', background:'rgba(0,0,0,0.2)'}}>
                           <button className="boton-accion boton-accion--eliminar" onClick={() => {
                             pedirConfirmacion('¿Borrar reseña?', `Estás a punto de eliminar la reseña de "${o.Nombre_Usuario || 'Anónimo'}". Esta acción no se puede deshacer.`, async () => {
                               try {
                                 await eliminarOpinionAPI(o.Id_Reseña);
                                 showToast(`🗑️ Reseña de "${o.Nombre_Usuario || 'Anónimo'}" eliminada`);
                                 cargarDatos();
                               } catch (e) { showToast(e.message, 'error'); }
                             });
                           }}>
                             <i className="fas fa-trash"></i> Eliminar
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* MODAL PAQUETES */}
      {modalAbierto === 'paquete' && (
        <div className="modal-fondo">
           <form className="modal-caja" onSubmit={handleGuardarPaquete}>
              <div className="modal__titulo">{elementoEditable ? 'Editar' : 'Nuevo'} <span>Paquete</span></div>
              <div className="modal__campo">
                <label>Nombre del Paquete</label>
                <input name="nombre" defaultValue={elementoEditable?.Nombre_Paquete} required />
              </div>
              <div className="modal__campo">
                <label>Precio (COP)</label>
                <input name="precio" type="number" defaultValue={elementoEditable?.Precio_Paquete} required />
              </div>
              <div className="modal__campo">
                <label>Imagen URL</label>
                <input name="imagen" defaultValue={elementoEditable?.Imagen_Paquete} placeholder="https://..." />
              </div>
              <div className="modal__campo">
                <label>Descripción</label>
                <textarea name="descripcion" defaultValue={elementoEditable?.Descripcion_Paquete} rows="4" required></textarea>
              </div>
              <div className="modal__fila-acciones">
                <button type="button" className="boton-accion" onClick={() => setModalAbierto(null)}>Cancelar</button>
                <button type="submit" className="boton-accion boton-accion--guardar">Guardar Cambios</button>
              </div>
           </form>
        </div>
      )}

      {/* MODAL PRODUCTOS */}
      {modalAbierto === 'producto' && (
        <div className="modal-fondo">
           <form className="modal-caja" onSubmit={handleGuardarProducto}>
              <div className="modal__titulo" style={{color:'var(--cian)'}}>{elementoEditable ? 'Editar' : 'Nuevo'} <span>Producto</span></div>
              <div className="modal__campo">
                <label>Nombre del Producto</label>
                <input name="nombre" defaultValue={elementoEditable?.Nombre_Producto} required />
              </div>
              <div className="modal__campo">
                <label>Precio (COP)</label>
                <input name="precio" type="number" defaultValue={elementoEditable?.Precio_Producto} required />
              </div>
              <div className="modal__campo">
                <label>Imagen URL</label>
                <input name="imagen" defaultValue={elementoEditable?.Imagen_Producto} placeholder="https://..." />
              </div>
              <div className="modal__campo">
                <label>Categoría</label>
                <select name="categoriaId" defaultValue={elementoEditable?.Id_Categoria} required>
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(c => (
                    <option key={c.Id_Categoria} value={c.Id_Categoria}>{c.Nombre_Categoria}</option>
                  ))}
                </select>
              </div>
              <div className="modal__campo">
                <label>Descripción</label>
                <textarea name="descripcion" defaultValue={elementoEditable?.Descripcion_Producto} rows="4" required></textarea>
              </div>
              <div className="modal__fila-acciones">
                <button type="button" className="boton-accion" onClick={() => setModalAbierto(null)}>Cancelar</button>
                <button type="submit" className="boton-accion boton-accion--guardar" style={{background:'var(--cian)', color:'#000'}}>Guardar</button>
              </div>
           </form>
        </div>
      )}

      {/* MODAL CATEGORÍAS */}
      {modalAbierto === 'categoria' && (
        <div className="modal-fondo">
           <form className="modal-caja" onSubmit={handleGuardarCategoria}>
              <div className="modal__titulo" style={{color:'#DDA0DD'}}>{elementoEditable ? 'Editar' : 'Nueva'} <span>Categoría</span></div>
              <div className="modal__campo">
                <label>Nombre de la Categoría</label>
                <input name="nombre" defaultValue={elementoEditable?.Nombre_Categoria} required />
              </div>
              <div className="modal__campo">
                <label>Descripción</label>
                <textarea name="descripcion" defaultValue={elementoEditable?.Descripcion_Categoria} rows="3" placeholder="Opcional"></textarea>
              </div>
              <div className="modal__fila-acciones">
                <button type="button" className="boton-accion" onClick={() => setModalAbierto(null)}>Cancelar</button>
                <button type="submit" className="boton-accion boton-accion--guardar" style={{background:'#FF00FF', color:'#FFF'}}>Guardar</button>
              </div>
           </form>
        </div>
      )}

      {/* TOAST SYSTEM */}
      {toast.visible && (
        <div className={`toast-notificacion toast-notificacion--${toast.tipo}`}>
           <div className="toast-notificacion__icono">
             <i className={`fas fa-${toast.tipo === 'exito' ? 'check-circle' : 'exclamation-triangle'}`}></i>
           </div>
           <div className="toast-notificacion__contenido">
             <div className="toast-notificacion__titulo">{toast.tipo === 'exito' ? 'Operación Exitosa' : 'Atención'}</div>
             <div className="toast-notificacion__detalle">{toast.mensaje}</div>
           </div>
           <button className="toast-notificacion__cerrar" onClick={() => setToast({ visible: false, mensaje: '', tipo: 'exito' })}>
             <i className="fas fa-times"></i>
           </button>
           <div className="toast-notificacion__barra-progreso"></div>
        </div>
      )}

      {/* DIÁLOGO DE CONFIRMACIÓN CUSTOM */}
      {dialogo.abierto && (
        <div className="dialogo-fondo dialogo-fondo--abierto">
          <div className={`dialogo-caja ${dialogo.variante === 'info' ? 'dialogo-caja--variante-info' : ''}`}>
             <div className={`dialogo__icono-central ${dialogo.variante === 'info' ? 'dialogo__icono-central--info' : ''}`}>
                <i className={`fas ${dialogo.variante === 'info' ? 'fa-info-circle' : 'fa-exclamation-triangle'}`}></i>
             </div>
             <div className="dialogo__titulo">{dialogo.titulo}</div>
             <p className="dialogo__mensaje">{dialogo.mensaje}</p>
             <div className="dialogo__fila-botones">
                <button className="boton-accion" onClick={() => setDialogo({ ...dialogo, abierto: false })}>Cancelar</button>
                <button className={`boton-accion ${dialogo.variante === 'info' ? 'boton-accion--editar' : 'boton-accion--eliminar'}`} onClick={() => { dialogo.onConfirm(); setDialogo({ ...dialogo, abierto: false }); }}>
                  Proceder
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaAdmin;
