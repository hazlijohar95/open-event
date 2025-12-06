import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getCurrentUser } from './lib/auth'

// List all events - public for marketplace, but only returns basic info
export const list = query({
  args: {},
  handler: async (ctx) => {
    // Return only active/planning events for public listing
    const events = await ctx.db.query('events').collect()
    return events.filter((e) => e.status === 'active' || e.status === 'planning')
  },
})

// Get events for the current organizer with optional status filter
export const getMyEvents = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) return []

    const eventsQuery = ctx.db
      .query('events')
      .withIndex('by_organizer', (q) => q.eq('organizerId', user._id))

    const events = await eventsQuery.order('desc').collect()

    // Filter by status if provided
    if (args.status && args.status !== 'all') {
      return events.filter((e) => e.status === args.status)
    }

    return events
  },
})

// Get event by ID - public for active events, owner/superadmin for drafts
export const get = query({
  args: { id: v.id('events') },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id)
    if (!event) return null

    // Public events (active/planning) can be viewed by anyone
    if (event.status === 'active' || event.status === 'planning') {
      return event
    }

    // Draft/cancelled events require ownership or superadmin
    const user = await getCurrentUser(ctx)
    if (!user) {
      throw new Error('Authentication required to view this event')
    }

    if (user.role !== 'superadmin' && event.organizerId !== user._id) {
      throw new Error('Access denied')
    }

    return event
  },
})

// Create event - organizers only, creates for themselves
export const create = mutation({
  args: {
    title: v.string(),
    startDate: v.number(), // Unix timestamp
    description: v.optional(v.string()),
    eventType: v.optional(v.string()),
    status: v.optional(v.string()),
    // Location fields
    locationType: v.optional(v.string()),
    venueName: v.optional(v.string()),
    venueAddress: v.optional(v.string()),
    virtualPlatform: v.optional(v.string()),
    // Budget & Scale
    expectedAttendees: v.optional(v.number()),
    budget: v.optional(v.number()),
    budgetCurrency: v.optional(v.string()),
    // End date/timezone
    endDate: v.optional(v.number()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) {
      throw new Error('Authentication required')
    }

    // Validate budget/attendees are non-negative
    if (args.budget !== undefined && args.budget < 0) {
      throw new Error('Budget cannot be negative')
    }
    if (args.expectedAttendees !== undefined && args.expectedAttendees < 0) {
      throw new Error('Expected attendees cannot be negative')
    }

    return await ctx.db.insert('events', {
      organizerId: user._id, // Always use current user's ID
      title: args.title,
      startDate: args.startDate,
      description: args.description,
      eventType: args.eventType,
      status: args.status ?? 'draft',
      locationType: args.locationType,
      venueName: args.venueName,
      venueAddress: args.venueAddress,
      virtualPlatform: args.virtualPlatform,
      expectedAttendees: args.expectedAttendees,
      budget: args.budget,
      budgetCurrency: args.budgetCurrency,
      endDate: args.endDate,
      timezone: args.timezone,
      createdAt: Date.now(),
    })
  },
})

// Update event - owner or superadmin only
export const update = mutation({
  args: {
    id: v.id('events'),
    title: v.optional(v.string()),
    startDate: v.optional(v.number()),
    description: v.optional(v.string()),
    eventType: v.optional(v.string()),
    status: v.optional(v.string()),
    // Location fields
    locationType: v.optional(v.string()),
    venueName: v.optional(v.string()),
    venueAddress: v.optional(v.string()),
    virtualPlatform: v.optional(v.string()),
    // Budget & Scale
    expectedAttendees: v.optional(v.number()),
    budget: v.optional(v.number()),
    budgetCurrency: v.optional(v.string()),
    // End date/timezone
    endDate: v.optional(v.number()),
    timezone: v.optional(v.string()),
    // Requirements
    requirements: v.optional(
      v.object({
        catering: v.optional(v.boolean()),
        av: v.optional(v.boolean()),
        photography: v.optional(v.boolean()),
        security: v.optional(v.boolean()),
        transportation: v.optional(v.boolean()),
        decoration: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) {
      throw new Error('Authentication required')
    }

    const event = await ctx.db.get(args.id)
    if (!event) {
      throw new Error('Event not found')
    }

    // Only owner or superadmin can update
    if (user.role !== 'superadmin' && event.organizerId !== user._id) {
      throw new Error('Access denied - you can only update your own events')
    }

    // Validate budget/attendees are non-negative
    if (args.budget !== undefined && args.budget < 0) {
      throw new Error('Budget cannot be negative')
    }
    if (args.expectedAttendees !== undefined && args.expectedAttendees < 0) {
      throw new Error('Expected attendees cannot be negative')
    }

    const { id, ...updates } = args
    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    )
    await ctx.db.patch(id, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    })
  },
})

// Delete event - owner or superadmin only
export const remove = mutation({
  args: { id: v.id('events') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) {
      throw new Error('Authentication required')
    }

    const event = await ctx.db.get(args.id)
    if (!event) {
      throw new Error('Event not found')
    }

    // Only owner or superadmin can delete
    if (user.role !== 'superadmin' && event.organizerId !== user._id) {
      throw new Error('Access denied - you can only delete your own events')
    }

    // Delete related records (eventVendors, eventSponsors)
    const eventVendors = await ctx.db
      .query('eventVendors')
      .withIndex('by_event', (q) => q.eq('eventId', args.id))
      .collect()
    for (const ev of eventVendors) {
      await ctx.db.delete(ev._id)
    }

    const eventSponsors = await ctx.db
      .query('eventSponsors')
      .withIndex('by_event', (q) => q.eq('eventId', args.id))
      .collect()
    for (const es of eventSponsors) {
      await ctx.db.delete(es._id)
    }

    await ctx.db.delete(args.id)
  },
})
