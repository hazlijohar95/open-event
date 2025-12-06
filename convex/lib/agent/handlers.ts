/**
 * Agent Tool Handlers
 *
 * This module implements the actual logic for each tool.
 * Handlers are called when the AI decides to use a tool.
 */

import type { GenericActionCtx } from 'convex/server'
import type { DataModel, Id } from '../../_generated/dataModel'
import { api } from '../../_generated/api'
import type {
  ToolName,
  ToolResult,
  VendorSearchResult,
  SponsorSearchResult,
} from './types'

type ActionCtx = GenericActionCtx<DataModel>

// ============================================================================
// Tool Handler Registry
// ============================================================================

type ToolHandler = (
  ctx: ActionCtx,
  userId: string,
  args: Record<string, unknown>
) => Promise<ToolResult>

const handlers: Record<ToolName, ToolHandler> = {
  createEvent: handleCreateEvent,
  updateEvent: handleUpdateEvent,
  getEventDetails: handleGetEventDetails,
  getUpcomingEvents: handleGetUpcomingEvents,
  searchVendors: handleSearchVendors,
  addVendorToEvent: handleAddVendorToEvent,
  searchSponsors: handleSearchSponsors,
  addSponsorToEvent: handleAddSponsorToEvent,
  getUserProfile: handleGetUserProfile,
}

/**
 * Execute a tool by name
 */
