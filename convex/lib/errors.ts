/**
 * Standardized Error Handling Utilities
 *
 * This module provides consistent error types and formatting
 * for the entire Convex backend.
 */

/**
 * Application Error class for consistent error handling.
 *
 * Usage:
 * ```typescript
 * throw new AppError('User not found', 'USER_NOT_FOUND', 404)
 * ```
 */
export class AppError extends Error {
  public readonly code: string
  public readonly status: number

  constructor(message: string, code: string, status: number = 400) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
  }
}

/**
 * Common error codes used throughout the application
 */
export const ErrorCodes = {
  // Authentication errors (4xx)
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Resource errors (4xx)
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Validation errors (4xx)
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Rate limiting (429)
  RATE_LIMITED: 'RATE_LIMITED',

  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * Format an error for HTTP response.
 *
 * Usage:
 * ```typescript
 * try {
 *   // ... operation
 * } catch (error) {
 *   const formatted = formatErrorResponse(error)
 *   return new Response(JSON.stringify(formatted), {
 *     status: formatted.status
 *   })
 * }
 * ```
 */
export function formatErrorResponse(error: unknown): {
  error: string
  code: string
  status: number
  details?: unknown
} {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      status: error.status,
    }
  }

  if (error instanceof Error) {
    // Check for specific error types from Convex
    if (error.message.includes('Authentication required')) {
      return {
        error: error.message,
        code: ErrorCodes.UNAUTHORIZED,
        status: 401,
      }
    }

    if (error.message.includes('Access denied')) {
      return {
        error: error.message,
        code: ErrorCodes.FORBIDDEN,
        status: 403,
      }
    }

    if (error.message.includes('not found')) {
      return {
        error: error.message,
        code: ErrorCodes.NOT_FOUND,
        status: 404,
      }
    }

    // Default error
    return {
      error: error.message,
      code: ErrorCodes.INTERNAL_ERROR,
      status: 500,
    }
  }

  // Unknown error type
  return {
    error: 'An unexpected error occurred',
    code: ErrorCodes.INTERNAL_ERROR,
    status: 500,
  }
}

/**
 * Create an authentication error
 */
export function authError(message = 'Authentication required'): AppError {
  return new AppError(message, ErrorCodes.UNAUTHORIZED, 401)
}

/**
 * Create a forbidden error
 */
export function forbiddenError(message = 'Access denied'): AppError {
  return new AppError(message, ErrorCodes.FORBIDDEN, 403)
}

/**
 * Create a not found error
 */
export function notFoundError(resource: string): AppError {
  return new AppError(`${resource} not found`, ErrorCodes.NOT_FOUND, 404)
}

/**
 * Create a validation error
 */
export function validationError(message: string, details?: unknown): AppError {
  const error = new AppError(message, ErrorCodes.INVALID_INPUT, 400)
  if (details) {
    // Attach details for more context
    ;(error as AppError & { details?: unknown }).details = details
  }
  return error
}

/**
 * Create a rate limit error
 */
export function rateLimitError(message = 'Rate limit exceeded'): AppError {
  return new AppError(message, ErrorCodes.RATE_LIMITED, 429)
}

/**
 * Check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
