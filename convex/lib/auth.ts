import { getAuthUserId } from '@convex-dev/auth/server'
import type { QueryCtx, MutationCtx } from '../_generated/server'

/**
 * Get the current authenticated user from the context.
 * Returns null if no user is authenticated.
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx)
  if (!userId) return null

  const user = await ctx.db.get(userId)
  if (!user) return null

  return user
}

/**
 * Assert that the current user has the specified role.
 * Throws an error if the user is not authenticated or doesn't have the required role.
 */
export async function assertRole(
  ctx: QueryCtx | MutationCtx,
  requiredRole: 'superadmin' | 'organizer'
) {
  const user = await getCurrentUser(ctx)

  if (!user) {
    throw new Error('Authentication required')
  }

  // Superadmin has access to everything
  if (user.role === 'superadmin') {
    return user
  }

  // For organizer role, also allow users without a role set yet (new users)
  if (requiredRole === 'organizer' && (!user.role || user.role === 'organizer')) {
    return user
  }

  if (user.role !== requiredRole) {
    throw new Error(
      `Access denied. Required role: ${requiredRole}, but user has role: ${user.role || 'none'}`
    )
  }

  return user
}

/**
 * Require authentication and return the user ID.
 * Throws an error if not authenticated.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx)
  if (!userId) {
    throw new Error('Authentication required')
  }
  return userId
}

/**
 * Get the current user ID if authenticated, null otherwise.
 * Does not throw an error.
 */
export async function getOptionalUserId(ctx: QueryCtx | MutationCtx) {
  return await getAuthUserId(ctx)
}
