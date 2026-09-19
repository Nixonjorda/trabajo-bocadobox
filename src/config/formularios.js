// ============================================================================
//  Configuración declarativa de los formularios de creación / actualización.
//  Cada campo: { name, label, tipo, requerido?, placeholder?, opciones?, full? }
//  tipo: 'text' | 'number' | 'textarea' | 'select' | 'color'
// ============================================================================

export const LABEL_RECURSO = {
  producto: 'Producto',
  categoria: 'Categoría',
  cliente: 'Comensal',
  orden: 'Orden',
  usuario: 'Colaborador',
  estado_orden: 'Estado',
};

const opt = (arr, mapFn) => (Array.isArray(arr) ? arr.map(mapFn) : []);

export function getCampos(recurso, opciones = {}) {
  switch (recurso) {
    case 'producto':
      return [
        { name: 'nombre', label: 'Nombre del bowl', tipo: 'text', requerido: true },
        { name: 'categoria', label: 'Categoría', tipo: 'select', requerido: true,
          opciones: opt(opciones.categorias, (c) => ({ value: c.nombre, label: c.nombre })) },
        { name: 'descripcion', label: 'Descripción', tipo: 'textarea', requerido: true, full: true },
        { name: 'precio', label: 'Precio (COP)', tipo: 'number', requerido: true },
        { name: 'stock', label: 'Stock', tipo: 'number' },
        { name: 'calorias', label: 'Calorías (kcal)', tipo: 'number' },
        { name: 'imagen', label: 'URL de imagen', tipo: 'text', full: true, placeholder: 'https://...' },
        { name: 'etiqueta', label: 'Etiqueta', tipo: 'text', placeholder: '⭐ Favorito Bocado' },
        { name: 'estado', label: 'Disponibilidad', tipo: 'select',
          opciones: [{ value: 'true', label: 'Disponible' }, { value: 'false', label: 'Agotado' }] },
      ];
    case 'categoria':
      return [
        { name: 'nombre', label: 'Nombre', tipo: 'text', requerido: true },
        { name: 'icono', label: 'Ícono (emoji)', tipo: 'text', placeholder: '🥗' },
        { name: 'descripcion', label: 'Descripción', tipo: 'textarea', requerido: true, full: true },
        { name: 'totalProductos', label: 'Total de platillos', tipo: 'number' },
        { name: 'estado', label: 'Estado', tipo: 'select',
          opciones: [{ value: 'true', label: 'Activa' }, { value: 'false', label: 'Inactiva' }] },
      ];
    case 'cliente':
      return [
        { name: 'nombre', label: 'Nombre', tipo: 'text', requerido: true },
        { name: 'apellido', label: 'Apellido', tipo: 'text' },
        { name: 'email', label: 'Correo electrónico', tipo: 'text', requerido: true, placeholder: 'correo@dominio.com' },
        { name: 'telefono', label: 'Teléfono', tipo: 'text', placeholder: '+57 ...' },
        { name: 'direccion', label: 'Dirección', tipo: 'text', full: true },
        { name: 'tipo', label: 'Membresía', tipo: 'select',
          opciones: [
            { value: 'Nuevo Comensal', label: 'Nuevo Comensal' },
            { value: 'Recurrente', label: 'Recurrente' },
            { value: 'Cliente VIP Clean', label: 'Cliente VIP Clean' },
          ] },
        { name: 'totalOrdenes', label: 'Total de órdenes', tipo: 'number' },
      ];
    case 'orden':
      return [
        { name: 'numero', label: 'N.º de orden', tipo: 'text', requerido: true, placeholder: 'ORD-1010' },
        { name: 'cliente', label: 'Cliente', tipo: 'select', requerido: true,
          opciones: opt(opciones.clientes, (c) => {
            const nombre = `${c.nombre || ''} ${c.apellido || ''}`.trim();
            return { value: nombre, label: nombre };
          }) },
        { name: 'estadoId', label: 'Estado', tipo: 'select', requerido: true,
          opciones: opt(opciones.estados, (e) => ({ value: e.codigo, label: `${e.icono || ''} ${e.nombre}`.trim() })) },
        { name: 'ubicacion', label: 'Ubicación / Entrega', tipo: 'text', requerido: true, placeholder: 'Mesa #04 / Domicilio ...' },
        { name: 'productos', label: 'Productos (resumen)', tipo: 'textarea', requerido: true, full: true, placeholder: '2x Salmon Poke Bowl, 1x Green Detox' },
        { name: 'cantidadItems', label: 'Cantidad de ítems', tipo: 'number' },
        { name: 'total', label: 'Total (COP)', tipo: 'number', requerido: true },
      ];
    case 'usuario':
      return [
        { name: 'nombre', label: 'Nombre completo', tipo: 'text', requerido: true },
        { name: 'rol', label: 'Rol / Cargo', tipo: 'text', requerido: true },
        { name: 'usuario', label: 'Usuario (@)', tipo: 'text', requerido: true },
        { name: 'email', label: 'Correo', tipo: 'text', placeholder: 'correo@bocadobox.co' },
        { name: 'estado', label: 'Estado', tipo: 'select',
          opciones: [
            { value: 'Activo', label: 'Activo' },
            { value: 'Inactivo', label: 'Inactivo' },
            { value: 'En ruta', label: 'En ruta' },
          ] },
        { name: 'icono', label: 'Ícono (emoji)', tipo: 'text', placeholder: '👩‍⚕️' },
      ];
    case 'estado_orden':
      return [
        { name: 'codigo', label: 'Código', tipo: 'text', requerido: true, placeholder: 'EST-07' },
        { name: 'nombre', label: 'Nombre', tipo: 'text', requerido: true },
        { name: 'descripcion', label: 'Descripción', tipo: 'textarea', requerido: true, full: true },
        { name: 'icono', label: 'Ícono (emoji)', tipo: 'text', placeholder: '🔪' },
        { name: 'color', label: 'Color', tipo: 'color' },
        { name: 'secuencia', label: 'Secuencia (paso)', tipo: 'number' },
        { name: 'estado', label: 'Estado', tipo: 'select',
          opciones: [{ value: 'true', label: 'Operativo' }, { value: 'false', label: 'Inactivo' }] },
      ];
    default:
      return [];
  }
}

export function getTitulo(recurso, modo) {
  const accion = modo === 'crear' ? 'Registrar' : 'Actualizar';
  return `${accion} ${LABEL_RECURSO[recurso] || 'registro'}`;
}
