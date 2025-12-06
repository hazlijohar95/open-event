import { mutation } from '../_generated/server'
import { assertRole } from '../auth'
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

