import { getAuthUserId } from '@convex-dev/auth/server'
import type { QueryCtx, MutationCtx } from '../_generated/server'

// Role hierarchy: superadmin (3) > admin (2) > organizer (1)
export const ROLE_HIERARCHY: Record<string, number> = {
  superadmin: 3,
  admin: 2,
  organizer: 1,
} as const

export type UserRole = 'superadmin' | 'admin' | 'organizer'
export type UserStatus = 'active' | 'suspended' | 'pending'

/**
 * Check if a user has admin privileges (admin or superadmin)
 */
export function isAdminRole(role: string | undefined): boolean {
  return role === 'admin' || role === 'superadmin'
}

/**
 * Get the current authenticated user from the context.
 * Returns null if no user is authenticated.
 *
 * Note: Convex Auth stores users in the users table with the auth ID as the document ID.
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx)
  if (!userId) return null

  const user = await ctx.db.get(userId)
  if (!user) return null

  return user
}

/**
 * Assert that the current user has the specified role or higher.
 * Uses role hierarchy: superadmin > admin > organizer
 * Throws an error if:
 * - User is not authenticated
 * - User's account is suspended
 * - User doesn't have sufficient role level
 */
export async function assertRole(
  ctx: QueryCtx | MutationCtx,
  requiredRole: UserRole
) {
  const user = await getCurrentUser(ctx)

  if (!user) {
    throw new Error('Authentication required')
  }

  // Check if user is suspended
  if (user.status === 'suspended') {
    throw new Error('Account suspended. Please contact support.')
  }

  // Get role levels (default to organizer level for new users)
  const userRoleLevel = ROLE_HIERARCHY[user.role || 'organizer'] || 1
  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 1

  // Check if user has sufficient role level
  if (userRoleLevel >= requiredRoleLevel) {
    return user
  }

  throw new Error(
    `Access denied. Required role: ${requiredRole}, but user has role: ${user.role || 'organizer'}`
  )
}

/**
 * Assert that the current user is exactly the specified role (not higher).
 * Use this when you want to restrict access to only a specific role.
 */
export async function assertExactRole(
  ctx: QueryCtx | MutationCtx,
  exactRole: UserRole
) {
  const user = await getCurrentUser(ctx)

  if (!user) {
    throw new Error('Authentication required')
  }

  if (user.status === 'suspended') {
    throw new Error('Account suspended. Please contact support.')
  }

  const userRole = user.role || 'organizer'
  if (userRole !== exactRole) {
    throw new Error(
      `Access denied. Required exact role: ${exactRole}, but user has role: ${userRole}`
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
