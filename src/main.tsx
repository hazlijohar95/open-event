import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { Providers } from './providers.tsx'

// Register service worker for PWA functionality
const updateSW = registerSW({
  onNeedRefresh() {
    // Dispatch custom event for update prompt
    window.dispatchEvent(new CustomEvent('sw-update-available', { detail: { updateSW } }))
  },
  onOfflineReady() {
    console.log('[PWA] App ready to work offline')
  },
  onRegistered(registration) {
    console.log('[PWA] Service worker registered:', registration)
  },
  onRegisterError(error) {
    console.error('[PWA] Service worker registration error:', error)
  },
})

// Expose updateSW globally for components to use
declare global {
  interface Window {
    __updateSW?: (reloadPage?: boolean) => Promise<void>
  }
}
window.__updateSW = updateSW

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
