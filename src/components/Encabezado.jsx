import React from 'react';

export function Encabezado({ vistaActiva = 'productos' }) {
  // Contenido contextual dinámico adaptado a Bocado Box
  const bannersInfo = {
    productos: {
      badge: '🥗 HEALTHY BOWLS & FRESH FOOD',
      title: 'Nutrición Real en Cada Bocado',
      subtitle:
        'Bowls artesanales preparados al instante con vegetales orgánicos, granos ancestrales, proteínas magras y aderezos naturales hechos en casa.',
      stats: [
        { icon: '🌱', label: '100% Orgánico', desc: 'Sin conservantes ni aditivos' },
        { icon: '⏱️', label: '15-25 min', desc: 'Preparación fresca al instante' },
        { icon: '🥑', label: 'Superfoods & Macros', desc: 'Equilibrio nutricional balanceado' }
      ]
    },
    categorias: {
      badge: '🏷️ CATÁLOGO DE INGREDIENTES',
      title: 'Categorías y Familias de Bowls',
      subtitle:
        'Clasificación por tipo de preparación: Signature Bowls, Protein Boxes, Ensaladas Detox, Smoothies y Toppings Saludables.',
      stats: [
        { icon: '🥣', label: 'Arma tu Bowl', desc: 'Bases, proteínas y aderezos' },
        { icon: '⚡', label: 'Filtros Especiales', desc: 'Keto, Vegano y Gluten Free' }
      ]
    },
    clientes: {
      badge: '👥 COMUNIDAD BOCADO BOX',
      title: 'Directorio de Clientes & Bocado Club',
      subtitle:
        'Administra los comensales frecuentes, planes semanales de alimentación saludable y pedidos a domicilio.',
      stats: [
        { icon: '💚', label: 'Bocado Club', desc: 'Beneficios y recompensas' },
        { icon: '📍', label: 'Direcciones Frecuentes', desc: 'Rutas de entrega programada' }
      ]
    },
    ordenes: {
      badge: '🧾 COMANDAS & PEDIDOS EN CURSO',
      title: 'Estación de Ensamble y Despacho',
      subtitle:
        'Supervisión en tiempo real de las órdenes en barra fría, aderezos especiales, mesas del restaurante y delivery.',
      stats: [
        { icon: '🔔', label: 'Barra en Vivo', desc: 'Sincronización de pedidos' },
        { icon: '📦', label: 'Empaque Compostable', desc: 'Trazabilidad ecológica' }
      ]
    },
    usuarios: {
      badge: '👤 EQUIPO & NUTRICIÓN',
      title: 'Colaboradores y Staff Bocado Box',
      subtitle:
        'Control de accesos para nutricionistas, cocineros de barra fría, cajeros y administradores.',
      stats: [
        { icon: '🥑', label: 'Nutrición Certificada', desc: 'Estandarización de porciones' },
        { icon: '🛡️', label: 'Control de Roles', desc: 'Seguridad y permisos' }
      ]
    },
    estados: {
      badge: '🚦 WORKFLOW FRESH & DELIVERY',
      title: 'Ciclo de Preparación del Bowl',
      subtitle:
        'Seguimiento del pedido: Recibido, Ensamble en Barra Fría, Aderezo & Toppings, En Camino y Entregado.',
      stats: [
        { icon: '⏱️', label: 'Garantía Fresh', desc: 'Menos de 30 min a tu mesa' },
        { icon: '✅', label: 'Control de Calidad', desc: 'Revisión final de frescura' }
      ]
    }
  };

  const current = bannersInfo[vistaActiva] || bannersInfo.productos;

  return (
    <section className="hero-transversal-banner">
      <div className="banner-content-wrapper">
        <div className="banner-text-block">
          <div className="banner-badge-pill">
            <span className="badge-glow-dot"></span>
            <span className="badge-label-text">{current.badge}</span>
          </div>
          <h1 className="banner-main-title">{current.title}</h1>
          <p className="banner-main-description">{current.subtitle}</p>
        </div>

        {current.stats && (
          <div className="banner-stats-grid">
            {current.stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div className="stat-icon-wrapper">{stat.icon}</div>
                <div className="stat-text-group">
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-desc">{stat.desc}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="banner-ambient-glow" aria-hidden="true" />
    </section>
  );
}