import React from 'react';

export function Menu({
  vistas,
  vistaActiva,
  onSelectVista,
  isMobileOpen = false,
  onCloseMobile = () => {},
  mesaActiva = 4
}) {
  return (
    <>
      {/* Menú de Navegación Principal (Desktop) */}
      <nav className="main-nav-desktop" aria-label="Navegación principal de Bocado Box">
        <ul className="nav-links-list">
          {vistas.map((vista) => {
            const isActive = vistaActiva === vista.id;
            return (
              <li key={vista.id} className="nav-item">
                <button
                  className={`nav-link-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectVista(vista.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="nav-link-icon">{vista.icon}</span>
                  <span className="nav-link-text">{vista.label}</span>
                  {vista.badge && (
                    <span className="nav-link-badge">{vista.badge}</span>
                  )}
                  {isActive && <span className="nav-active-indicator" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Menú Móvil (Drawer Lateral) */}
      <div className={`mobile-nav-drawer ${isMobileOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <div className="mobile-brand-title">
            <span className="brand-icon">🥗</span>
            <span>Bocado<strong>Box</strong></span>
          </div>
          <button
            className="mobile-close-btn"
            onClick={onCloseMobile}
            aria-label="Cerrar menú de navegación"
          >
            ✕
          </button>
        </div>

        <div className="mobile-nav-body">
          <p className="mobile-nav-subtitle">Módulos del Restaurante</p>
          <ul className="mobile-links-list">
            {vistas.map((vista) => {
              const isActive = vistaActiva === vista.id;
              return (
                <li key={vista.id}>
                  <button
                    className={`mobile-link-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onSelectVista(vista.id);
                      onCloseMobile();
                    }}
                  >
                    <span className="mobile-item-icon">{vista.icon}</span>
                    <span className="mobile-item-text">{vista.label}</span>
                    {vista.badge && (
                      <span className="nav-link-badge">{vista.badge}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mobile-nav-footer">
          <div className="system-pill">
            <span className="status-dot online"></span>
            <span>Cocina Saludable • Mesa {String(mesaActiva).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Backdrop overlay para móvil */}
      {isMobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
    </>
  );
}