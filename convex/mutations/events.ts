import { mutation } from '../_generated/server'
import { assertRole } from '../lib/auth'
import { v } from 'convex/values'

/**
 * Create a new event
 * Requires organizer role
 */
export const createEvent = mutation({
  args: {
    title: v.string(),
    startDate: v.number(), // Unix timestamp
    description: v.optional(v.string()),
    eventType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Assert organizer role
    const currentUser = await assertRole(ctx, 'organizer')

    // Create event
    const eventId = await ctx.db.insert('events', {
      organizerId: currentUser._id,
      title: args.title,
      startDate: args.startDate,
      description: args.description,
      eventType: args.eventType,
      status: 'draft',
      createdAt: Date.now(),
    })

    return { id: eventId }
  },
})

/**
 * Mutation for vendors to apply to events
 * Requires admin role (admin acts on behalf of vendor)
 */
export const vendorApply = mutation({
  args: {
    eventId: v.id('events'),
    vendorId: v.id('vendors'),
  },
  handler: async (ctx, args) => {
    // Require admin authentication
    await assertRole(ctx, 'admin')

    // Verify event exists and is public
    const event = await ctx.db.get(args.eventId)
    if (!event) {
      throw new Error('Event not found')
    }
    if (!event.isPublic) {
      throw new Error('Event is not accepting vendor applications')
    }

    // Verify vendor exists and is approved
    const vendor = await ctx.db.get(args.vendorId)
    if (!vendor) {
      throw new Error('Vendor not found')
    }
    if (vendor.status !== 'approved') {
      throw new Error('Vendor must be approved before applying to events')
    }

    // Check if relationship already exists
    const existing = await ctx.db
      .query('eventVendors')
      .withIndex('by_event', (q) => q.eq('eventId', args.eventId))
      .filter((q) => q.eq(q.field('vendorId'), args.vendorId))
      .first()

    if (existing) {
      throw new Error('Vendor has already applied to this event')
    }

    // Create event-vendor relationship
    await ctx.db.insert('eventVendors', {
      eventId: args.eventId,
      vendorId: args.vendorId,
      status: 'inquiry',
      createdAt: Date.now(),
    })

    return { success: true }
  },
})
