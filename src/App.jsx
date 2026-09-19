import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './App.css';
import { Header } from './components/Header';
import { Encabezado } from './components/Encabezado';
import { Product } from './components/Product';
import { Footer } from './components/Footer';
import { Cargando, ErrorCarga } from './components/Feedback';
import { useRecurso } from './hooks/useRecurso';
import {
  getProductos,
  getCategorias,
  getClientes,
  getOrdenes,
  getUsuarios,
  getEstados,
  crearRecurso,
  actualizarRecurso,
  eliminarRecurso,
} from './services/api';
import { RecursoForm } from './components/RecursoForm';
import { getCampos, getTitulo, LABEL_RECURSO } from './config/formularios';

// Recursos válidos que exponen una ruta propia (/productos, /clientes, ...)
const VISTAS_VALIDAS = ['productos', 'categorias', 'clientes', 'ordenes', 'usuarios', 'estados'];

// Mapeo del id de estado del pedido a la clase visual de la insignia
const CLASE_ESTADO = {
  'EST-01': 'status-pending',
  'EST-02': 'status-cooking',
  'EST-03': 'status-cooking',
  'EST-04': 'status-delivery',
  'EST-05': 'status-delivery',
  'EST-06': 'status-delivered',
};

// Utilidades de presentación
const formatearPrecio = (valor) => `$ ${Number(valor || 0).toLocaleString('es-CO')}`;

