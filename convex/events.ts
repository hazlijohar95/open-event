import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getCurrentUser } from './auth'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('events').collect()
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

export const get = query({
  args: { id: v.id('events') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const create = mutation({
  args: {
    organizerId: v.id('users'),
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
    return await ctx.db.insert('events', {
      organizerId: args.organizerId,
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
  },
  handler: async (ctx, args) => {
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

export const remove = mutation({
  args: { id: v.id('events') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
