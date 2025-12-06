import { query } from '../_generated/server'
import { getCurrentUser as getCurrentUserFromAuth } from '../auth'

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
    return await getCurrentUserFromAuth(ctx)
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
    const identity = await ctx.auth.getUserIdentity()
    return identity !== null
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
    const user = await getCurrentUserFromAuth(ctx)
    return user?.role ?? null
  },
})
