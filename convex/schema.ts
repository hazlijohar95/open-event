import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Users - Core user management
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal('superadmin'),
      v.literal('organizer'),
      v.literal('vendor'),
      v.literal('sponsor'),
      v.literal('volunteer')
    ),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_email', ['email']),

  // Events - Core event data
  events: defineTable({
    name: v.string(),
    description: v.string(),
    organizerId: v.id('users'),
    startDate: v.number(),
    endDate: v.number(),
    location: v.string(),
    status: v.union(
      v.literal('draft'),
      v.literal('planning'),
      v.literal('active'),
      v.literal('completed'),
      v.literal('cancelled')
    ),
    logoStorageId: v.optional(v.id('_storage')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_organizer', ['organizerId'])
    .index('by_status', ['status']),

  // Vendors - Service providers
  vendors: defineTable({
    userId: v.id('users'),
    companyName: v.string(),
    category: v.string(),
    description: v.string(),
    services: v.array(v.string()),
    priceRange: v.object({
      min: v.number(),
      max: v.number(),
      currency: v.string(),
    }),
    rating: v.optional(v.number()),
    approved: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_category', ['category'])
    .index('by_approved', ['approved']),

  // Sponsors - Event sponsors
  sponsors: defineTable({
    userId: v.id('users'),
    companyName: v.string(),
    tier: v.union(
      v.literal('platinum'),
      v.literal('gold'),
      v.literal('silver'),
      v.literal('bronze')
    ),
    budget: v.number(),
    interests: v.array(v.string()),
    approved: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_tier', ['tier'])
    .index('by_approved', ['approved']),

  // Volunteers - Event volunteers
  volunteers: defineTable({
    userId: v.id('users'),
    skills: v.array(v.string()),
    availability: v.array(
      v.object({
        date: v.number(),
        startTime: v.string(),
        endTime: v.string(),
      })
    ),
    approved: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_approved', ['approved']),

  // Event-Vendor relationships
  eventVendors: defineTable({
    eventId: v.id('events'),
    vendorId: v.id('vendors'),
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('contracted')
    ),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_event', ['eventId'])
    .index('by_vendor', ['vendorId']),

  // Event-Sponsor relationships
  eventSponsors: defineTable({
    eventId: v.id('events'),
    sponsorId: v.id('sponsors'),
    status: v.union(
      v.literal('applied'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('confirmed')
    ),
    contribution: v.optional(v.number()),
    benefits: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index('by_event', ['eventId'])
    .index('by_sponsor', ['sponsorId']),

  // Event-Volunteer assignments
  eventVolunteers: defineTable({
    eventId: v.id('events'),
    volunteerId: v.id('volunteers'),
    role: v.string(),
    shift: v.object({
      date: v.number(),
      startTime: v.string(),
      endTime: v.string(),
    }),
    status: v.union(
      v.literal('assigned'),
      v.literal('confirmed'),
      v.literal('completed'),
      v.literal('no_show')
    ),
    createdAt: v.number(),
  })
    .index('by_event', ['eventId'])
    .index('by_volunteer', ['volunteerId']),

  // Logistics tracking
  logistics: defineTable({
    eventId: v.id('events'),
    category: v.string(),
    item: v.string(),
    quantity: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('ordered'),
      v.literal('delivered'),
      v.literal('setup')
    ),
    vendorId: v.optional(v.id('vendors')),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_event', ['eventId']),

  // File storage metadata
  files: defineTable({
    storageId: v.id('_storage'),
    eventId: v.optional(v.id('events')),
    type: v.union(
      v.literal('logo'),
      v.literal('certificate'),
      v.literal('report'),
      v.literal('document')
    ),
    name: v.string(),
    uploadedBy: v.id('users'),
    createdAt: v.number(),
  })
    .index('by_event', ['eventId'])
    .index('by_type', ['type']),
})
