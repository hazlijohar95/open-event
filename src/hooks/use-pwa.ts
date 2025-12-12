import { useState, useEffect, useCallback, useMemo } from 'react'

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
const PROMPT_DELAY = 5000 // 5 seconds

export function usePWA() {
  // Initialize isInstalled with a function to avoid triggering lint rule
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    )
  })
  const [isInstallable, setIsInstallable] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  // Detect platform
  const platform = useMemo((): 'ios' | 'android' | 'desktop' | 'unknown' => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)

    if (isIOS) return 'ios'
    if (isAndroid) return 'android'
    if (window.matchMedia('(min-width: 768px)').matches) return 'desktop'
    return 'unknown'
  }, [])

  // Listen for display mode changes (if user installs while page is open)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Check if dismissed recently
  const wasDismissedRecently = useCallback(() => {
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10)
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return true
      }
    }
    return false
  }, [])

  // Listen for install prompt event (Android/Desktop Chrome)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)

      if (wasDismissedRecently()) return

      // Show prompt after short delay
      setTimeout(() => {
        setShowPrompt(true)
      }, PROMPT_DELAY)
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
  }, [wasDismissedRecently])

  // For iOS: Show manual install instructions after delay
  // iOS doesn't fire beforeinstallprompt, so we need to handle it separately
  useEffect(() => {
    if (platform !== 'ios') return
    if (isInstalled) return
    if (wasDismissedRecently()) return

    const timer = setTimeout(() => {
      setShowPrompt(true)
    }, PROMPT_DELAY)

    return () => clearTimeout(timer)
  }, [platform, isInstalled, wasDismissedRecently])

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
    setShowPrompt(true)
  }, [])

  // Wrapper for backward compatibility
  const getPlatform = useCallback(() => platform, [platform])

  return {
    isInstalled,
    isInstallable,
    isOnline,
    showPrompt,
    promptInstall,
    dismissPrompt,
    resetDismiss,
    getPlatform,
    platform,
  }
}
