import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'

const root = document.getElementById('root')

// Catch unhandled errors that happen before React mounts
window.addEventListener('error', (e) => {
  if (root && !root.children.length) {
    root.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                  height:100dvh;padding:32px;background:#080810;text-align:center;gap:16px;">
        <p style="font-size:40px">⚠️</p>
        <p style="color:#e2e8f0;font-weight:600;font-size:18px;font-family:sans-serif">
          Error al iniciar la app
        </p>
        <p style="color:#94a3b8;font-size:13px;max-width:280px;font-family:sans-serif">
          ${e.message || 'Error inesperado'}
        </p>
        <button onclick="window.location.reload()"
          style="margin-top:8px;padding:12px 28px;border-radius:10px;border:none;
                 background:#7C6FF7;color:white;font-weight:600;font-size:15px;cursor:pointer">
          Reintentar
        </button>
      </div>`
  }
})

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
