import { query } from '../_generated/server'
import { getAuthUserId } from '@convex-dev/auth/server'
import { getCurrentUser as getCurrentUserFromLib } from '../lib/auth'

/**
 * Get the current authenticated user.
 * Returns null if not authenticated or user doesn't exist in database.
 *
 * Frontend usage:
 * ```tsx
 * const currentUser = useQuery(api.queries.auth.getCurrentUser)
 * ```
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // #region agent log
    console.log('[DEBUG-AUTH] getCurrentUser query called:', JSON.stringify({
      location: 'convex/queries/auth.ts:16',
      message: 'getCurrentUser query entry',
      data: {
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'client-query',
      hypothesisId: 'Q1',
    }))
    // #endregion
    
    const result = await getCurrentUserFromLib(ctx)
    
    // #region agent log
    console.log('[DEBUG-AUTH] getCurrentUser query result:', JSON.stringify({
      location: 'convex/queries/auth.ts:25',
      message: 'getCurrentUser query result',
      data: {
        hasUser: !!result,
        userId: result?._id?.toString() ?? 'null',
        userRole: result?.role ?? 'null',
        userStatus: result?.status ?? 'null',
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'client-query',
      hypothesisId: 'Q2',
    }))
    // #endregion
    
    return result
  },
})

/**
 * Check if the current user is authenticated.
 * Returns true if authenticated, false otherwise.
 *
 * Frontend usage:
 * ```tsx
 * const isAuthenticated = useQuery(api.queries.auth.isAuthenticated)
 * ```
 */
export const isAuthenticated = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    return userId !== null
  },
})

/**
 * Get the current user's role.
 * Returns the role if authenticated, null otherwise.
 *
 * Frontend usage:
 * ```tsx
 * const userRole = useQuery(api.queries.auth.getUserRole)
 * ```
 */
export const getUserRole = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserFromLib(ctx)
    return user?.role ?? null
  },
})
