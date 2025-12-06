import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  args: {
    role: v.optional(v.union(v.literal('superadmin'), v.literal('organizer'))),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query('users').collect()
    if (args.role) {
      return users.filter((u) => u.role === args.role)
    }
    return users
  },
})

export const get = query({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()
  },
})

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()
  },
})

export const create = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal('superadmin'), v.literal('organizer')),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('users', {
      ...args,
      createdAt: Date.now(),
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('users'),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal('superadmin'), v.literal('organizer'))),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})
