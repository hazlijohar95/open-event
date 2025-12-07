/**
 * Centralized error handling utilities
 * 
 * Provides consistent error handling patterns across the application.
 * Use these utilities instead of inline try-catch with toast notifications.
 */

import { toast } from 'sonner'

/**
 * Standard error messages for common scenarios
 */
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment.',
} as const

/**
 * Extract a user-friendly message from an error
 */
export function getErrorMessage(error: unknown, fallback = ERROR_MESSAGES.GENERIC): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return fallback
}

/**
 * Handle an error with a toast notification
 * 
 * @example
 * ```ts
 * try {
 *   await someAction()
 * } catch (error) {
 *   handleError(error, 'Failed to save changes')
 * }
 * ```
 */
export function handleError(error: unknown, context?: string): void {
  const message = getErrorMessage(error)
  const displayMessage = context ? `${context}: ${message}` : message
  
  console.error('[Error]', context || 'Unknown context', error)
  toast.error(displayMessage)
}

/**
 * Wrapper for async operations with automatic error handling
 * 
 * @example
 * ```ts
 * const result = await withErrorHandling(
 *   () => api.createEvent(data),
 *   'Failed to create event'
 * )
 * if (result.success) {
 *   // handle success
 * }
 * ```
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorContext: string
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await operation()
    return { success: true, data }
  } catch (error) {
    const message = getErrorMessage(error)
    handleError(error, errorContext)
    return { success: false, error: message }
  }
}

/**
 * Wrapper for async operations with success toast
 * 
 * @example
 * ```ts
 * await withToast(
 *   () => api.deleteEvent(id),
 *   { success: 'Event deleted', error: 'Failed to delete event' }
 * )
 * ```
 */
export async function withToast<T>(
  operation: () => Promise<T>,
  messages: { success: string; error: string }
): Promise<T | null> {
  try {
    const result = await operation()
    toast.success(messages.success)
    return result
  } catch (error) {
    handleError(error, messages.error)
    return null
  }
}

