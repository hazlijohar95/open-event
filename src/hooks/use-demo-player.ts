import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseDemoPlayerOptions {
  sceneDuration?: number // Duration per scene in ms
  sceneCount?: number
  autoPlay?: boolean
  loop?: boolean
}

export interface UseDemoPlayerReturn {
  currentScene: number
  sceneProgress: number // 0-1 within current scene
  totalProgress: number // 0-1 overall
  isPlaying: boolean
  play: () => void
  pause: () => void
  reset: () => void
  goToScene: (scene: number) => void
}

export function useDemoPlayer(options: UseDemoPlayerOptions = {}): UseDemoPlayerReturn {
  const {
    sceneDuration = 7000,
    sceneCount = 5,
    autoPlay = true,
    loop = true,
  } = options

  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [elapsed, setElapsed] = useState(0)
  const lastTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const totalDuration = sceneDuration * sceneCount

  // Calculate derived values
  const totalProgress = elapsed / totalDuration
  const currentScene = Math.min(Math.floor(elapsed / sceneDuration), sceneCount - 1)
  const sceneProgress = (elapsed % sceneDuration) / sceneDuration

  // Animation loop using requestAnimationFrame
  const tick = useCallback((timestamp: number) => {
    if (lastTimeRef.current === null) {
      lastTimeRef.current = timestamp
    }

    const delta = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp

    setElapsed((prev) => {
      const next = prev + delta
      if (next >= totalDuration) {
        if (loop) {
          return next % totalDuration
        } else {
          setIsPlaying(false)
          return totalDuration
        }
      }
      return next
    })

    rafRef.current = requestAnimationFrame(tick)
  }, [totalDuration, loop])

  // Start/stop animation loop
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = null
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isPlaying, tick])

  // Pause when tab loses focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        setIsPlaying(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isPlaying])

  // Respect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      setIsPlaying(false)
    }
  }, [])

  const play = useCallback(() => setIsPlaying(true), [])
  const pause = useCallback(() => setIsPlaying(false), [])
  const reset = useCallback(() => {
    setElapsed(0)
    lastTimeRef.current = null
  }, [])
  const goToScene = useCallback((scene: number) => {
    const clampedScene = Math.max(0, Math.min(scene, sceneCount - 1))
    setElapsed(clampedScene * sceneDuration)
    lastTimeRef.current = null
  }, [sceneDuration, sceneCount])

  return {
    currentScene,
    sceneProgress,
    totalProgress,
    isPlaying,
    play,
    pause,
    reset,
    goToScene,
  }
}
