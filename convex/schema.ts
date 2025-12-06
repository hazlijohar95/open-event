import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Users - Only superadmin and organizer roles for Phase 2
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal('superadmin'), v.literal('organizer')),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_email', ['email']),

  // Events - Minimal fields: organizerId, title, date
  events: defineTable({
    organizerId: v.id('users'),
    title: v.string(),
    date: v.number(), // Unix timestamp
    createdAt: v.number(),
  })
    .index('by_organizer', ['organizerId'])
    .index('by_date', ['date']),

  // Vendors - Minimal: status and name
  vendors: defineTable({
    name: v.string(),
    status: v.union(v.literal('pending'), v.literal('approved')),
    createdAt: v.number(),
  }).index('by_status', ['status']),

  // Sponsors - Minimal: status and name
  sponsors: defineTable({
    name: v.string(),
    status: v.union(v.literal('pending'), v.literal('approved')),
    createdAt: v.number(),
  }).index('by_status', ['status']),

  // Event-Vendor relationships
  eventVendors: defineTable({
    eventId: v.id('events'),
    vendorId: v.id('vendors'),
    createdAt: v.number(),
  })
    .index('by_event', ['eventId'])
    .index('by_vendor', ['vendorId']),

  // Event-Sponsor relationships
  eventSponsors: defineTable({
    eventId: v.id('events'),
    sponsorId: v.id('sponsors'),
    createdAt: v.number(),
  })
    .index('by_event', ['eventId'])
    .index('by_sponsor', ['sponsorId']),
})
