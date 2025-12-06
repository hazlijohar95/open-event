import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('draft'),
        v.literal('planning'),
        v.literal('active'),
        v.literal('completed'),
        v.literal('cancelled')
      )
    ),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query('events')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .collect()
    }
    return await ctx.db.query('events').collect()
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
    name: v.string(),
    description: v.string(),
    organizerId: v.id('users'),
    startDate: v.number(),
    endDate: v.number(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    return await ctx.db.insert('events', {
      ...args,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('events'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    location: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('draft'),
        v.literal('planning'),
        v.literal('active'),
        v.literal('completed'),
        v.literal('cancelled')
      )
    ),
    logoStorageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, {
      ...updates,
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
