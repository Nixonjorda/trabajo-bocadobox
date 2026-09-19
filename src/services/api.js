// ============================================================================
//  Capa de servicios de Bocado Box
//  Consume el mock de Postman en lugar de datos estáticos. Cada recurso
//  del sistema tiene su propio endpoint y su propia función de consulta.
// ============================================================================

// URL base del Mock Server de Postman
export const API_BASE = "https://6aa6bcc1d7765db985079242.mockapi.io";

/**
 * Consulta genérica a un recurso del mock.
 * @param {string} recurso  Nombre del recurso (productos, clientes, etc.)
 * @returns {Promise<any>}  JSON parseado que responde el servicio
 */
async function getRecurso(recurso) {
  const respuesta = await fetch(`${API_BASE}/${recurso}`, {
    headers: { Accept: "application/json" },
  });

  if (!respuesta.ok) {
    throw new Error(
      `No se pudo cargar "${recurso}" (código ${respuesta.status}).`
    );
  }

  return respuesta.json();
}

// Un método por recurso para que quede explícito y entendible a nivel de negocio
export const getProductos  = () => getRecurso("producto");
export const getCategorias = () => getRecurso("categoria");
export const getClientes   = () => getRecurso("cliente");
export const getOrdenes    = () => getRecurso("orden");
export const getUsuarios   = () => getRecurso("usuario");
export const getEstados    = () => getRecurso("estado_orden");
export const getInformation= () => getRecurso("information");

// ============================================================================
//  Mutaciones (crear / actualizar) — POST y PUT contra el Mock API.
// ============================================================================
async function enviar(recurso, metodo, ruta, body) {
  const respuesta = await fetch(`${API_BASE}/${ruta}`, {
    method: metodo,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!respuesta.ok) {
    const accion = metodo === "POST" ? "crear" : "actualizar";
    throw new Error(`No se pudo ${accion} en "${recurso}" (código ${respuesta.status}).`);
  }
  return respuesta.json();
}

// Crea un nuevo registro en el recurso indicado
export const crearRecurso = (recurso, body) => enviar(recurso, "POST", recurso, body);

// Actualiza un registro existente por id
export const actualizarRecurso = (recurso, id, body) =>
  enviar(recurso, "PUT", `${recurso}/${id}`, body);

// Elimina un registro existente por id
export const eliminarRecurso = async (recurso, id) => {
  const respuesta = await fetch(`${API_BASE}/${recurso}/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!respuesta.ok) {
    throw new Error(`No se pudo eliminar en "${recurso}" (código ${respuesta.status}).`);
  }
};
