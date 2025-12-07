import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { Providers } from './providers.tsx'

// Service worker version - increment to force update
const SW_VERSION = '1.1.0'

// Check if we need to force clear old service worker
const checkServiceWorkerVersion = async () => {
  const storedVersion = localStorage.getItem('sw-version')
  if (storedVersion !== SW_VERSION) {
    console.log(`[PWA] Version mismatch: ${storedVersion} → ${SW_VERSION}, clearing old SW`)
    
    // Unregister all existing service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
        console.log('[PWA] Unregistered old service worker')
      }
      
      // Clear caches
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
        console.log('[PWA] Cleared all caches')
      }
    }
    
    localStorage.setItem('sw-version', SW_VERSION)
    
    // Reload to get fresh service worker
    if (storedVersion !== null) {
      window.location.reload()
      return false
    }
  }
  return true
}

// Initialize service worker after version check
const initServiceWorker = async () => {
  const shouldContinue = await checkServiceWorkerVersion()
  if (!shouldContinue) return

  // Register service worker for PWA functionality
  const updateSW = registerSW({
    immediate: true, // Register immediately
    onNeedRefresh() {
      // Auto-update the service worker without prompting
      console.log('[PWA] New version available, updating...')
      updateSW(true)
    },
    onOfflineReady() {
      console.log('[PWA] App ready to work offline')
    },
    onRegistered(registration) {
      console.log('[PWA] Service worker registered:', registration)
      
      // Check for updates every 5 minutes
      setInterval(() => {
        registration?.update()
      }, 5 * 60 * 1000)
    },
    onRegisterError(error) {
      console.error('[PWA] Service worker registration error:', error)
    },
  })

  // Expose updateSW globally for components to use
  window.__updateSW = updateSW
}

// Declare global type for updateSW
declare global {
  interface Window {
    __updateSW?: (reloadPage?: boolean) => Promise<void>
  }
}

// Initialize service worker
initServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
