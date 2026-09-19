import React from 'react';
import { useRecurso } from '../hooks/useRecurso';
import { getInformation } from '../services/api';

// Iconos por red social (fallback genérico si no coincide el nombre)
const ICONO_RED = {
  Instagram: '📸',
  TikTok: '🎵',
  WhatsApp: '💬',
  Facebook: '👍',
  YouTube: '▶️',
};

// Valores por defecto por si el servicio /information aún no responde o falla,
// para que el footer nunca quede vacío.
const FALLBACK = {
  marca: 'Bocado Box',
  razonSocial: 'Bocado Box S.A.S.',
  descripcion:
    'Restaurante de comida consciente y saludable. Diseñamos bowls nutritivos, cajas de proteína y ensaladas gourmet con ingredientes de origen local, aderezos artesanales y sin azúcares añadidos.',
  horario: 'Lunes a Domingo: 11:00 AM – 10:00 PM',
  telefono: '+57 301 555 7890',
  email: 'pedidos@bocadobox.co',
  sedes: [
    { nombre: 'Sede Poblado', direccion: 'Cra 37 # 10A-24, Vía Provenza, Medellín' },
    { nombre: 'Sede Laureles', direccion: 'Circular 73 # 39-12, Medellín' },
  ],
  redes: [
    { red: 'Instagram', handle: '@bocadobox.co', url: '#instagram' },
    { red: 'TikTok', handle: 'TikTok', url: '#tiktok' },
    { red: 'WhatsApp', handle: 'WhatsApp Fresh', url: '#whatsapp' },
  ],
  beneficios: [
    { icono: '🌱', titulo: '100% Ingredientes Orgánicos', descripcion: 'Cosecha local diaria sin conservantes' },
    { icono: '🥣', titulo: 'Bowls & Cajas Equilibradas', descripcion: 'Calculados por nutricionistas en macros' },
    { icono: '♻️', titulo: 'Empaques 100% Biodegradables', descripcion: 'Comprometidos con el planeta y tu salud' },
    { icono: '⭐', titulo: 'Garantía Fresh & Sabor', descripcion: 'Preparación fresca directo a tu mesa' },
  ],
  legales: ['Políticas de Nutrición', 'Términos de Servicio', 'Compromiso Cero Plásticos'],
  proyecto: {
    institucion: 'TdeA Institución Universitaria',
    asignatura: 'Desarrollo Web',
    docente: 'Yan Carlo Angarita',
    evaluacion: 'Bocado Box Frontend',
    version: 'Bocado Box v2.0',
  },
};

