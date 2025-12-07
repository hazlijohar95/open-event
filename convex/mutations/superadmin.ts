import { mutation } from '../_generated/server'
import { assertRole } from '../lib/auth'
import { v } from 'convex/values'

/**
 * Approve a vendor application
 * Requires superadmin role
 */
export const approveVendor = mutation({
  args: {
    vendorId: v.id('vendors'),
  },
  handler: async (ctx, args) => {
    // Assert superadmin role
    await assertRole(ctx, 'superadmin')

    // Get vendor
    const vendor = await ctx.db.get(args.vendorId)
    if (!vendor) {
      throw new Error('Vendor not found')
    }

    // Update vendor status to approved
    await ctx.db.patch(args.vendorId, {
      status: 'approved',
    })

    return { success: true }
  },
})

/**
 * One-time setup: Promote a user to superadmin by email
 * This should be run once during initial setup via Convex dashboard
 *
 * SECURITY: Set SUPERADMIN_SETUP_KEY in Convex environment variables
 *
 * Usage in Convex Dashboard > Functions:
 * 1. Go to mutations/superadmin:promoteToSuperadmin
 * 2. Enter: { "email": "your@email.com", "secretKey": "<your-env-secret>" }
 * 3. Run the function
 */
export const promoteToSuperadmin = mutation({
  args: {
    email: v.string(),
    secretKey: v.string(),
  },
  handler: async (ctx, args) => {
    // Get secret from environment variable for security
    const expectedSecret = process.env.SUPERADMIN_SETUP_KEY

    if (!expectedSecret) {
      throw new Error('SUPERADMIN_SETUP_KEY not configured in environment')
    }

    if (args.secretKey !== expectedSecret) {
      throw new Error('Invalid secret key')
    }

    // Find ALL user records with this email (there might be duplicates from auth)
    const users = await ctx.db
      .query('users')
      .withIndex('email', (q) => q.eq('email', args.email))
      .collect()

    if (users.length === 0) {
      throw new Error('User not found with that email. Make sure you have signed up first.')
    }

    // Update ALL matching records to superadmin
    let updatedCount = 0
    for (const user of users) {
      if (user.role !== 'superadmin') {
        await ctx.db.patch(user._id, {
          role: 'superadmin',
          status: 'active',
          updatedAt: Date.now(),
        })
        updatedCount++
      }
    }

    return {
      success: true,
      message: `Updated ${updatedCount} user record(s) for ${args.email} to superadmin`,
      totalRecords: users.length,
    }
  },
})

/**
 * Fix duplicate user records by syncing role from one record to all records with same email
 * SECURITY: Set SUPERADMIN_SETUP_KEY in Convex environment variables
 */
export const syncUserRoleByEmail = mutation({
  args: {
    email: v.string(),
    secretKey: v.string(),
  },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.SUPERADMIN_SETUP_KEY

    if (!expectedSecret) {
      throw new Error('SUPERADMIN_SETUP_KEY not configured in environment')
    }

    if (args.secretKey !== expectedSecret) {
      throw new Error('Invalid secret key')
    }

    // Find all users with this email
    const users = await ctx.db
      .query('users')
      .withIndex('email', (q) => q.eq('email', args.email))
      .collect()

    // Find the one with a role set
    const userWithRole = users.find((u) => u.role)

    if (!userWithRole) {
      return { success: false, message: 'No user with role found' }
    }

    // Sync role to all other records
    let synced = 0
    for (const user of users) {
      if (user._id !== userWithRole._id) {
        await ctx.db.patch(user._id, {
          role: userWithRole.role,
          status: userWithRole.status || 'active',
          updatedAt: Date.now(),
        })
        synced++
      }
    }

    return {
      success: true,
      message: `Synced role "${userWithRole.role}" to ${synced} other record(s)`,
      sourceId: userWithRole._id,
      totalRecords: users.length,
    }
  },
})

