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
    return await getCurrentUserFromLib(ctx)
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
