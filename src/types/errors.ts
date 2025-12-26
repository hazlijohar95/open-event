/**
 * Error handling utilities for type-safe error management
 */

/**
 * Extended error interface for application errors
 */
export interface AppError extends Error {
  code?: string
  status?: number
  details?: unknown
}

/**
 * Type guard to check if an unknown value is an Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error
}

/**
 * Type guard to check if an unknown value is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && ('code' in error || 'status' in error)
}

/**
 * Safely extract error message from an unknown error type
 * This is the primary function for handling catch blocks
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return 'An unexpected error occurred'
}

/**
 * Create an AppError from an unknown error
 */
export function toAppError(error: unknown, defaultMessage = 'An error occurred'): AppError {
  if (error instanceof Error) {
    return error as AppError
  }
  const appError = new Error(getErrorMessage(error) || defaultMessage) as AppError
  return appError
}

/**
 * Auth-specific error messages
 */
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'An account with this email already exists',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  ACCOUNT_SUSPENDED: 'Your account has been suspended',
  EMAIL_NOT_VERIFIED: 'Please verify your email address',
  RATE_LIMITED: 'Too many attempts. Please try again later.',
} as const

export type AuthErrorCode = keyof typeof AUTH_ERRORS

/**
 * Error display info for UI
 */
export interface ErrorDisplay {
  title: string
  message: string
  action?: string
  variant: 'generic' | 'network' | 'permission' | 'notFound'
}

/**
 * Map error codes to user-friendly display info
 */
const ERROR_DISPLAY_MAP: Record<string, ErrorDisplay> = {
  // Auth errors
  INVALID_CREDENTIALS: {
    title: 'Sign In Failed',
    message: 'Invalid email or password. Please try again.',
    action: 'Try again',
    variant: 'generic',
  },
  EMAIL_NOT_VERIFIED: {
    title: 'Email Not Verified',
    message: 'Please check your email and click the verification link.',
    action: 'Resend verification email',
    variant: 'generic',
  },
  SESSION_EXPIRED: {
    title: 'Session Expired',
    message: 'Your session has expired. Please sign in again.',
    action: 'Sign in',
    variant: 'permission',
  },
  UNAUTHORIZED: {
    title: 'Access Denied',
    message: 'You need to sign in to access this page.',
    action: 'Sign in',
    variant: 'permission',
  },
  FORBIDDEN: {
    title: 'Access Denied',
    message: "You don't have permission to perform this action.",
    variant: 'permission',
  },
  // Resource errors
  NOT_FOUND: {
    title: 'Not Found',
    message: "The requested item couldn't be found.",
    variant: 'notFound',
  },
  ALREADY_EXISTS: {
    title: 'Already Exists',
    message: 'This item already exists.',
    variant: 'generic',
  },
  // Network errors
  NETWORK_ERROR: {
    title: 'Connection Problem',
    message: 'Unable to connect to the server. Please check your internet connection.',
    action: 'Retry',
    variant: 'network',
  },
  RATE_LIMITED: {
    title: 'Too Many Requests',
    message: 'Please wait a moment before trying again.',
    variant: 'generic',
  },
}

const DEFAULT_ERROR_DISPLAY: ErrorDisplay = {
  title: 'Something Went Wrong',
  message: 'An unexpected error occurred. Please try again.',
  action: 'Try again',
  variant: 'generic',
}

/**
 * Extract error code from error object
 */
function extractErrorCode(error: unknown): string | null {
  if (error && typeof error === 'object') {
    if ('code' in error && typeof (error as { code: unknown }).code === 'string') {
      return (error as { code: string }).code
    }
    if (error instanceof Error) {
      // Try to parse code from message like "[ERROR_CODE] message"
      const match = error.message.match(/^\[([A-Z_]+)\]/)
      if (match) return match[1]
    }
  }
  return null
}

/**
 * Detect error type from error message for network/permission errors
 */
function detectErrorType(error: unknown): ErrorDisplay['variant'] {
  const message = getErrorMessage(error).toLowerCase()

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('offline') ||
    message.includes('timeout')
  ) {
    return 'network'
  }

  if (
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('permission') ||
    message.includes('access denied')
  ) {
    return 'permission'
  }

  if (message.includes('not found') || message.includes('404')) {
    return 'notFound'
  }

  return 'generic'
}

/**
 * Get user-friendly error display info from an error
 *
 * @example
 * ```tsx
 * try {
 *   await signIn(email, password)
 * } catch (error) {
 *   const display = getErrorDisplay(error)
 *   toast.error(display.title, { description: display.message })
 * }
 * ```
 */
export function getErrorDisplay(error: unknown): ErrorDisplay {
  // Try to get display from error code
  const code = extractErrorCode(error)
  if (code && ERROR_DISPLAY_MAP[code]) {
    return ERROR_DISPLAY_MAP[code]
  }

  // Detect error type from message
  const variant = detectErrorType(error)

  // Use variant-specific default
  if (variant === 'network') {
    return ERROR_DISPLAY_MAP['NETWORK_ERROR']
  }
  if (variant === 'permission') {
    return {
      ...DEFAULT_ERROR_DISPLAY,
      title: 'Access Denied',
      message: getErrorMessage(error),
      variant: 'permission',
    }
  }
  if (variant === 'notFound') {
    return {
      ...DEFAULT_ERROR_DISPLAY,
      title: 'Not Found',
      message: getErrorMessage(error),
      variant: 'notFound',
    }
  }

  // Return generic with actual error message
  return {
    ...DEFAULT_ERROR_DISPLAY,
    message: getErrorMessage(error),
  }
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return detectErrorType(error) === 'network'
}
