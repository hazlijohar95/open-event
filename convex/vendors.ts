import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// List all approved vendors with optional category filter
export const list = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let vendors = await ctx.db
      .query('vendors')
      .withIndex('by_status', (q) => q.eq('status', 'approved'))
      .collect()

    // Filter by category if provided
    if (args.category && args.category !== 'all') {
      vendors = vendors.filter((v) => v.category === args.category)
    }

    // Filter by search query if provided
    if (args.search && args.search.trim()) {
      const searchLower = args.search.toLowerCase()
      vendors = vendors.filter(
        (v) =>
          v.name.toLowerCase().includes(searchLower) ||
          v.description?.toLowerCase().includes(searchLower)
      )
    }

    return vendors
  },
})

// Get a single vendor by ID
export const get = query({
  args: { id: v.id('vendors') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Get all unique categories from approved vendors
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const vendors = await ctx.db
      .query('vendors')
      .withIndex('by_status', (q) => q.eq('status', 'approved'))
      .collect()

    const categories = [...new Set(vendors.map((v) => v.category))]
    return categories.sort()
  },
})

// Create a new vendor (for vendor registration - future feature)
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    location: v.optional(v.string()),
    priceRange: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('vendors', {
      ...args,
      rating: 0,
      reviewCount: 0,
      verified: false,
      status: 'pending',
      createdAt: Date.now(),
    })
  },
})
