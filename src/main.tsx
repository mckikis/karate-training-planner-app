import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Ask the phone to keep our data (exercises, photos, trainings) and not delete it when storage is low.
if (navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {})
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
