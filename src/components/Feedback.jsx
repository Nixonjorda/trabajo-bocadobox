import React from "react";

// Estado de carga reutilizable mientras el mock responde
export function Cargando({ mensaje = "Cargando información desde el servicio..." }) {
  return (
    <div className="fetch-state fetch-loading">
      <span className="fetch-spinner" aria-hidden="true" />
      <p className="fetch-state-text">{mensaje}</p>
    </div>
  );
}

// Estado de error reutilizable con opción de reintentar la petición
export function ErrorCarga({ mensaje, onReintentar }) {
  return (
    <div className="fetch-state fetch-error">
      <span className="fetch-error-icon">⚠️</span>
      <h3 className="fetch-state-title">No pudimos cargar los datos</h3>
      <p className="fetch-state-text">{mensaje}</p>
      {onReintentar && (
        <button className="btn-reset-filter" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  );
}
