// Fonts load from Google Fonts in index.html: Cormorant Garamond (display, 300/400 only),
// Inter (UI and body), Courier Prime (apothecary-style receipts and codes).
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