export function Footer({ onSelectVista = () => {} }) {
  const currentYear = new Date().getFullYear();

  // Datos institucionales traídos del recurso /information del mock.
  const { data } = useRecurso(getInformation, true);
  const info = (Array.isArray(data) && data[0]) ? data[0] : {};

  const marca       = info.marca       ?? FALLBACK.marca;
  const descripcion = info.descripcion ?? FALLBACK.descripcion;
  const horario     = info.horario     ?? FALLBACK.horario;
  const telefono    = info.telefono    ?? FALLBACK.telefono;
  const email       = info.email       ?? FALLBACK.email;
  const sedes       = info.sedes?.length      ? info.sedes      : FALLBACK.sedes;
  const redes       = info.redes?.length      ? info.redes      : FALLBACK.redes;
  const beneficios  = info.beneficios?.length ? info.beneficios : FALLBACK.beneficios;
  const legales     = info.legales?.length    ? info.legales    : FALLBACK.legales;
  const proyecto    = info.proyecto    ?? FALLBACK.proyecto;

  // Separa la marca en primera palabra + resto para conservar el acento visual
  const [marcaPrincipal, ...restoMarca] = String(marca).split(' ');
  const marcaAccent = restoMarca.join(' ');

  return (
    <footer className="system-footer">
      {/* Sección Superior: Beneficios Saludables */}
      <div className="footer-benefits-bar">
        <div className="footer-container">
          <div className="benefits-grid">
            {beneficios.map((b, idx) => (
              <div className="benefit-item" key={idx}>
                <span className="benefit-icon">{b.icono}</span>
                <div>
                  <strong className="benefit-title">{b.titulo}</strong>
                  <p className="benefit-desc">{b.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido Principal del Footer */}
      <div className="footer-main-content">
        <div className="footer-container">
          <div className="footer-columns-grid">
            {/* Columna 1: Identidad Corporativa Bocado Box */}
            <div className="footer-col brand-col">
              <div className="footer-brand-header">
                <span className="footer-brand-icon">🥗</span>
                <span className="footer-brand-name">
                  {marcaPrincipal}
                  {marcaAccent && <span className="brand-accent">{marcaAccent}</span>}
                </span>
              </div>
              <p className="footer-brand-tagline">{descripcion}</p>
              <div className="footer-social-links">
                {redes.map((r, idx) => (
                  <a href={r.url || '#'} className="social-btn" title={`${r.red} de ${marca}`} key={idx}>
                    {(ICONO_RED[r.red] || '🔗')} {r.handle}
                  </a>
                ))}
              </div>
            </div>

            {/* Columna 2: Módulos del Sistema */}
            <div className="footer-col">
              <h4 className="footer-col-title">Módulos del Sistema</h4>
              <ul className="footer-nav-list">
                <li><button onClick={() => onSelectVista('productos')} className="footer-link-btn">🥗 Carta de Bowls & Menú</button></li>
                <li><button onClick={() => onSelectVista('categorias')} className="footer-link-btn">🏷️ Categorías de Alimentos</button></li>
                <li><button onClick={() => onSelectVista('clientes')} className="footer-link-btn">👥 Comunidad & Bocado Club</button></li>
                <li><button onClick={() => onSelectVista('ordenes')} className="footer-link-btn">🧾 Centro de Órdenes & Ensamble</button></li>
                <li><button onClick={() => onSelectVista('usuarios')} className="footer-link-btn">👤 Nutricionistas & Personal</button></li>
                <li><button onClick={() => onSelectVista('estados')} className="footer-link-btn">🚦 Flujo de Preparación Fresh</button></li>
              </ul>
            </div>

            {/* Columna 3: Sedes, Horarios y Contacto */}
            <div className="footer-col">
              <h4 className="footer-col-title">Sedes & Atención</h4>
              <ul className="footer-contact-list">
                {sedes.map((s, idx) => (
                  <li className="contact-item" key={idx}>
                    <span className="contact-icon">📍</span>
                    <div>
                      <strong>{s.nombre}:</strong>
                      <span>{s.direccion}</span>
                    </div>
                  </li>
                ))}
                <li className="contact-item">
                  <span className="contact-icon">🕒</span>
                  <div>
                    <strong>Horario Continuo:</strong>
                    <span>{horario}</span>
                  </div>
                </li>
                <li className="contact-item">
                  <span className="contact-icon">📞</span>
                  <div>
                    <strong>Línea Saludable:</strong>
                    <span>{telefono} / {email}</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Columna 4: Información Académica y Proyecto */}
            <div className="footer-col academic-col">
              <h4 className="footer-col-title">Proyecto Académico</h4>
              <div className="academic-badge-card">
                <div className="tdea-logo-pill">🎓 {proyecto.institucion}</div>
                <p className="academic-course"><strong>Asignatura:</strong> {proyecto.asignatura}</p>
                <p className="academic-teacher"><strong>Docente:</strong> {proyecto.docente}</p>
                <p className="academic-eval"><strong>Evaluación Parcial:</strong> {proyecto.evaluacion}</p>
                <div className="academic-system-status">
                  <span className="status-indicator-dot"></span>
                  <span>{proyecto.version} • Sistema Operativo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Inferior de Derechos */}
      <div className="footer-bottom-bar">
        <div className="footer-container bottom-flex">
          <p className="copyright-text">
            © {currentYear} <strong>{info.razonSocial ?? FALLBACK.razonSocial}</strong> Alimentación consciente y saludable. Todos los derechos reservados.
          </p>
          <div className="footer-legal-links">
            {legales.map((l, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="legal-dot">•</span>}
                <span className="legal-item">{l}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
