import React, { useState } from 'react';
import { Menu } from './Menu';

export function Header({
  vistaActiva,
  onSelectVista,
  cartCount = 0,
  onOpenCart = () => {},
  mesaActiva = 4
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Módulos transversales del sistema (recursos requeridos en el parcial)
  const modulosSistema = [
    { id: 'productos', label: 'Bowls & Menú', icon: '🥗' },
    { id: 'categorias', label: 'Categorías', icon: '🏷️' },
    { id: 'clientes', label: 'Clientes', icon: '👥' },
    { id: 'ordenes', label: 'Órdenes', icon: '🧾', badge: cartCount > 0 ? `${cartCount}` : null },
    { id: 'usuarios', label: 'Usuarios', icon: '👤' },
    { id: 'estados', label: 'Estados', icon: '🚦' }
  ];

  return (
    <header className="system-header">
      {/* Topbar Institucional y Eco-Friendly */}
      <div className="header-topbar">
        <div className="header-topbar-inner">
          <div className="topbar-left">
            <span className="topbar-tag">🌱 100% ORGÁNICO & FRESH</span>
            <span className="topbar-text">Empaques 100% compostables • Sin ultraprocesados ni azúcares refinados</span>
          </div>
          <div className="topbar-right">
            <span className="topbar-badge">📞 Pedidos: +57 301 555 7890</span>
            <span className="topbar-divider">|</span>
            <span className="topbar-status">
              <span className="status-ping"></span>
              Abierto • Cocina Fresca (11:00 AM - 10:00 PM)
            </span>
          </div>
        </div>
      </div>

      {/* Barra Principal de Navegación */}
      <div className="header-main-bar">
        <div className="header-container">
          {/* Brand / Logotipo Bocado Box */}
          <div
            className="brand-container"
            onClick={() => onSelectVista('productos')}
            role="button"
            tabIndex={0}
            aria-label="Ir al inicio de Bocado Box"
          >
            <div className="brand-logo-icon">
              <span className="fire-icon">🥗</span>
            </div>
            <div className="brand-text-group">
              <span className="brand-title">
                Bocado<span className="brand-title-accent">Box</span>
              </span>
              <span className="brand-tagline">HEALTHY BOWLS & FRESH FOOD</span>
            </div>
          </div>

          {/* Menú de Navegación Transversal */}
          <Menu
            vistas={modulosSistema}
            vistaActiva={vistaActiva}
            onSelectVista={onSelectVista}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            mesaActiva={mesaActiva}
          />

          {/* Acciones de Cabecera */}
          <div className="header-actions-group">
            {/* Indicador de Mesa / Usuario */}
            <div className="user-profile-badge" title="Mesa actual o usuario autenticado">
              <div className="avatar-circle">
                <span>🥑</span>
              </div>
              <div className="user-meta-text">
                <span className="user-role">Mesa Activa</span>
                <span className="user-name">Mesa #{String(mesaActiva).padStart(2, '0')}</span>
              </div>
            </div>

            {/* Botón Mi Box / Carrito */}
            <button
              className={`cart-action-btn ${cartCount > 0 ? 'has-items' : ''}`}
              onClick={onOpenCart}
              aria-label={`Ver pedido actual con ${cartCount} bowls`}
            >
              <div className="cart-icon-wrapper">
                <span className="cart-emoji">🥗</span>
                {cartCount > 0 && (
                  <span className="cart-counter-bubble">{cartCount}</span>
                )}
              </div>
              <span className="cart-btn-label">Mi Box</span>
            </button>

            {/* Botón Hamburguesa para Móviles */}
            <button
              className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Abrir o cerrar menú de navegación móvil"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="toggle-bar"></span>
              <span className="toggle-bar"></span>
              <span className="toggle-bar"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
