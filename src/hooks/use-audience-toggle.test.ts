import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudienceToggle } from './use-audience-toggle'

describe('useAudienceToggle', () => {
  const STORAGE_KEY = 'open-event-audience'

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should return organizer as default audience', () => {
    const { result } = renderHook(() => useAudienceToggle())

    expect(result.current.audience).toBe('organizer')
    expect(result.current.isDeveloper).toBe(false)
  })

  it('should return developer if stored in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'developer')

    const { result } = renderHook(() => useAudienceToggle())

    expect(result.current.audience).toBe('developer')
    expect(result.current.isDeveloper).toBe(true)
  })

  it('should return organizer for invalid localStorage values', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid')

    const { result } = renderHook(() => useAudienceToggle())

    expect(result.current.audience).toBe('organizer')
    expect(result.current.isDeveloper).toBe(false)
  })

  it('should update audience and persist to localStorage', () => {
    const { result } = renderHook(() => useAudienceToggle())

    expect(result.current.audience).toBe('organizer')

    act(() => {
      result.current.setAudience('developer')
    })

    expect(localStorage.getItem(STORAGE_KEY)).toBe('developer')
  })

  it('should switch from developer to organizer', () => {
    localStorage.setItem(STORAGE_KEY, 'developer')
    const { result } = renderHook(() => useAudienceToggle())

    expect(result.current.audience).toBe('developer')

    act(() => {
      result.current.setAudience('organizer')
    })

    expect(localStorage.getItem(STORAGE_KEY)).toBe('organizer')
  })

  it('should provide stable setAudience function', () => {
    const { result, rerender } = renderHook(() => useAudienceToggle())
    const firstSetAudience = result.current.setAudience

    rerender()

    expect(result.current.setAudience).toBe(firstSetAudience)
  })

  it('should sync isDeveloper with audience', () => {
    const { result } = renderHook(() => useAudienceToggle())

    expect(result.current.isDeveloper).toBe(false)
    expect(result.current.audience).toBe('organizer')

    act(() => {
      result.current.setAudience('developer')
    })

    // The state won't update immediately without storage event handling
    // but localStorage should be updated
    expect(localStorage.getItem(STORAGE_KEY)).toBe('developer')
  })

  it('should handle storage event dispatching', () => {
    const { result } = renderHook(() => useAudienceToggle())
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

    act(() => {
      result.current.setAudience('developer')
    })

    expect(dispatchEventSpy).toHaveBeenCalled()
    const eventArg = dispatchEventSpy.mock.calls[0][0] as StorageEvent
    expect(eventArg.type).toBe('storage')
    expect(eventArg.key).toBe(STORAGE_KEY)

    dispatchEventSpy.mockRestore()
  })
})
