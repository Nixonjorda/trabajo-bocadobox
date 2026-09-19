import React, { useEffect, useRef, useState } from 'react';

// ============================================================================
//  Modal genérico de creación / edición. Renderiza los campos según su
//  configuración y delega el guardado (POST/PUT) al callback onGuardar.
// ============================================================================
export function RecursoForm({ titulo, campos = [], valoresIniciales = {}, onGuardar, onCerrar }) {
  const montado = useRef(true);
  useEffect(() => () => { montado.current = false; }, []);

  const [form, setForm] = useState(() => {
    const inicial = {};
    for (const c of campos) {
      let v = valoresIniciales[c.name];
      if (v === undefined || v === null) v = c.tipo === 'color' ? '#16a34a' : '';
      if (typeof v === 'boolean') v = String(v);
      if (c.name === 'estado' && typeof v === 'string') {
        const estado = v.trim().toLowerCase();
        if (estado === 'disponible' || estado === 'activo' || estado === 'true') v = 'true';
        if (estado === 'agotado' || estado === 'inactivo' || estado === 'false') v = 'false';
      }
      inicial[c.name] = v;
    }
    if ('stock' in inicial) {
      inicial.stockAnterior = inicial.stock;
      if (inicial.estado === 'false') inicial.stock = 0;
      if (inicial.stock !== '' && Number(inicial.stock) <= 0) inicial.estado = 'false';
    }
    return inicial;
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const actualizar = (name, value) => setForm((f) => {
    if (name === 'estado' && 'stock' in f) {
      return {
        ...f,
        estado: value,
        stock: value === 'false' ? 0 : f.stockAnterior,
        stockAnterior: value === 'false' ? f.stock : f.stockAnterior,
      };
    }
    return {
      ...f,
      [name]: value,
      ...(name === 'stock' && f.estado !== 'false' ? { stockAnterior: value } : {}),
    };
  });

  const enviar = async (e) => {
    e.preventDefault();
    for (const c of campos) {
      if (c.requerido && !String(form[c.name] ?? '').trim()) {
        setError(`El campo "${c.label}" es obligatorio.`);
        return;
      }
    }
    setError(null);
    setEnviando(true);
    try {
      const payload = {};
      for (const c of campos) {
        let v = form[c.name];
        if (c.name === 'stock' && form.estado === 'false') v = 0;
        if (c.tipo === 'number') v = v === '' || v == null ? 0 : Number(v);
        payload[c.name] = v;
      }
      await onGuardar(payload); // onGuardar cierra el modal al terminar con éxito
    } catch (err) {
      if (montado.current) setError(err.message || 'No se pudo guardar. Intenta de nuevo.');
    } finally {
      if (montado.current) setEnviando(false);
    }
  };

  return (
    <div className="cart-modal-backdrop" onClick={onCerrar}>
      <div className="cart-modal-sheet recurso-form-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="cart-modal-header">
          <div className="cart-title-block">
            <span className="cart-head-icon">📝</span>
            <h3>{titulo}</h3>
          </div>
          <button className="cart-close-btn" onClick={onCerrar} type="button">✕</button>
        </div>

        <form onSubmit={enviar}>
          <div className="cart-modal-body">
            {error && <div className="form-error">⚠️ {error}</div>}
            <div className="form-grid">
              {campos.map((c) => (
                <div className={`form-field ${c.full ? 'full' : ''}`} key={c.name}>
                  <label className="form-label" htmlFor={`f-${c.name}`}>
                    {c.label}{c.requerido && <span className="req-star"> *</span>}
                  </label>
                  {c.tipo === 'textarea' ? (
                    <textarea
                      id={`f-${c.name}`}
                      className="form-control"
                      rows={3}
                      placeholder={c.placeholder || ''}
                      value={form[c.name]}
                      onChange={(e) => actualizar(c.name, e.target.value)}
                    />
                  ) : c.tipo === 'select' ? (
                    <select
                      id={`f-${c.name}`}
                      className="form-control"
                      value={form[c.name]}
                      onChange={(e) => actualizar(c.name, e.target.value)}
                    >
                      <option value="">— Selecciona —</option>
                      {(c.opciones || []).map((o) => (
                        <option value={o.value} key={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`f-${c.name}`}
                      type={c.tipo === 'number' ? 'number' : c.tipo === 'color' ? 'color' : 'text'}
                      className="form-control"
                      placeholder={c.placeholder || ''}
                      value={form[c.name]}
                      onChange={(e) => actualizar(c.name, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="cart-modal-footer">
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onCerrar} disabled={enviando}>
                Cancelar
              </button>
              <button type="submit" className="btn-confirm-order" disabled={enviando}>
                {enviando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
