import { useState, useEffect } from 'react'

export type Audience = 'developer' | 'organizer'

const STORAGE_KEY = 'open-event-audience'

export function useAudienceToggle() {
  const [audience, setAudienceState] = useState<Audience>('developer')
  const [isHydrated, setIsHydrated] = useState(false)

  // Read from localStorage on mount (client-side only)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'organizer') {
      setAudienceState('organizer')
    }
    setIsHydrated(true)
  }, [])

  const setAudience = (value: Audience) => {
    setAudienceState(value)
    localStorage.setItem(STORAGE_KEY, value)
  }

  return {
    audience,
    setAudience,
    isDeveloper: audience === 'developer',
    isHydrated,
  }
}
