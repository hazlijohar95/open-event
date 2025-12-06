import { mutation } from '../_generated/server'

/**
 * Sync user from Clerk to Convex database.
 * Called after sign-in/sign-up to ensure user exists in Convex.
 *
 * This mutation:
 * - Creates a new user if they don't exist
 * - Updates existing user info if they do exist
 * - Uses Clerk identity to get user details
 */
export const syncUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated')
    }

    const clerkId = identity.subject
    // Clerk JWTs sometimes omit `email` unless the template includes it.
    // Fall back to the first email address if available, otherwise throw a helpful error.
    const email =
      identity.email ??
      // Some Clerk payloads expose emailAddresses array
      (identity as any).emailAddresses?.[0]?.email ??
      (identity as any).primaryEmailAddress?.emailAddress
    const name = identity.name ?? email?.split('@')[0] ?? 'User'
    const imageUrl = identity.pictureUrl

    if (!email) {
      throw new Error(
        'No email found in identity. Ensure your Clerk JWT template includes the email claim (e.g. {{user.primary_email_address.email_address}}) and that the user has an email.'
      )
    }

    // Check if user already exists by Clerk ID
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
      .first()

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email,
        name,
        imageUrl,
        updatedAt: Date.now(),
      })
      return existingUser._id
    }

    // Create new user (default role: organizer)
    const userId = await ctx.db.insert('users', {
      clerkId,
      email,
      name,
      imageUrl,
      role: 'organizer',
      createdAt: Date.now(),
    })

    return userId
  },
})
