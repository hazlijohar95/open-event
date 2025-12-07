import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

const DISMISS_KEY = 'pwa-install-dismissed'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  // Check if running as installed PWA
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    setIsInstalled(isStandalone)
  }, [])

  // Listen for install prompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)

      // Check if user has dismissed recently
      const dismissedAt = localStorage.getItem(DISMISS_KEY)
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt, 10)
        if (Date.now() - dismissedTime < DISMISS_DURATION) {
          return // Don't show prompt if dismissed within 7 days
        }
      }

      // Show prompt after 30 seconds for new users
      setTimeout(() => {
        setShowPrompt(true)
      }, 30000)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      setShowPrompt(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setIsInstalled(true)
        setShowPrompt(false)
      }

      setDeferredPrompt(null)
      return outcome === 'accepted'
    } catch {
      return false
    }
  }, [deferredPrompt])

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
  }, [])

  const resetDismiss = useCallback(() => {
    localStorage.removeItem(DISMISS_KEY)
    if (isInstallable) {
      setShowPrompt(true)
    }
  }, [isInstallable])

  // Detect platform for platform-specific instructions
  const getPlatform = useCallback((): 'ios' | 'android' | 'desktop' | 'unknown' => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)

    if (isIOS) return 'ios'
    if (isAndroid) return 'android'
    if (window.matchMedia('(min-width: 768px)').matches) return 'desktop'
    return 'unknown'
  }, [])

  return {
    isInstalled,
    isInstallable,
    isOnline,
    showPrompt,
    promptInstall,
    dismissPrompt,
    resetDismiss,
    getPlatform,
  }
}
