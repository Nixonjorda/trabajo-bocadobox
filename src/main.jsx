import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Al entrar a la raíz se redirige al recurso principal (productos) */}
        <Route path="/" element={<Navigate to="/productos" replace />} />

        {/* Cada recurso del sistema queda mapeado a su propia ruta.
            App detecta el :recurso de la URL y pinta la vista + los datos
            correspondientes traídos del mock de Postman. */}
        <Route path="/:recurso" element={<App />} />

        {/* Cualquier ruta desconocida regresa al catálogo de productos */}
        <Route path="*" element={<Navigate to="/productos" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
