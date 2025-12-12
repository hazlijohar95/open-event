// ============================================================================
// API Response Helpers
// ============================================================================
// Standardized response format for all API endpoints
// All responses follow a consistent envelope structure

// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
}

// ----------------------------------------------------------------------------
// Response Types
// ----------------------------------------------------------------------------

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  meta?: Record<string, unknown>
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown[]
  }
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

// ----------------------------------------------------------------------------
// Success Response Helper
// ----------------------------------------------------------------------------

/**
 * Create a standardized success response
 * @param data - The response data
 * @param meta - Optional metadata (pagination, etc.)
 * @param status - HTTP status code (default: 200)
 */
export function apiSuccess<T>(
  data: T,
  meta?: Record<string, unknown>,
  status: number = 200
): Response {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

// ----------------------------------------------------------------------------
// Error Response Helper
// ----------------------------------------------------------------------------

/**
 * Create a standardized error response
 * @param code - Error code (e.g., 'VALIDATION_ERROR', 'NOT_FOUND')
 * @param message - Human-readable error message
 * @param status - HTTP status code (default: 400)
 * @param details - Optional additional error details
 */
export function apiError(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown[]
): Response {
  const body: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

// ----------------------------------------------------------------------------
// Common Error Responses
// ----------------------------------------------------------------------------

export const ApiErrors = {
  // Authentication errors
  unauthorized: (message: string = 'Invalid or missing API key') =>
    apiError('UNAUTHORIZED', message, 401),

  forbidden: (message: string = 'Insufficient permissions') =>
    apiError('FORBIDDEN', message, 403),

  // Validation errors
  badRequest: (message: string, details?: unknown[]) =>
    apiError('BAD_REQUEST', message, 400, details),

  validationError: (message: string, details?: unknown[]) =>
    apiError('VALIDATION_ERROR', message, 400, details),

  // Not found
  notFound: (resource: string = 'Resource') =>
    apiError('NOT_FOUND', `${resource} not found`, 404),

  // Rate limiting
  rateLimitExceeded: (retryAfter: number) =>
    apiError(
      'RATE_LIMIT_EXCEEDED',
      `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      429
    ),

  // Server errors
  internalError: (message: string = 'Internal server error') =>
    apiError('INTERNAL_ERROR', message, 500),

  // Method not allowed
  methodNotAllowed: (method: string) =>
    apiError('METHOD_NOT_ALLOWED', `Method ${method} not allowed`, 405),
}

// ----------------------------------------------------------------------------
// Request Parsing Helpers
// ----------------------------------------------------------------------------

/**
 * Safely parse JSON from request body
 * Returns null if parsing fails
 */
export async function parseBody<T>(request: Request): Promise<T | null> {
  try {
    const text = await request.text()
    if (!text) return null
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

/**
 * Extract pagination parameters from URL
 * @param url - The request URL
 * @returns { page, limit, offset }
 */
export function getPagination(url: URL): {
  page: number
  limit: number
  offset: number
} {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const limit = Math.min(
    100, // Max limit
    Math.max(1, parseInt(url.searchParams.get('limit') || '20'))
  )
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Create pagination metadata for response
 */
export function paginationMeta(
  total: number,
  page: number,
  limit: number
): Record<string, unknown> {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  }
}

/**
 * Extract path parameter from URL
 * e.g., extractPathParam('/api/v1/events/abc123', '/api/v1/events/:id') => 'abc123'
 */
export function extractPathParam(
  pathname: string,
  pattern: string,
  paramName: string
): string | null {
  const patternParts = pattern.split('/')
  const pathParts = pathname.split('/')

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i] === `:${paramName}`) {
      return pathParts[i] || null
    }
  }
  return null
}

/**
 * Get the last path segment (useful for getting IDs from paths like /api/v1/events/:id)
 */
export function getLastPathSegment(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean)
  return parts[parts.length - 1] || null
}

// ----------------------------------------------------------------------------
// CORS Preflight Handler
// ----------------------------------------------------------------------------

/**
 * Handle OPTIONS preflight request for CORS
 */
export function handleCors(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
}

// ----------------------------------------------------------------------------
// Rate Limit Headers
// ----------------------------------------------------------------------------

/**
 * Add rate limit headers to response
 */
export function withRateLimitHeaders(
  response: Response,
  limit: number,
  remaining: number,
  resetAt: number
): Response {
  const headers = new Headers(response.headers)
  headers.set('X-RateLimit-Limit', limit.toString())
  headers.set('X-RateLimit-Remaining', remaining.toString())
  headers.set('X-RateLimit-Reset', resetAt.toString())

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

