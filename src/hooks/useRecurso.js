import { useEffect, useState } from "react";

// ============================================================================
//  Hook reutilizable para consumir un recurso del mock de Postman.
//  Expone la data y los estados de carga y error para que cada vista
//  pueda pintar spinners o mensajes sin duplicar lógica.
//
//  El parámetro "activo" permite que solo se dispare la petición del
//  recurso que se está viendo (según la ruta actual), evitando llamadas
//  innecesarias a los demás endpoints.
// ============================================================================
export function useRecurso(fetchFn, activo = true) {
  const [data, setData] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [recargar, setRecargar] = useState(0);

  useEffect(() => {
    if (!activo) return;

    let vigente = true;
    setCargando(true);
    setError(null);

    fetchFn()
      .then((respuesta) => {
        if (vigente) setData(Array.isArray(respuesta) ? respuesta : []);
      })
      .catch((err) => {
        if (vigente) setError(err.message || "Error inesperado al consultar el servicio.");
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    // Evita actualizar estado si el componente se desmontó / cambió de vista
    return () => {
      vigente = false;
    };
  }, [fetchFn, activo, recargar]);

  // Permite reintentar la carga desde la UI (botón "Reintentar")
  const reintentar = () => setRecargar((n) => n + 1);

  return { data, cargando, error, reintentar };
}
