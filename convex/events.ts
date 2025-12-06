import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  args: {},
  handler: async (ctx) => {
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
    organizerId: v.id('users'),
    title: v.string(),
    date: v.number(), // Unix timestamp
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('events', {
      ...args,
      createdAt: Date.now(),
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('events'),
    title: v.optional(v.string()),
    date: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, updates)
  },
})

export const remove = mutation({
  args: { id: v.id('events') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
