import { QueryCtx, MutationCtx } from './_generated/server'
import { Id } from './_generated/dataModel'

/**
 * Get the current authenticated user from the context.
 * Returns null if no user is authenticated.
 * 
 * Note: This requires Convex auth to be configured.
 * See: https://docs.convex.dev/auth
 */
export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<{ _id: Id<'users'>; email: string; name: string; role: 'superadmin' | 'organizer' } | null> {
  // Get the authenticated user identity from Convex auth
  const identity = await ctx.auth.getUserIdentity()
  
  if (!identity || !identity.email) {
    return null
  }
  
  // Extract email after null check (TypeScript now knows it's defined)
  const email = identity.email
  
  // Look up the user in the database by email
  const user = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', email))
    .first()
  
  // Return null if user doesn't exist in database
  // (This allows for public access when no user is found)
  if (!user || (user.role !== 'superadmin' && user.role !== 'organizer')) {
    return null
  }
  
  return user
}

/**
 * Assert that the current user has the specified role.
 * Throws an error if the user is not authenticated or doesn't have the required role.
 */
export async function assertRole(
  ctx: QueryCtx | MutationCtx,
  requiredRole: 'superadmin' | 'organizer'
): Promise<{ _id: Id<'users'>; email: string; name: string; role: 'superadmin' | 'organizer' }> {
  const user = await getCurrentUser(ctx)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  if (user.role !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}, but user has role: ${user.role}`)
  }
  
  return user
}

