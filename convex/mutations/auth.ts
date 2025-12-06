import { mutation } from '../_generated/server'
import { v } from 'convex/values'

/**
 * Sync the current authenticated user from Clerk to Convex database.
 * 
 * This mutation:
 * 1. Gets the authenticated user identity from Clerk
 * 2. Checks if user exists in Convex database
 * 3. Creates user if they don't exist (with default role 'organizer')
 * 4. Updates user info if they exist but details changed
 * 
 * Frontend usage:
 * ```tsx
 * const syncUser = useMutation(api.mutations.auth.syncUser)
 * await syncUser()
 * ```
 * 
 * Call this after successful Clerk sign-in/sign-up.
 */
export const syncUser = mutation({
  args: {
    // Optional: allow specifying role during sync (defaults to 'organizer')
    role: v.optional(v.union(v.literal('superadmin'), v.literal('organizer'))),
  },
  handler: async (ctx, args) => {
    // Get authenticated identity from Clerk
    const identity = await ctx.auth.getUserIdentity()
    
    if (!identity || !identity.email) {
      throw new Error('Not authenticated')
    }

    const email = identity.email
    const name = identity.name || identity.email.split('@')[0] // Fallback to email prefix if no name
    const role = args.role || 'organizer' // Default to organizer

    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first()

    if (existingUser) {
      // User exists - update if name changed
      if (existingUser.name !== name) {
        await ctx.db.patch(existingUser._id, {
          name,
        })
      }
      return existingUser._id
    }

    // User doesn't exist - create new user
    const userId = await ctx.db.insert('users', {
      email,
      name,
      role,
      createdAt: Date.now(),
    })

    return userId
  },
})