function App() {
  // ---------------------------------------------------------------------------
  // Navegación por URL: la vista activa se deriva del parámetro :recurso
  // ---------------------------------------------------------------------------
  const navigate = useNavigate();
  const { recurso } = useParams();
  const vistaActiva = VISTAS_VALIDAS.includes(recurso) ? recurso : 'productos';
  const irAVista = (id) => navigate(`/${id}`);

  // Estados de catálogo y filtros de Bocado Box
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');

  // Estados del pedido (Box) / Carrito
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [modal, setModal] = useState(null);
  const [mesaActiva, setMesaActiva] = useState(() => {
    const mesaGuardada = Number(localStorage.getItem('mesaActiva'));
    return Number.isInteger(mesaGuardada) && mesaGuardada > 0 ? mesaGuardada : 4;
  });

  // ---------------------------------------------------------------------------
  // Datos traídos del mock de Postman. Cada recurso solo se consulta cuando
  // su vista está activa (según la ruta), con sus estados de carga y error.
  // ---------------------------------------------------------------------------
  const productosReq  = useRecurso(getProductos,  vistaActiva === 'productos');
  const categoriasReq = useRecurso(getCategorias, vistaActiva === 'categorias');
  const clientesReq   = useRecurso(getClientes,   vistaActiva === 'clientes');
  const ordenesReq    = useRecurso(getOrdenes,    vistaActiva === 'ordenes');
  const usuariosReq   = useRecurso(getUsuarios,   vistaActiva === 'usuarios');
  const estadosReq    = useRecurso(getEstados,    vistaActiva === 'estados');

  const productos = productosReq.data;

  // ---------------------------------------------------------------------------
  // Formularios de creación / actualización (CRUD) contra el Mock API.
  // ---------------------------------------------------------------------------
  const reqPorRecurso = {
    producto: productosReq,
    categoria: categoriasReq,
    cliente: clientesReq,
    orden: ordenesReq,
    usuario: usuariosReq,
    estado_orden: estadosReq,
  };

  // Carga bajo demanda de listas de referencia para los <select> del formulario
  const cargarOpciones = async (recursoObjetivo) => {
    try {
      if (recursoObjetivo === 'producto') return { categorias: await getCategorias() };
      if (recursoObjetivo === 'orden') {
        const [clientes, estados] = await Promise.all([getClientes(), getEstados()]);
        return { clientes, estados };
      }
    } catch {
      /* Si falla, el formulario se abre con selects vacíos */
    }
    return {};
  };

  const abrirModal = async (recursoObjetivo, modo, registro = {}) => {
    const opciones = await cargarOpciones(recursoObjetivo);
    setModal({
      recurso: recursoObjetivo,
      modo,
      registro,
      opciones,
      campos: getCampos(recursoObjetivo, opciones),
    });
  };

  const guardarRegistro = async (payload) => {
    const { recurso: rec, modo, registro, opciones } = modal;
    const body = { ...registro, ...payload };
    delete body.id;

    // Derivaciones de relaciones para 'orden' (estado y cliente)
    if (rec === 'orden') {
      const est = opciones?.estados?.find((e) => e.codigo === body.estadoId);
      if (est) body.estado = est.nombre;
      const cli = opciones?.clientes?.find(
        (c) => `${c.nombre || ''} ${c.apellido || ''}`.trim() === body.cliente
      );
      if (cli) {
        body.clienteId = cli.id;
        if (!body.telefono) body.telefono = cli.telefono;
      }
    }

    if (modo === 'crear') {
      await crearRecurso(rec, body);
    } else {
      await actualizarRecurso(rec, registro.id, body);
    }

    reqPorRecurso[rec]?.reintentar();
    setToastMessage(
      `✅ ${LABEL_RECURSO[rec]} ${modo === 'crear' ? 'creado(a)' : 'actualizado(a)'} correctamente`
    );
    setTimeout(() => setToastMessage(null), 3000);
    setModal(null);
  };

  const cancelarOrden = async (orden) => {
    const identificador = orden.numero || orden.id;
    const confirmado = window.confirm(
      `¿Quieres cancelar la orden ${identificador} de ${orden.ubicacion || 'esta mesa'}? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      await eliminarRecurso('orden', orden.id);
      ordenesReq.reintentar();
      setToastMessage('✅ Orden cancelada correctamente.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      setToastMessage(`⚠️ ${error.message || 'No se pudo cancelar la orden.'}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Manejo de la canasta (Mi Box)
  const handleAddToCart = (nombreProducto) => {
    const prod = productos.find((p) => p.nombre === nombreProducto);
    if (!prod) return;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...prod, cantidad: 1 }];
    });

    // Notificación toast flotante
    setToastMessage(`¡"${prod.nombre}" agregado a tu Bocado Box!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.cantidad, 0);
  const totalCartPrice = cartItems.reduce((acc, curr) => acc + curr.precio * curr.cantidad, 0);

  const confirmarPedido = async () => {
    const mesaFormateada = String(mesaActiva).padStart(2, '0');
    const siguienteMesa = mesaActiva >= 10 ? 1 : mesaActiva + 1;
    const orden = {
      numero: `ORD-${Date.now()}`,
      cliente: `Comensal Mesa #${mesaFormateada}`,
      estadoId: 'EST-01',
      estado: 'Pendiente',
      ubicacion: `Mesa #${mesaFormateada}`,
      productos: cartItems.map((item) => `${item.cantidad}x ${item.nombre}`).join(', '),
      cantidadItems: totalCartCount,
      total: totalCartPrice,
    };

    try {
      await crearRecurso('orden', orden);
      localStorage.setItem('mesaActiva', String(siguienteMesa));
      setMesaActiva(siguienteMesa);
      setCartItems([]);
      setIsCartOpen(false);
      setToastMessage(`✅ Orden enviada. Siguiente mesa: #${String(siguienteMesa).padStart(2, '0')}`);
      setTimeout(() => setToastMessage(null), 3000);
      irAVista('ordenes');
    } catch (error) {
      setToastMessage(`⚠️ ${error.message || 'No se pudo enviar la orden.'}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Filtrado de productos por categoría y término de búsqueda
  const productosFiltrados = productos.filter((p) => {
    const nombreCategoria = p.categoria ?? '';
    const matchCategoria = categoriaFiltro === 'Todas' || nombreCategoria === categoriaFiltro;
    const matchBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  // Chips de categorías derivados dinámicamente de la data del mock
  const categoriasMenu = ['Todas', ...new Set(productos.map((p) => p.categoria).filter(Boolean))];

  return (
    <div className="app-layout">
      {/* Componente Transversal: Header con Marca Bocado Box y Menú */}
      <Header
        vistaActiva={vistaActiva}
        onSelectVista={irAVista}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        mesaActiva={mesaActiva}
      />

      {/* Componente Transversal: Encabezado / Hero Banner Contextual */}
      <Encabezado vistaActiva={vistaActiva} />

      {/* Contenedor Principal Adaptable */}
      <main className="app-container">
        {/* =========================================================================
            VISTA: PRODUCTOS (Catálogo de Bowls y Comida Saludable)  -> /productos
           ========================================================================= */}
        {vistaActiva === 'productos' && (
          <section className="view-section products-view">
            {/* Barra de Filtros por Categoría y Buscador */}
            <div className="catalog-toolbar">
              <div className="category-filter-chips">
                {categoriasMenu.map((cat) => (
                  <button
                    key={cat}
                    className={`filter-chip ${categoriaFiltro === cat ? 'active' : ''}`}
                    onClick={() => setCategoriaFiltro(cat)}
                  >
                    {cat === 'Todas' ? '🥗 Todos los Bowls' : cat}
                  </button>
                ))}
              </div>

              <div className="search-box-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por ingrediente (salmón, quinoa, aguacate...)"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="search-input"
                />
                {busqueda && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setBusqueda('')}
                    title="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Cabecera del Listado */}
            <div className="section-title-row">
              <div>
                <h2 className="section-title">
                  {categoriaFiltro === 'Todas' ? 'Carta Completa de Bowls Saludables' : `Categoría: ${categoriaFiltro}`}
                </h2>
                <p className="section-subtitle">
                  Mostrando {productosFiltrados.length} opciones balanceadas y preparadas con ingredientes 100% naturales
                </p>
              </div>
              <div className="section-actions">
                <span className="live-badge">🟢 Barra Fría Abierta</span>
                <button className="btn-primary-action" onClick={() => abrirModal('producto', 'crear')}>
                  <span>➕</span> Nuevo Producto
                </button>
              </div>
            </div>

            {/* Estados de carga / error / contenido del recurso */}
            {productosReq.cargando ? (
              <Cargando mensaje="Cargando la carta de bowls desde el servicio..." />
            ) : productosReq.error ? (
              <ErrorCarga mensaje={productosReq.error} onReintentar={productosReq.reintentar} />
            ) : productosFiltrados.length > 0 ? (
              <div className="product-grid">
                {productosFiltrados.map((producto) => (
                  <Product
                    key={producto.id}
                    indice={producto.id}
                    nombre={producto.nombre}
                    descripcion={producto.descripcion}
                    precio={producto.precio}
                    stock={producto.stock}
                    imagen={producto.imagen}
                    tag={producto.etiqueta}
                    categoria={producto.categoria}
                    calorias={producto.calorias}
                    estado={producto.estado}
                    onAddToCart={handleAddToCart}
                    onEdit={() => abrirModal('producto', 'editar', producto)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state-card">
                <span className="empty-emoji">🥑</span>
                <h3>No encontramos platillos con esa descripción</h3>
                <p>No hay coincidencias para "{busqueda}". Prueba buscando quinoa, salmón o detox.</p>
                <button
                  className="btn-reset-filter"
                  onClick={() => { setBusqueda(''); setCategoriaFiltro('Todas'); }}
                >
                  Restablecer Menú Completo
                </button>
              </div>
            )}
          </section>
        )}

        {/* =========================================================================
            VISTA: CATEGORÍAS (Recurso 2)  -> /categorias
           ========================================================================= */}
        {vistaActiva === 'categorias' && (
          <section className="view-section resource-view">
            <div className="resource-header-bar">
              <div>
                <h2 className="section-title">Familias & Categorías Saludables</h2>
                <p className="section-subtitle">Clasificación de ingredientes y tipos de preparación de Bocado Box.</p>
              </div>
              <button className="btn-primary-action" onClick={() => abrirModal('categoria', 'crear')}>
                <span>➕</span> Crear Nueva Categoría
              </button>
            </div>

            {categoriasReq.cargando ? (
              <Cargando mensaje="Cargando categorías desde el servicio..." />
            ) : categoriasReq.error ? (
              <ErrorCarga mensaje={categoriasReq.error} onReintentar={categoriasReq.reintentar} />
            ) : (
              <div className="categories-card-grid">
                {categoriasReq.data.map((cat) => (
                  <div key={cat.id} className="category-admin-card">
                    <div className="cat-card-header">
                      <span className="cat-card-icon">{cat.icono}</span>
                      <span className="cat-card-badge">{cat.totalProductos} Platillos</span>
                    </div>
                    <h3 className="cat-card-title">{cat.nombre}</h3>
                    <p className="cat-card-desc">{cat.descripcion}</p>
                    <div className="cat-card-footer">
                      <span className="cat-status-online">🟢 Activa en Barra Fría</span>
                      <div className="card-actions-inline">
                        <button className="btn-link-action" onClick={() => abrirModal('categoria', 'editar', cat)}>
                          ✏️ Editar
                        </button>
                        <button
                          className="btn-link-action"
                          onClick={() => {
                            setCategoriaFiltro(cat.nombre);
                            irAVista('productos');
                          }}
                        >
                          Ver →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* =========================================================================
            VISTA: CLIENTES (Recurso 3)  -> /clientes
           ========================================================================= */}
        {vistaActiva === 'clientes' && (
          <section className="view-section resource-view">
            <div className="resource-header-bar">
              <div>
                <h2 className="section-title">Comunidad & Bocado Club</h2>
                <p className="section-subtitle">Directorio de comensales frecuentes y planes de nutrición activa.</p>
              </div>
              <button className="btn-primary-action" onClick={() => abrirModal('cliente', 'crear')}>
                <span>➕</span> Registrar Comensal
              </button>
            </div>

            {clientesReq.cargando ? (
              <Cargando mensaje="Cargando comensales desde el servicio..." />
            ) : clientesReq.error ? (
              <ErrorCarga mensaje={clientesReq.error} onReintentar={clientesReq.reintentar} />
            ) : (
              <div className="table-responsive-container">
                <table className="custom-data-table">
                  <thead>
                    <tr>
                      <th>ID Cliente</th>
                      <th>Nombre Completo</th>
                      <th>Teléfono</th>
                      <th>Correo Electrónico</th>
                      <th>Historial</th>
                      <th>Membresía</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesReq.data.map((cli) => (
                      <tr key={cli.id}>
                        <td><span className="code-pill">{cli.id}</span></td>
                        <td><strong>{cli.nombre} {cli.apellido}</strong></td>
                        <td>{cli.telefono}</td>
                        <td>{cli.email}</td>
                        <td><span className="orders-pill">{cli.totalOrdenes} boxes</span></td>
                        <td>
                          <span className={`client-type-badge ${cli.tipo.includes('VIP') ? 'vip' : ''}`}>
                            {cli.tipo}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="btn-table-icon" title="Editar comensal" onClick={() => abrirModal('cliente', 'editar', cli)}>✏️</button>
                            <button className="btn-table-icon" title="Ver plan nutricional">📋</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* =========================================================================
            VISTA: ÓRDENES (Recurso 4)  -> /ordenes
           ========================================================================= */}
        {vistaActiva === 'ordenes' && (
          <section className="view-section resource-view">
            <div className="resource-header-bar">
              <div>
                <h2 className="section-title">Comandas & Ensamble en Barra</h2>
                <p className="section-subtitle">Seguimiento en vivo de los bowls en estación de preparación y despacho.</p>
              </div>
              <button className="btn-primary-action" onClick={() => abrirModal('orden', 'crear')}>
                <span>➕</span> Crear Nueva Orden
              </button>
            </div>

            {ordenesReq.cargando ? (
              <Cargando mensaje="Cargando comandas desde el servicio..." />
            ) : ordenesReq.error ? (
              <ErrorCarga mensaje={ordenesReq.error} onReintentar={ordenesReq.reintentar} />
            ) : (
              <div className="orders-grid">
                {ordenesReq.data.map((ord) => (
                  <div key={ord.id} className="order-item-card">
                    <div className="order-card-header">
                      <span className="order-number">{ord.id}</span>
                      <span className={`order-status-badge ${CLASE_ESTADO[ord.estadoId] || ''}`}>
                        {ord.estado}
                      </span>
                    </div>
                    <div className="order-location-row">
                      <span className="order-location-tag">📍 {ord.ubicacion}</span>
                      <span className="order-client-name">Cliente: {ord.cliente}</span>
                    </div>
                    <p className="order-items-summary">{ord.productos}</p>
                    <div className="order-card-footer">
                      <span className="order-total-price">{formatearPrecio(ord.total)}</span>
                      <div className="order-card-actions">
                        <button className="btn-order-details" onClick={() => abrirModal('orden', 'editar', ord)}>Editar Comanda →</button>
                        <button className="btn-order-cancel" onClick={() => cancelarOrden(ord)}>Cancelar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* =========================================================================
            VISTA: USUARIOS (Recurso 5)  -> /usuarios
           ========================================================================= */}
        {vistaActiva === 'usuarios' && (
          <section className="view-section resource-view">
            <div className="resource-header-bar">
              <div>
                <h2 className="section-title">Staff y Nutricionistas Bocado Box</h2>
                <p className="section-subtitle">Equipo humano responsable de la cocina saludable y administración.</p>
              </div>
              <button className="btn-primary-action" onClick={() => abrirModal('usuario', 'crear')}>
                <span>➕</span> Nuevo Colaborador
              </button>
            </div>

            {usuariosReq.cargando ? (
              <Cargando mensaje="Cargando el equipo desde el servicio..." />
            ) : usuariosReq.error ? (
              <ErrorCarga mensaje={usuariosReq.error} onReintentar={usuariosReq.reintentar} />
            ) : (
              <div className="users-card-grid">
                {usuariosReq.data.map((user) => (
                  <div key={user.id} className="user-profile-card">
                    <div className="user-card-avatar">{user.icono}</div>
                    <h3 className="user-card-name">{user.nombre}</h3>
                    <p className="user-card-role">{user.rol}</p>
                    <div className="user-card-meta">
                      <span>@{user.usuario}</span>
                      <span className="user-status-pill">🟢 {user.estado}</span>
                    </div>
                    <div className="user-card-actions">
                      <button className="btn-user-edit" onClick={() => abrirModal('usuario', 'editar', user)}>Gestionar Perfil</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* =========================================================================
            VISTA: ESTADOS DE LA ORDEN (Recurso 6)  -> /estados
           ========================================================================= */}
        {vistaActiva === 'estados' && (
          <section className="view-section resource-view">
            <div className="resource-header-bar">
              <div>
                <h2 className="section-title">Flujo Fresh & Despacho del Bowl</h2>
                <p className="section-subtitle">Etapas secuenciales desde la orden del comensal hasta la entrega sostenible.</p>
              </div>
              <button className="btn-primary-action" onClick={() => abrirModal('estado_orden', 'crear')}>
                <span>➕</span> Nuevo Estado
              </button>
            </div>

            {estadosReq.cargando ? (
              <Cargando mensaje="Cargando el flujo de estados desde el servicio..." />
            ) : estadosReq.error ? (
              <ErrorCarga mensaje={estadosReq.error} onReintentar={estadosReq.reintentar} />
            ) : (
              <div className="status-timeline-grid">
                {estadosReq.data.map((est) => (
                  <div
                    key={est.id}
                    className="status-stage-card"
                    style={{ borderTopColor: est.color }}
                  >
                    <div className="stage-card-top">
                      <span className="stage-step-pill" style={{ backgroundColor: est.color }}>
                        Paso {est.secuencia}
                      </span>
                      <span className="stage-icon">{est.icono}</span>
                    </div>
                    <h3 className="stage-name">{est.nombre}</h3>
                    <p className="stage-desc">{est.descripcion}</p>
                    <div className="stage-footer">
                      <span className="stage-code">{est.codigo}</span>
                      <button className="btn-link-action" onClick={() => abrirModal('estado_orden', 'editar', est)}>✏️ Editar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Modal / Drawer de Mi Box (Carrito Saludable) */}
      {isCartOpen && (
        <div className="cart-modal-backdrop" onClick={() => setIsCartOpen(false)}>
          <div className="cart-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="cart-modal-header">
              <div className="cart-title-block">
                <span className="cart-head-icon">🥗</span>
                <h3>Mi Bocado Box / Pedido Activo</h3>
              </div>
              <button className="cart-close-btn" onClick={() => setIsCartOpen(false)}>✕</button>
            </div>

            <div className="cart-modal-body">
              {cartItems.length > 0 ? (
                <div className="cart-items-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item-row">
                      <div className="cart-item-info">
                        <strong className="cart-item-title">{item.nombre}</strong>
                        <span className="cart-item-unit-price">
                          ${Number(item.precio).toLocaleString('es-CO')} c/u • {item.calorias ? `${item.calorias} kcal` : 'Clean'}
                        </span>
                      </div>
                      <div className="cart-item-controls">
                        <span className="cart-qty-badge">x{item.cantidad}</span>
                        <span className="cart-subtotal">
                          ${Number(item.precio * item.cantidad).toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cart-empty-message">
                  <span className="empty-cart-icon">🥣</span>
                  <p>Aún no has agregado bowls a tu box.</p>
                  <p className="empty-sub">Explora nuestras opciones saludables y crea tu combinación preferida.</p>
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="cart-modal-footer">
                <div className="cart-summary-line">
                  <span>Total Saludable:</span>
                  <strong className="cart-total-value">
                    ${Number(totalCartPrice).toLocaleString('es-CO')}
                  </strong>
                </div>
                <button
                  className="btn-confirm-order"
                  onClick={confirmarPedido}
                >
                  Confirmar y Enviar a Barra Fría 🥗
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de formulario CRUD (crear / actualizar) */}
      {modal && (
        <RecursoForm
          titulo={getTitulo(modal.recurso, modal.modo)}
          campos={modal.campos}
          valoresIniciales={modal.registro}
          onGuardar={guardarRegistro}
          onCerrar={() => setModal(null)}
        />
      )}

      {/* Notificación Toast Flotante */}
      {toastMessage && (
        <div className="floating-toast">
          <span className="toast-icon">🥑</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Componente Transversal: Footer Institucional Bocado Box */}
      <Footer onSelectVista={irAVista} />
    </div>
  );
}

export default App;