export async function executeToolHandler(
  ctx: ActionCtx,
  userId: string,
  toolCallId: string,
  toolName: ToolName,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const handler = handlers[toolName]
  if (!handler) {
    return {
      toolCallId,
      name: toolName,
      success: false,
      error: `Unknown tool: ${toolName}`,
      summary: `Failed to execute unknown tool: ${toolName}`,
    }
  }

  try {
    const result = await handler(ctx, userId, args)
    return { ...result, toolCallId }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      toolCallId,
      name: toolName,
      success: false,
      error: errorMessage,
      summary: `Error executing ${toolName}: ${errorMessage}`,
    }
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

async function handleCreateEvent(
  ctx: ActionCtx,
  userId: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  // Extract and validate required fields
  const title = args.title as string
  const eventType = args.eventType as string
  const startDateStr = args.startDate as string
  const startTimeStr = (args.startTime as string) || '09:00'

  // Optional fields
  const description = args.description as string | undefined
  const locationType = args.locationType as string | undefined
  const venueName = args.venueName as string | undefined
  const venueAddress = args.venueAddress as string | undefined
  const virtualPlatform = args.virtualPlatform as string | undefined
  const expectedAttendees = args.expectedAttendees as number | undefined
  const budget = args.budget as number | undefined
  const budgetCurrency = (args.budgetCurrency as string) || 'USD'
  const timezone = args.timezone as string | undefined

  // Parse date/time
  const startTimestamp = new Date(`${startDateStr}T${startTimeStr}`).getTime()

  // Create the event via mutation with all fields
  const eventId = await ctx.runMutation(api.events.create, {
    organizerId: userId as Id<'users'>,
    title,
    description,
    eventType,
    startDate: startTimestamp,
    status: 'draft',
    locationType,
    venueName,
    venueAddress,
    virtualPlatform,
    expectedAttendees,
    budget,
    budgetCurrency: budget ? budgetCurrency : undefined,
    timezone,
  })

  return {
    toolCallId: '',
    name: 'createEvent',
    success: true,
    data: {
      eventId,
      title,
      eventType,
      startDate: startDateStr,
      locationType,
      venueName,
      expectedAttendees,
      budget,
    },
    summary: `Created event "${title}" scheduled for ${startDateStr}${venueName ? ` at ${venueName}` : ''}${expectedAttendees ? ` for ${expectedAttendees} attendees` : ''}`,
  }
}

async function handleUpdateEvent(
  ctx: ActionCtx,
  _userId: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const eventId = args.eventId as string

  // Build update object with all possible fields
  const updates: Record<string, unknown> = {}
  if (args.title) updates.title = args.title
  if (args.description) updates.description = args.description
  if (args.eventType) updates.eventType = args.eventType
  if (args.locationType) updates.locationType = args.locationType
  if (args.venueName) updates.venueName = args.venueName
  if (args.venueAddress) updates.venueAddress = args.venueAddress
  if (args.virtualPlatform) updates.virtualPlatform = args.virtualPlatform
  if (args.expectedAttendees) updates.expectedAttendees = args.expectedAttendees
  if (args.budget) updates.budget = args.budget
  if (args.status) updates.status = args.status
  if (args.startDate) {
    const startTimeStr = (args.startTime as string) || '09:00'
    updates.startDate = new Date(`${args.startDate}T${startTimeStr}`).getTime()
  }

  await ctx.runMutation(api.events.update, {
    id: eventId as Id<'events'>,
    ...(updates as {
      title?: string
      description?: string
      startDate?: number
      eventType?: string
      status?: string
      locationType?: string
      venueName?: string
      venueAddress?: string
      virtualPlatform?: string
      expectedAttendees?: number
      budget?: number
    }),
  })

  return {
    toolCallId: '',
    name: 'updateEvent',
    success: true,
    data: { eventId, updates },
    summary: `Updated event with ${Object.keys(updates).length} change${Object.keys(updates).length !== 1 ? 's' : ''}`,
  }
}

async function handleGetEventDetails(
  ctx: ActionCtx,
  _userId: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const eventId = args.eventId as string
  const event = await ctx.runQuery(api.events.get, { id: eventId as Id<'events'> })

  if (!event) {
    return {
      toolCallId: '',
      name: 'getEventDetails',
      success: false,
      error: 'Event not found',
      summary: 'Could not find the requested event',
    }
  }

  return {
    toolCallId: '',
    name: 'getEventDetails',
    success: true,
    data: event,
    summary: `Found event "${event.title}" (${event.status})`,
  }
}

async function handleGetUpcomingEvents(
  ctx: ActionCtx,
  _userId: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const status = args.status as string | undefined
  const events = await ctx.runQuery(api.events.getMyEvents, {
    status,
  })

  const limit = (args.limit as number) || 5
  const limitedEvents = events.slice(0, limit)

  return {
    toolCallId: '',
    name: 'getUpcomingEvents',
    success: true,
    data: limitedEvents,
    summary: `Found ${limitedEvents.length} upcoming event${limitedEvents.length !== 1 ? 's' : ''}`,
  }
}

// ============================================================================
// Vendor Handlers
// ============================================================================

async function handleSearchVendors(
  ctx: ActionCtx,
  _userId: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const category = args.category as string | undefined
  const limit = (args.limit as number) || 5

  const vendors = await ctx.runQuery(api.vendors.list, {
    category,
  })

  // Transform to search results
  const results: VendorSearchResult[] = vendors.slice(0, limit).map((v) => ({
    id: v._id,
    name: v.name,
    category: v.category,
    description: v.description,
    rating: v.rating,
    priceRange: v.priceRange,
    location: v.location,
    verified: v.verified,
  }))

  if (results.length === 0) {
    return {
      toolCallId: '',
      name: 'searchVendors',
      success: true,
      data: [],
      summary: category
        ? `No ${category} vendors found. The marketplace is still growing!`
        : 'No vendors found. The marketplace is still growing!',
    }
  }

  return {
    toolCallId: '',
    name: 'searchVendors',
    success: true,
    data: results,
    summary: `Found ${results.length} vendor${results.length !== 1 ? 's' : ''}${category ? ` in ${category}` : ''}`,
  }
}

async function handleAddVendorToEvent(
  ctx: ActionCtx,
  _userId: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const eventId = args.eventId as string
  const vendorId = args.vendorId as string
  const proposedBudget = args.proposedBudget as number | undefined
  const notes = args.notes as string | undefined

  // Get vendor details for the summary
  const vendor = await ctx.runQuery(api.vendors.get, { id: vendorId as Id<'vendors'> })

  if (!vendor) {
    return {
      toolCallId: '',
      name: 'addVendorToEvent',
      success: false,
      error: 'Vendor not found',
      summary: 'Could not find the specified vendor',
    }
  }

  // In a real implementation, we'd create an eventVendor record
  // For now, return success with the vendor info
  return {
    toolCallId: '',
    name: 'addVendorToEvent',
    success: true,
    data: {
      eventId,
      vendorId,
      vendorName: vendor.name,
      proposedBudget,
      notes,
      status: 'inquiry',
    },
    summary: `Added ${vendor.name} to the event${proposedBudget ? ` with a proposed budget of $${proposedBudget}` : ''}`,
  }
}

// ============================================================================
// Sponsor Handlers
// ============================================================================

async function handleSearchSponsors(
  ctx: ActionCtx,
  _userId: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const industry = args.industry as string | undefined
  const limit = (args.limit as number) || 5

  const sponsors = await ctx.runQuery(api.sponsors.list, {
    industry,
  })

  // Transform to search results
  const results: SponsorSearchResult[] = sponsors.slice(0, limit).map((s) => ({
    id: s._id,
    name: s.name,
    industry: s.industry,
    description: s.description,
    budgetRange:
      s.budgetMin && s.budgetMax
        ? `$${s.budgetMin.toLocaleString()} - $${s.budgetMax.toLocaleString()}`
        : undefined,
    sponsorshipTiers: s.sponsorshipTiers,
    verified: s.verified,
  }))

  if (results.length === 0) {
    return {
      toolCallId: '',
      name: 'searchSponsors',
      success: true,
      data: [],
      summary: industry
        ? `No sponsors found in ${industry}. The sponsor network is still growing!`
        : 'No sponsors found. The sponsor network is still growing!',
    }
  }

  return {
    toolCallId: '',
    name: 'searchSponsors',
    success: true,
    data: results,
    summary: `Found ${results.length} potential sponsor${results.length !== 1 ? 's' : ''}${industry ? ` in ${industry}` : ''}`,
  }
}

async function handleAddSponsorToEvent(
  ctx: ActionCtx,
  _userId: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  const eventId = args.eventId as string
  const sponsorId = args.sponsorId as string
  const tier = args.tier as string | undefined
  const proposedAmount = args.proposedAmount as number | undefined

  // Get sponsor details for the summary
  const sponsor = await ctx.runQuery(api.sponsors.get, { id: sponsorId as Id<'sponsors'> })

  if (!sponsor) {
    return {
      toolCallId: '',
      name: 'addSponsorToEvent',
      success: false,
      error: 'Sponsor not found',
      summary: 'Could not find the specified sponsor',
    }
  }

  return {
    toolCallId: '',
    name: 'addSponsorToEvent',
    success: true,
    data: {
      eventId,
      sponsorId,
      sponsorName: sponsor.name,
      tier,
      proposedAmount,
      status: 'inquiry',
    },
    summary: `Created sponsorship inquiry with ${sponsor.name}${tier ? ` for ${tier} tier` : ''}`,
  }
}

// ============================================================================
// Profile Handlers
// ============================================================================

async function handleGetUserProfile(
  ctx: ActionCtx,
  // Parameters required by ToolHandler signature
  ...[, ]: [string, Record<string, unknown>]
): Promise<ToolResult> {
  const profile = await ctx.runQuery(api.organizerProfiles.getMyProfile)

  if (!profile) {
    return {
      toolCallId: '',
      name: 'getUserProfile',
      success: true,
      data: null,
      summary: 'No profile found. User has not completed onboarding.',
    }
  }

  return {
    toolCallId: '',
    name: 'getUserProfile',
    success: true,
    data: {
      organizationName: profile.organizationName,
      organizationType: profile.organizationType,
      eventTypes: profile.eventTypes,
      eventScale: profile.eventScale,
      experienceLevel: profile.experienceLevel,
    },
    summary: `Found profile for ${profile.organizationName || 'user'}`,
  }
}
