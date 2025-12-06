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

  // Organizer Profiles - Stores onboarding data for personalization
  organizerProfiles: defineTable({
    userId: v.id('users'),
    organizationName: v.optional(v.string()),
    organizationType: v.optional(v.string()), // company, nonprofit, government, community
    eventTypes: v.optional(v.array(v.string())), // Conferences, Hackathons, etc.
    eventScale: v.optional(v.string()), // small, medium, large, enterprise
    goals: v.optional(v.array(v.string())), // Find sponsors, Manage vendors, etc.
    experienceLevel: v.optional(v.string()), // first-time, 1-5, 5-20, 20+
    referralSource: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index('by_user', ['userId']),

  // Events - Full event management
  events: defineTable({
    organizerId: v.id('users'),
    title: v.string(),
    description: v.optional(v.string()),
    eventType: v.optional(v.string()), // Conference, Hackathon, Workshop, etc.

    // Date/Time
    startDate: v.number(), // Unix timestamp
    endDate: v.optional(v.number()),
    timezone: v.optional(v.string()),

    // Location
    locationType: v.optional(v.string()), // in-person, virtual, hybrid
    venueName: v.optional(v.string()),
    venueAddress: v.optional(v.string()),
    virtualPlatform: v.optional(v.string()),

    // Budget & Scale
    expectedAttendees: v.optional(v.number()),
    budget: v.optional(v.number()),
    budgetCurrency: v.optional(v.string()),

    // Status tracking
    status: v.string(), // draft, planning, active, completed, cancelled

    // Requirements for vendors
    requirements: v.optional(
      v.object({
        catering: v.optional(v.boolean()),
        av: v.optional(v.boolean()),
        photography: v.optional(v.boolean()),
        security: v.optional(v.boolean()),
        transportation: v.optional(v.boolean()),
        decoration: v.optional(v.boolean()),
        other: v.optional(v.array(v.string())),
      })
    ),

    // AI context
    aiConversationId: v.optional(v.id('aiConversations')),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_organizer', ['organizerId'])
    .index('by_status', ['status'])
    .index('by_date', ['startDate']),

  // Vendors - Service providers for events
  vendors: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(), // catering, av, photography, security, etc.
    services: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    priceRange: v.optional(v.string()), // budget, mid, premium
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    verified: v.boolean(),
    status: v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected')),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_status', ['status'])
    .index('by_category', ['category']),

  // Sponsors - Companies looking to sponsor events
  sponsors: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    industry: v.string(), // tech, finance, healthcare, etc.
    sponsorshipTiers: v.optional(v.array(v.string())), // platinum, gold, silver, bronze
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    targetEventTypes: v.optional(v.array(v.string())),
    targetAudience: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactName: v.optional(v.string()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    verified: v.boolean(),
    status: v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected')),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_status', ['status'])
    .index('by_industry', ['industry']),

  // Event-Vendor relationships with status tracking
  eventVendors: defineTable({
    eventId: v.id('events'),
    vendorId: v.id('vendors'),
    status: v.string(), // inquiry, negotiating, confirmed, declined, completed
    proposedBudget: v.optional(v.number()),
    finalBudget: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_event', ['eventId'])
    .index('by_vendor', ['vendorId'])
    .index('by_status', ['status']),

  // Event-Sponsor relationships with tier and amount
  eventSponsors: defineTable({
    eventId: v.id('events'),
    sponsorId: v.id('sponsors'),
    tier: v.optional(v.string()), // platinum, gold, silver, bronze
    status: v.string(), // inquiry, negotiating, confirmed, declined
    amount: v.optional(v.number()),
    benefits: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_event', ['eventId'])
    .index('by_sponsor', ['sponsorId'])
    .index('by_status', ['status']),

  // AI Conversations for event creation assistance
  aiConversations: defineTable({
    userId: v.id('users'),
    eventId: v.optional(v.id('events')), // null until event is created
    status: v.string(), // active, completed, abandoned
    purpose: v.optional(v.string()), // event-creation, vendor-search, sponsor-search
    context: v.optional(
      v.object({
        eventType: v.optional(v.string()),
        extractedData: v.optional(v.any()), // Structured data extracted by AI
      })
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_user', ['userId'])
    .index('by_event', ['eventId'])
    .index('by_status', ['status']),

  // AI Messages within conversations
  aiMessages: defineTable({
    conversationId: v.id('aiConversations'),
    role: v.string(), // user, assistant, system
    content: v.string(),
    metadata: v.optional(
      v.object({
        extractedFields: v.optional(v.array(v.string())),
        suggestedActions: v.optional(v.array(v.string())),
        model: v.optional(v.string()),
      })
    ),
    createdAt: v.number(),
  }).index('by_conversation', ['conversationId']),
})
