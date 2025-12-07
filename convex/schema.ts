import { defineSchema, defineTable } from 'convex/server'
import { authTables } from '@convex-dev/auth/server'
import { v } from 'convex/values'

export default defineSchema({
  // Convex Auth tables (authAccounts, authSessions, authRefreshTokens, authVerificationCodes, authVerifiers, authRateLimits)
  ...authTables,

  // Users - Extended with app-specific fields
  // Convex Auth manages: name, email, image, emailVerificationTime, phone, phoneVerificationTime, isAnonymous
  users: defineTable({
    // Auth fields (managed by Convex Auth)
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // App-specific fields
    role: v.optional(
      v.union(v.literal('superadmin'), v.literal('admin'), v.literal('organizer'))
    ),

    // Account status for moderation
    status: v.optional(
      v.union(v.literal('active'), v.literal('suspended'), v.literal('pending'))
    ),

    // Suspension tracking
    suspendedAt: v.optional(v.number()),
    suspendedReason: v.optional(v.string()),
    suspendedBy: v.optional(v.id('users')),

    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index('email', ['email'])
    .index('by_role', ['role'])
    .index('by_status', ['status']),

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

    // Public directory visibility
    isPublic: v.optional(v.boolean()), // Show in public event directory
    publicVisibility: v.optional(
      v.object({
        showBudget: v.optional(v.boolean()),
        showAttendees: v.optional(v.boolean()),
        showVenue: v.optional(v.boolean()),
        showRequirements: v.optional(v.boolean()),
      })
    ),

    // What the organizer is looking for (for public directory)
    seekingVendors: v.optional(v.boolean()),
    seekingSponsors: v.optional(v.boolean()),
    vendorCategories: v.optional(v.array(v.string())), // Categories they need
    sponsorBenefits: v.optional(v.string()), // What sponsors get

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
    .index('by_date', ['startDate'])
    .index('by_public', ['isPublic']),

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
    contactName: v.optional(v.string()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    verified: v.boolean(),
    status: v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected')),

    // Application/Review tracking
    applicationSource: v.optional(v.string()), // form, email, manual, import
    applicationNotes: v.optional(v.string()), // Admin notes during onboarding

    // Review workflow
    reviewedBy: v.optional(v.id('users')), // Admin who reviewed
    reviewedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    reviewNotes: v.optional(v.string()), // Internal notes from reviewer

    // === ENTERPRISE FIELDS ===

    // Company Info
    companySize: v.optional(v.string()), // solo, small, medium, large
    yearFounded: v.optional(v.number()),
    headquarters: v.optional(v.string()),

    // Portfolio
    portfolio: v.optional(
      v.array(
        v.object({
          eventName: v.string(),
          year: v.number(),
          description: v.optional(v.string()),
          imageUrl: v.optional(v.string()),
        })
      )
    ),

    // Insurance & Legal
    insuranceInfo: v.optional(
      v.object({
        provider: v.optional(v.string()),
        policyNumber: v.optional(v.string()),
        coverageAmount: v.optional(v.number()),
        expirationDate: v.optional(v.number()),
        certificateUrl: v.optional(v.string()),
      })
    ),
    legalDocs: v.optional(
      v.array(
        v.object({
          name: v.string(),
          url: v.string(),
          type: v.string(), // license, insurance, liability, other
          uploadedAt: v.number(),
        })
      )
    ),

    // Payment Terms
    paymentTerms: v.optional(
      v.object({
        acceptedMethods: v.optional(v.array(v.string())), // card, bank, cash, invoice
        requiresDeposit: v.optional(v.boolean()),
        depositPercentage: v.optional(v.number()),
        netDays: v.optional(v.number()), // NET 30, NET 60
        notes: v.optional(v.string()),
      })
    ),

    // Capacity
    capacity: v.optional(
      v.object({
        maxEventsPerMonth: v.optional(v.number()),
        teamSize: v.optional(v.number()),
        serviceArea: v.optional(v.string()), // local, regional, national, international
      })
    ),

    // Certifications
    certifications: v.optional(
      v.array(
        v.object({
          name: v.string(),
          issuingBody: v.optional(v.string()),
          expirationDate: v.optional(v.number()),
          certificateUrl: v.optional(v.string()),
        })
      )
    ),

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
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    verified: v.boolean(),
    status: v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected')),

    // Application/Review tracking
    applicationSource: v.optional(v.string()), // form, email, manual, import
    applicationNotes: v.optional(v.string()), // Admin notes during onboarding

    // Review workflow
    reviewedBy: v.optional(v.id('users')), // Admin who reviewed
    reviewedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    reviewNotes: v.optional(v.string()), // Internal notes from reviewer

    // === ENTERPRISE FIELDS ===

    // Company Info
    companySize: v.optional(v.string()), // startup, small, medium, large, enterprise
    yearFounded: v.optional(v.number()),
    headquarters: v.optional(v.string()),

    // Past Experience
    pastSponsorships: v.optional(
      v.array(
        v.object({
          eventName: v.string(),
          year: v.number(),
          tier: v.optional(v.string()),
          amount: v.optional(v.number()),
        })
      )
    ),
    deliverablesOffered: v.optional(v.array(v.string())), // Logo placement, Booth space, Speaking slot, etc.

    // Contracts & Legal
    contractTemplateUrl: v.optional(v.string()),
    legalDocs: v.optional(
      v.array(
        v.object({
          name: v.string(),
          url: v.string(),
          type: v.string(), // insurance, liability, nda, other
          uploadedAt: v.number(),
        })
      )
    ),

    // Payment Terms
    paymentTerms: v.optional(
      v.object({
        preferredMethod: v.optional(v.string()), // wire, ach, card, invoice
        netDays: v.optional(v.number()), // NET 30, NET 60
        requiresInvoice: v.optional(v.boolean()),
        currency: v.optional(v.string()),
        notes: v.optional(v.string()),
      })
    ),

    // Exclusivity Requirements
    exclusivityRequirements: v.optional(
      v.object({
        requiresExclusivity: v.boolean(),
        competitorRestrictions: v.optional(v.array(v.string())),
        territorialScope: v.optional(v.string()),
        notes: v.optional(v.string()),
      })
    ),

    // Brand Guidelines
    brandGuidelines: v.optional(
      v.object({
        guidelinesUrl: v.optional(v.string()),
        logoUsageNotes: v.optional(v.string()),
        colorCodes: v.optional(v.array(v.string())),
        prohibitedUsages: v.optional(v.array(v.string())),
      })
    ),

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
    role: v.string(), // user, assistant, system, tool
    content: v.string(),

    // Streaming metadata
    isStreaming: v.optional(v.boolean()),
    streamStartedAt: v.optional(v.number()),

    // Tool calls for this message
    toolCalls: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          arguments: v.any(),
          status: v.string(), // pending, confirmed, executing, completed, error
          result: v.optional(v.any()),
        })
      )
    ),

    metadata: v.optional(
      v.object({
        extractedFields: v.optional(v.array(v.string())),
        suggestedActions: v.optional(v.array(v.string())),
        model: v.optional(v.string()),
        tokens: v.optional(
          v.object({
            input: v.number(),
            output: v.number(),
          })
        ),
      })
    ),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index('by_conversation', ['conversationId']),

  // Event Applications - Vendors/Sponsors applying to events
  eventApplications: defineTable({
    eventId: v.id('events'),
    // Applicant type (vendor or sponsor from admin-managed entities)
    applicantType: v.union(v.literal('vendor'), v.literal('sponsor')),
    applicantId: v.string(), // ID of vendor or sponsor

    // Application status
    status: v.union(
      v.literal('pending'),      // Awaiting organizer review
      v.literal('under_review'), // Organizer is reviewing
      v.literal('accepted'),     // Accepted by organizer
      v.literal('rejected'),     // Rejected by organizer
      v.literal('withdrawn')     // Withdrawn by applicant (admin)
    ),

    // Application details
    message: v.optional(v.string()),       // Cover letter/pitch
    proposedServices: v.optional(v.array(v.string())), // What they're offering
    proposedBudget: v.optional(v.number()), // Budget ask or offer
    proposedTier: v.optional(v.string()),   // For sponsors: tier they want

    // Contact info for this application (may differ from main profile)
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),

    // Organizer response
    organizerNotes: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
    respondedAt: v.optional(v.number()),
    respondedBy: v.optional(v.id('users')),

    // Submitted by (admin who submitted on behalf of vendor/sponsor)
    submittedBy: v.optional(v.id('users')),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_event', ['eventId'])
    .index('by_applicant', ['applicantType', 'applicantId'])
    .index('by_status', ['status'])
    .index('by_event_status', ['eventId', 'status']),

  // Inquiries - General messaging between parties
  inquiries: defineTable({
    // Source of inquiry
    fromType: v.union(v.literal('organizer'), v.literal('admin')),
    fromUserId: v.id('users'),

    // Target of inquiry
    toType: v.union(v.literal('vendor'), v.literal('sponsor')),
    toId: v.string(), // Vendor or sponsor ID

    // Related event (optional)
    eventId: v.optional(v.id('events')),

    // Inquiry content
    subject: v.string(),
    message: v.string(),

    // Status tracking
    status: v.union(
      v.literal('sent'),
      v.literal('read'),
      v.literal('replied'),
      v.literal('closed')
    ),

    // Response (if any)
    response: v.optional(v.string()),
    respondedAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_from', ['fromUserId'])
    .index('by_to', ['toType', 'toId'])
    .index('by_event', ['eventId'])
    .index('by_status', ['status']),

  // Budget Items - Track event spending
  budgetItems: defineTable({
    eventId: v.id('events'),
    category: v.string(), // venue, catering, av, marketing, staffing, permits, misc
    name: v.string(),
    description: v.optional(v.string()),
    estimatedAmount: v.number(),
    actualAmount: v.optional(v.number()),
    status: v.union(
      v.literal('planned'),    // Budget allocated but not spent
      v.literal('committed'),  // Contract signed, committed to spend
      v.literal('paid'),       // Payment made
      v.literal('cancelled')   // Budget item cancelled
    ),
    // Vendor/sponsor association (optional)
    vendorId: v.optional(v.id('vendors')),
    sponsorId: v.optional(v.id('sponsors')),
    // Payment tracking
    paidAt: v.optional(v.number()),
    paidMethod: v.optional(v.string()), // card, bank, cash, invoice
    invoiceNumber: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
    // Notes
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_event', ['eventId'])
    .index('by_category', ['category'])
    .index('by_status', ['status'])
    .index('by_event_category', ['eventId', 'category']),

  // Event Tasks - Checklist for event planning
  eventTasks: defineTable({
    eventId: v.id('events'),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()), // venue, vendors, marketing, logistics, etc.
    priority: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('urgent')
    ),
    status: v.union(
      v.literal('todo'),
      v.literal('in_progress'),
      v.literal('blocked'),
      v.literal('completed')
    ),
    // Due date tracking
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    // Assignment (for future multi-user support)
    assignedTo: v.optional(v.id('users')),
    // Dependencies
    blockedBy: v.optional(v.array(v.id('eventTasks'))), // Tasks that must be done first
    // Linked entities
    linkedVendorId: v.optional(v.id('vendors')),
    linkedSponsorId: v.optional(v.id('sponsors')),
    linkedBudgetItemId: v.optional(v.id('budgetItems')),
    // Ordering for manual sorting
    sortOrder: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_event', ['eventId'])
    .index('by_status', ['status'])
    .index('by_priority', ['priority'])
    .index('by_due_date', ['dueDate'])
    .index('by_event_status', ['eventId', 'status'])
    .index('by_assigned', ['assignedTo']),

  // Moderation Logs - Audit trail for all admin actions
  moderationLogs: defineTable({
    // Who performed the action
    adminId: v.id('users'),

    // What action was performed
    action: v.union(
      // User moderation
      v.literal('user_suspended'),
      v.literal('user_unsuspended'),
      v.literal('user_role_changed'),
      // Admin management
      v.literal('admin_created'),
      v.literal('admin_removed'),
      // Vendor/sponsor moderation
      v.literal('vendor_approved'),
      v.literal('vendor_rejected'),
      v.literal('sponsor_approved'),
      v.literal('sponsor_rejected'),
      // Event moderation
      v.literal('event_flagged'),
      v.literal('event_unflagged'),
      v.literal('event_removed'),
      // Public applications
      v.literal('application_reviewed'),
      v.literal('application_converted'),
      v.literal('application_rejected')
    ),

    // Target of the action (polymorphic)
    targetType: v.union(
      v.literal('user'),
      v.literal('vendor'),
      v.literal('sponsor'),
      v.literal('event'),
      v.literal('application')
    ),
    targetId: v.string(), // ID of the target entity

    // Additional context
    reason: v.optional(v.string()),
    metadata: v.optional(v.any()), // Additional action-specific data

    createdAt: v.number(),
  })
    .index('by_admin', ['adminId'])
    .index('by_target', ['targetType', 'targetId'])
    .index('by_action', ['action'])
    .index('by_date', ['createdAt']),

  // Public Applications - Vendor/Sponsor applications from public forms (no auth required)
  publicApplications: defineTable({
    applicationType: v.union(v.literal('vendor'), v.literal('sponsor')),
    status: v.union(
      v.literal('submitted'),
      v.literal('under_review'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('converted')
    ),

    // Common fields
    companyName: v.string(),
    description: v.optional(v.string()),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    website: v.optional(v.string()),

    // Vendor-specific fields
    vendorCategory: v.optional(v.string()),
    vendorServices: v.optional(v.array(v.string())),
    vendorLocation: v.optional(v.string()),
    vendorPriceRange: v.optional(v.string()),

    // Sponsor-specific fields
    sponsorIndustry: v.optional(v.string()),
    sponsorTiers: v.optional(v.array(v.string())),
    sponsorBudgetMin: v.optional(v.number()),
    sponsorBudgetMax: v.optional(v.number()),
    sponsorTargetEventTypes: v.optional(v.array(v.string())),
    sponsorTargetAudience: v.optional(v.string()),

    // Enterprise capture (collected during application)
    pastExperience: v.optional(v.string()), // Free text about their experience
    additionalNotes: v.optional(v.string()),
    referralSource: v.optional(v.string()), // How did they hear about us

    // Conversion tracking
    convertedToId: v.optional(v.string()), // ID of created vendor/sponsor
    convertedAt: v.optional(v.number()),
    convertedBy: v.optional(v.id('users')),

    // Review workflow
    reviewedBy: v.optional(v.id('users')),
    reviewedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    reviewNotes: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index('by_status', ['status'])
    .index('by_type', ['applicationType'])
    .index('by_type_status', ['applicationType', 'status'])
    .index('by_email', ['contactEmail']),
})
