import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// List all approved sponsors with optional industry filter
export const list = query({
  args: {
    industry: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let sponsors = await ctx.db
      .query('sponsors')
      .withIndex('by_status', (q) => q.eq('status', 'approved'))
      .collect()

    // Filter by industry if provided
    if (args.industry && args.industry !== 'all') {
      sponsors = sponsors.filter((s) => s.industry === args.industry)
    }

    // Filter by search query if provided
    if (args.search && args.search.trim()) {
      const searchLower = args.search.toLowerCase()
      sponsors = sponsors.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.description?.toLowerCase().includes(searchLower)
      )
    }

    return sponsors
  },
})

// Get a single sponsor by ID
export const get = query({
  args: { id: v.id('sponsors') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Get all unique industries from approved sponsors
export const getIndustries = query({
  args: {},
  handler: async (ctx) => {
    const sponsors = await ctx.db
      .query('sponsors')
      .withIndex('by_status', (q) => q.eq('status', 'approved'))
      .collect()

    const industries = [...new Set(sponsors.map((s) => s.industry))]
    return industries.sort()
  },
})

// Create a new sponsor (for sponsor registration - future feature)
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    industry: v.string(),
    sponsorshipTiers: v.optional(v.array(v.string())),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    targetEventTypes: v.optional(v.array(v.string())),
    targetAudience: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactName: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('sponsors', {
      ...args,
      verified: false,
      status: 'pending',
      createdAt: Date.now(),
    })
  },
})
