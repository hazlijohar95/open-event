import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { assertRole } from './lib/auth'

// ============================================================================
// Public Queries (for organizers)
// ============================================================================

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

// Get vendors for a specific event with full vendor details
export const getByEvent = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, args) => {
    const eventVendors = await ctx.db
      .query('eventVendors')
      .withIndex('by_event', (q) => q.eq('eventId', args.eventId))
      .collect()

    if (eventVendors.length === 0) return []

    // BATCH LOAD: Fetch all vendors at once instead of N+1 queries
    const vendorIds = [...new Set(eventVendors.map((ev) => ev.vendorId))]
    const vendorPromises = vendorIds.map((id) => ctx.db.get(id))
    const vendors = await Promise.all(vendorPromises)

    // Create lookup map
    const vendorMap = new Map(
      vendors.filter(Boolean).map((v) => [v!._id, v!])
    )

    // Merge using map (no additional queries)
    return eventVendors
      .map((ev) => ({
        ...ev,
        vendor: vendorMap.get(ev.vendorId) || null,
      }))
      .filter((v) => v.vendor !== null)
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

// ============================================================================
// Admin Queries
// ============================================================================

// List all vendors for admin review (includes pending)
export const listForAdmin = query({
  args: {
    status: v.optional(v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected'))),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await assertRole(ctx, 'admin')

    let vendors
    const statusFilter = args.status
    if (statusFilter) {
      vendors = await ctx.db
        .query('vendors')
        .withIndex('by_status', (q) => q.eq('status', statusFilter))
        .order('desc')
        .collect()
    } else {
      vendors = await ctx.db.query('vendors').order('desc').collect()
    }

    // Filter by category if provided
    if (args.category && args.category !== 'all') {
      vendors = vendors.filter((v) => v.category === args.category)
    }

    // Apply limit
    const limit = args.limit || 100
    return vendors.slice(0, limit)
  },
})

// Get pending vendors count for admin dashboard
export const getPendingCount = query({
  args: {},
  handler: async (ctx) => {
    await assertRole(ctx, 'admin')

    const pending = await ctx.db
      .query('vendors')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .collect()

    return pending.length
  },
})

// ============================================================================
// Admin Mutations
// ============================================================================

// Approve a vendor
export const approve = mutation({
  args: {
    vendorId: v.id('vendors'),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await assertRole(ctx, 'admin')

    const vendor = await ctx.db.get(args.vendorId)
    if (!vendor) {
      throw new Error('Vendor not found')
    }

    if (vendor.status === 'approved') {
      throw new Error('Vendor is already approved')
    }

    const now = Date.now()

    await ctx.db.patch(args.vendorId, {
      status: 'approved',
      verified: true,
      reviewedBy: admin._id,
      reviewedAt: now,
      reviewNotes: args.notes,
      rejectionReason: undefined,
      updatedAt: now,
    })

    // Log the action
    await ctx.db.insert('moderationLogs', {
      adminId: admin._id,
      action: 'vendor_approved',
      targetType: 'vendor',
      targetId: args.vendorId,
      reason: args.notes || 'Vendor approved',
      metadata: {
        vendorName: vendor.name,
        vendorCategory: vendor.category,
      },
      createdAt: now,
    })

    return { success: true }
  },
})

// Reject a vendor
export const reject = mutation({
  args: {
    vendorId: v.id('vendors'),
    reason: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await assertRole(ctx, 'admin')

    const vendor = await ctx.db.get(args.vendorId)
    if (!vendor) {
      throw new Error('Vendor not found')
    }

    if (vendor.status === 'rejected') {
      throw new Error('Vendor is already rejected')
    }

    const now = Date.now()

    await ctx.db.patch(args.vendorId, {
      status: 'rejected',
      verified: false,
      reviewedBy: admin._id,
      reviewedAt: now,
      rejectionReason: args.reason,
      reviewNotes: args.notes,
      updatedAt: now,
    })

    // Log the action
    await ctx.db.insert('moderationLogs', {
      adminId: admin._id,
      action: 'vendor_rejected',
      targetType: 'vendor',
      targetId: args.vendorId,
      reason: args.reason,
      metadata: {
        vendorName: vendor.name,
        vendorCategory: vendor.category,
        internalNotes: args.notes,
      },
      createdAt: now,
    })

    return { success: true }
  },
})

// Admin create vendor (manual onboarding)
export const adminCreate = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    services: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    priceRange: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    applicationSource: v.optional(v.string()),
    applicationNotes: v.optional(v.string()),
    autoApprove: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const admin = await assertRole(ctx, 'admin')

    const now = Date.now()
    const status = args.autoApprove ? 'approved' : 'pending'

    const vendorId = await ctx.db.insert('vendors', {
      name: args.name,
      description: args.description,
      category: args.category,
      services: args.services,
      location: args.location,
      priceRange: args.priceRange,
      contactEmail: args.contactEmail,
      contactPhone: args.contactPhone,
      website: args.website,
      rating: 0,
      reviewCount: 0,
      verified: args.autoApprove || false,
      status,
      applicationSource: args.applicationSource || 'manual',
      applicationNotes: args.applicationNotes,
      reviewedBy: args.autoApprove ? admin._id : undefined,
      reviewedAt: args.autoApprove ? now : undefined,
      createdAt: now,
    })

    // Log if auto-approved
    if (args.autoApprove) {
      await ctx.db.insert('moderationLogs', {
        adminId: admin._id,
        action: 'vendor_approved',
        targetType: 'vendor',
        targetId: vendorId,
        reason: 'Manually onboarded and approved',
        metadata: {
          vendorName: args.name,
          vendorCategory: args.category,
          source: args.applicationSource || 'manual',
        },
        createdAt: now,
      })
    }

    return vendorId
  },
})

// Admin update vendor
export const adminUpdate = mutation({
  args: {
    vendorId: v.id('vendors'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    services: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    priceRange: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    applicationNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertRole(ctx, 'admin')

    const { vendorId, ...updates } = args

    const vendor = await ctx.db.get(vendorId)
    if (!vendor) {
      throw new Error('Vendor not found')
    }

    // Filter out undefined values
    const filteredUpdates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value
      }
    }

    await ctx.db.patch(vendorId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})
