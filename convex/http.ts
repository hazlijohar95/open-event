import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { auth } from './auth'
import OpenAI from 'openai'
import { api, internal } from './_generated/api'
import { getOpenAITools, toolRequiresConfirmation } from './lib/agent/tools'
import { executeToolHandler } from './lib/agent/handlers'
import type { ToolName, ToolCall, ToolResult } from './lib/agent/types'

// API helpers
import {
  apiSuccess,
  ApiErrors,
  handleCors,
  parseBody,
  getPagination,
  paginationMeta,
  getLastPathSegment,
  withRateLimitHeaders,
} from './api/helpers'
import {
  validateApiKey,
  requirePermission,
  PERMISSIONS,
} from './api/auth'

// ============================================================================
// HTTP Router
// ============================================================================

const http = httpRouter()

// Convex Auth HTTP routes (handles OAuth callbacks, magic links, etc.)
auth.addHttpRoutes(http)

// ============================================================================
// Health Check & API Info
// ============================================================================

// Health check endpoint
http.route({
  path: '/api/health',
  method: 'GET',
  handler: httpAction(async () => {
    return apiSuccess({
      status: 'ok',
      timestamp: Date.now(),
      version: '1.0.0',
    })
  }),
})

// API info endpoint
http.route({
  path: '/api/v1',
  method: 'GET',
  handler: httpAction(async () => {
    return apiSuccess({
      name: 'Open Event API',
      version: '1.0.0',
      documentation: 'https://github.com/hazlijohar95/open-event',
      endpoints: {
        events: '/api/v1/events',
        vendors: '/api/v1/vendors',
        sponsors: '/api/v1/sponsors',
        public: '/api/v1/public/events',
      },
    })
  }),
})

// ============================================================================
// CORS Preflight Handlers
// ============================================================================

// Generic CORS handler for /api/v1/*
http.route({
  path: '/api/v1/events',
  method: 'OPTIONS',
  handler: httpAction(async () => handleCors()),
})

http.route({
  path: '/api/v1/vendors',
  method: 'OPTIONS',
  handler: httpAction(async () => handleCors()),
})

http.route({
  path: '/api/v1/sponsors',
  method: 'OPTIONS',
  handler: httpAction(async () => handleCors()),
})

http.route({
  path: '/api/v1/public/events',
  method: 'OPTIONS',
  handler: httpAction(async () => handleCors()),
})

// ============================================================================
// API v1 - Events
// ============================================================================

// GET /api/v1/events - List events for the authenticated user
http.route({
  path: '/api/v1/events',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    // Validate API key
    const authResult = await validateApiKey(ctx, request)
    if (!authResult.success) {
      return authResult.response
    }

    // Check permission
    const permError = requirePermission(authResult.keyInfo, PERMISSIONS.EVENTS_READ)
    if (permError) return permError

    try {
      const url = new URL(request.url)
      const { page, limit, offset } = getPagination(url)
      const status = url.searchParams.get('status') || undefined

      // Get events for the API key's user using internal query
      const allEvents = await ctx.runQuery(internal.api.mutations.getEventsByUser, {
        userId: authResult.keyInfo.userId,
        status: status === 'all' ? undefined : status,
      })

      // Apply pagination
      const total = allEvents.length
      const paginatedEvents = allEvents.slice(offset, offset + limit)

      return apiSuccess(paginatedEvents, paginationMeta(total, page, limit))
    } catch (error) {
      console.error('API Error:', error)
      return ApiErrors.internalError(
        error instanceof Error ? error.message : 'Failed to fetch events'
      )
    }
  }),
})

// POST /api/v1/events - Create a new event
http.route({
  path: '/api/v1/events',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    // Validate API key - STRICT CHECK
    const authResult = await validateApiKey(ctx, request)
    if (!authResult.success) {
      return authResult.response
    }

    // Check permission - MUST have events:write permission
    const permError = requirePermission(authResult.keyInfo, PERMISSIONS.EVENTS_WRITE)
    if (permError) return permError

    // Parse request body
    const body = await parseBody<{
      title: string
      startDate: number
      description?: string
      eventType?: string
      status?: string
      locationType?: string
      venueName?: string
      venueAddress?: string
      virtualPlatform?: string
      expectedAttendees?: number
      budget?: number
      budgetCurrency?: string
      endDate?: number
      timezone?: string
    }>(request)

    if (!body) {
      return ApiErrors.badRequest('Invalid JSON body')
    }

    // Validate required fields
    if (!body.title) {
      return ApiErrors.validationError('title is required')
    }
    if (!body.startDate) {
      return ApiErrors.validationError('startDate is required (Unix timestamp)')
    }
    if (typeof body.startDate !== 'number') {
      return ApiErrors.validationError('startDate must be a Unix timestamp (number)')
    }

    try {
      // Use internal mutation with userId from API key
      const eventId = await ctx.runMutation(internal.api.mutations.createEvent, {
        userId: authResult.keyInfo.userId,
        title: body.title,
        startDate: body.startDate,
        description: body.description,
        eventType: body.eventType,
        status: body.status,
        locationType: body.locationType,
        venueName: body.venueName,
        venueAddress: body.venueAddress,
        virtualPlatform: body.virtualPlatform,
        expectedAttendees: body.expectedAttendees,
        budget: body.budget,
        budgetCurrency: body.budgetCurrency,
        endDate: body.endDate,
        timezone: body.timezone,
      })

      return apiSuccess({ eventId }, { created: true }, 201)
    } catch (error) {
      console.error('API Error:', error)
      return ApiErrors.badRequest(
        error instanceof Error ? error.message : 'Failed to create event'
      )
    }
  }),
})

// GET /api/v1/events/:id - Get a single event
http.route({
  pathPrefix: '/api/v1/events/',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    // Validate API key
    const authResult = await validateApiKey(ctx, request)
    if (!authResult.success) {
      return authResult.response
    }

    // Check permission
    const permError = requirePermission(authResult.keyInfo, PERMISSIONS.EVENTS_READ)
    if (permError) return permError

    // Extract event ID from URL
    const url = new URL(request.url)
    const eventId = getLastPathSegment(url.pathname)

    if (!eventId) {
      return ApiErrors.badRequest('Event ID is required')
    }

    try {
      // Use internal query with ownership check
      const event = await ctx.runQuery(internal.api.mutations.getEventById, { 
        userId: authResult.keyInfo.userId,
        eventId: eventId as any,
      })

      if (!event) {
        return ApiErrors.notFound('Event')
      }

      return apiSuccess(event)
    } catch (error) {
      console.error('API Error:', error)
      return ApiErrors.internalError(
        error instanceof Error ? error.message : 'Failed to fetch event'
      )
    }
  }),
})

// PATCH /api/v1/events/:id - Update an event
http.route({
  pathPrefix: '/api/v1/events/',
  method: 'PATCH',
  handler: httpAction(async (ctx, request) => {
    // Validate API key - STRICT CHECK
    const authResult = await validateApiKey(ctx, request)
    if (!authResult.success) {
      return authResult.response
    }

    // Check permission - MUST have events:write permission
    const permError = requirePermission(authResult.keyInfo, PERMISSIONS.EVENTS_WRITE)
    if (permError) return permError

    // Extract event ID from URL
    const url = new URL(request.url)
    const eventId = getLastPathSegment(url.pathname)

    if (!eventId) {
      return ApiErrors.badRequest('Event ID is required')
    }

    // Parse request body
    const body = await parseBody<{
      title?: string
      startDate?: number
      description?: string
      eventType?: string
      status?: string
      locationType?: string
      venueName?: string
      venueAddress?: string
      virtualPlatform?: string
      expectedAttendees?: number
      budget?: number
      budgetCurrency?: string
      endDate?: number
      timezone?: string
    }>(request)

    if (!body) {
      return ApiErrors.badRequest('Invalid JSON body')
    }

    // Check that at least one field is being updated
    if (Object.keys(body).length === 0) {
      return ApiErrors.badRequest('No fields to update')
    }

    try {
      // Use internal mutation with userId from API key (includes ownership check)
      await ctx.runMutation(internal.api.mutations.updateEvent, {
        userId: authResult.keyInfo.userId,
        eventId: eventId as any,
        ...body,
      })

      return apiSuccess({ updated: true })
    } catch (error) {
      console.error('API Error:', error)
      return ApiErrors.badRequest(
        error instanceof Error ? error.message : 'Failed to update event'
      )
    }
  }),
})

// DELETE /api/v1/events/:id - Delete an event
http.route({
  pathPrefix: '/api/v1/events/',
  method: 'DELETE',
  handler: httpAction(async (ctx, request) => {
    // Validate API key - STRICT CHECK
    const authResult = await validateApiKey(ctx, request)
    if (!authResult.success) {
      return authResult.response
    }

    // Check permission - MUST have events:delete permission
    const permError = requirePermission(authResult.keyInfo, PERMISSIONS.EVENTS_DELETE)
    if (permError) return permError

    // Extract event ID from URL
    const url = new URL(request.url)
    const eventId = getLastPathSegment(url.pathname)

    if (!eventId) {
      return ApiErrors.badRequest('Event ID is required')
    }

    try {
      // Use internal mutation with userId from API key (includes ownership check)
      await ctx.runMutation(internal.api.mutations.deleteEvent, {
        userId: authResult.keyInfo.userId,
        eventId: eventId as any,
      })

      return apiSuccess({ deleted: true })
    } catch (error) {
      console.error('API Error:', error)
      return ApiErrors.badRequest(
        error instanceof Error ? error.message : 'Failed to delete event'
      )
    }
  }),
})

// ============================================================================
// API v1 - Vendors
// ============================================================================

// GET /api/v1/vendors - List approved vendors
http.route({
  path: '/api/v1/vendors',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    // Validate API key
    const authResult = await validateApiKey(ctx, request)
    if (!authResult.success) {
      return authResult.response
    }

    // Check permission
    const permError = requirePermission(authResult.keyInfo, PERMISSIONS.VENDORS_READ)
    if (permError) return permError

    try {
      const url = new URL(request.url)
      const { page, limit, offset } = getPagination(url)
      const category = url.searchParams.get('category') || undefined
      const search = url.searchParams.get('search') || undefined

      const allVendors = await ctx.runQuery(api.vendors.list, {
        category,
        search,
      })

      // Apply pagination
      const total = allVendors.length
      const paginatedVendors = allVendors.slice(offset, offset + limit)

      return apiSuccess(paginatedVendors, paginationMeta(total, page, limit))
    } catch (error) {
      console.error('API Error:', error)
      return ApiErrors.internalError('Failed to fetch vendors')
    }
  }),
})

// GET /api/v1/vendors/categories - List vendor categories
http.route({
  path: '/api/v1/vendors/categories',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    // Validate API key
    const authResult = await validateApiKey(ctx, request)
    if (!authResult.success) {
      return authResult.response
    }

    try {
      const categories = await ctx.runQuery(api.vendors.getCategories)
      return apiSuccess(categories)
    } catch (error) {
      console.error('API Error:', error)
      return ApiErrors.internalError('Failed to fetch categories')
    }
  }),
})

// ============================================================================
// API v1 - Sponsors
// ============================================================================

// GET /api/v1/sponsors - List approved sponsors
http.route({
  path: '/api/v1/sponsors',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    // Validate API key
    const authResult = await validateApiKey(ctx, request)
    if (!authResult.success) {
      return authResult.response
    }

    // Check permission
    const permError = requirePermission(authResult.keyInfo, PERMISSIONS.SPONSORS_READ)
    if (permError) return permError

    try {
      const url = new URL(request.url)
      const { page, limit, offset } = getPagination(url)
      const industry = url.searchParams.get('industry') || undefined
      const search = url.searchParams.get('search') || undefined

      const allSponsors = await ctx.runQuery(api.sponsors.list, {
        industry,
        search,
      })

      // Apply pagination
      const total = allSponsors.length
      const paginatedSponsors = allSponsors.slice(offset, offset + limit)

      return apiSuccess(paginatedSponsors, paginationMeta(total, page, limit))
    } catch (error) {
      console.error('API Error:', error)
      return ApiErrors.internalError('Failed to fetch sponsors')
    }
  }),
})

// ============================================================================
// API v1 - Public Endpoints (No API Key Required)
// ============================================================================
// These endpoints are safe read-only operations that don't require authentication.
// They only expose publicly available data.

// CORS preflight for public endpoints
http.route({
  path: '/api/v1/public/vendors',
  method: 'OPTIONS',
  handler: httpAction(async () => handleCors()),
})

// GET /api/v1/public/events - List public events (no auth)
http.route({
  path: '/api/v1/public/events',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url)
      const { page, limit, offset } = getPagination(url)
      
      const eventType = url.searchParams.get('eventType') || undefined
      const locationType = url.searchParams.get('locationType') || undefined
      const seekingVendors = url.searchParams.get('seekingVendors') === 'true' || undefined
      const seekingSponsors = url.searchParams.get('seekingSponsors') === 'true' || undefined
      const search = url.searchParams.get('search') || undefined

      const allEvents = await ctx.runQuery(api.events.listPublic, {
        eventType,
        locationType,
        seekingVendors,
        seekingSponsors,
        search,
        limit: 100, // Internal limit
      })

      // Apply pagination
      const total = allEvents.length
      const paginatedEvents = allEvents.slice(offset, offset + limit)

      return apiSuccess(paginatedEvents, paginationMeta(total, page, limit))
    } catch (error) {
      console.error('API Error:', error)
      return ApiErrors.internalError('Failed to fetch public events')
    }
  }),
})

// GET /api/v1/public/vendors - List approved vendors (no auth)
// Only returns approved/verified vendors with public information
http.route({
  path: '/api/v1/public/vendors',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url)
      const { page, limit, offset } = getPagination(url)
      
      const category = url.searchParams.get('category') || undefined
      const search = url.searchParams.get('search') || undefined

      // Get approved vendors only
      const allVendors = await ctx.runQuery(api.vendors.list, {
        category,
        search,
      })

      // Apply pagination
      const total = allVendors.length
      const paginatedVendors = allVendors.slice(offset, offset + limit)

      // Return only public-safe fields (no contact details, internal notes, etc.)
      const publicVendors = paginatedVendors.map(vendor => ({
        _id: vendor._id,
        name: vendor.name,
        description: vendor.description,
        category: vendor.category,
        services: vendor.services,
        location: vendor.location,
        priceRange: vendor.priceRange,
        rating: vendor.rating,
        reviewCount: vendor.reviewCount,
        website: vendor.website,
        logoUrl: vendor.logoUrl,
        verified: vendor.verified,
      }))

      return apiSuccess(publicVendors, paginationMeta(total, page, limit))
    } catch (error) {
      console.error('API Error:', error)
      return ApiErrors.internalError('Failed to fetch vendors')
    }
  }),
})

// GET /api/v1/public/vendors/categories - List vendor categories (no auth)
http.route({
  path: '/api/v1/public/vendors/categories',
  method: 'GET',
  handler: httpAction(async (ctx) => {
    try {
      const categories = await ctx.runQuery(api.vendors.getCategories)
      return apiSuccess(categories)
    } catch (error) {
      console.error('API Error:', error)
      return ApiErrors.internalError('Failed to fetch categories')
    }
  }),
})

// ============================================================================
// API v1 - Webhooks
// ============================================================================

// CORS preflight for webhooks
http.route({
  path: '/api/v1/webhooks',
  method: 'OPTIONS',
  handler: httpAction(async () => handleCors()),
})

// GET /api/v1/webhooks - List user's webhooks
http.route({
  path: '/api/v1/webhooks',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    // Validate API key
    const authResult = await validateApiKey(ctx, request)
    if (!authResult.success) {
      return authResult.response
    }

    // Check permission
    const permError = requirePermission(authResult.keyInfo, PERMISSIONS.ADMIN)
    if (permError) {
      // Also allow if they have webhooks permission (future)
      return permError
    }

    try {
      // Get webhooks for the user
      const webhooks = await ctx.runQuery(api.webhooks.list)
      return apiSuccess(webhooks)
    } catch (error) {
      console.error('API Error:', error)
      return ApiErrors.internalError('Failed to fetch webhooks')
    }
  }),
})

// POST /api/v1/webhooks - Create a webhook
http.route({
  path: '/api/v1/webhooks',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    // Validate API key
    const authResult = await validateApiKey(ctx, request)
    if (!authResult.success) {
      return authResult.response
    }

    // Check permission
    const permError = requirePermission(authResult.keyInfo, PERMISSIONS.ADMIN)
    if (permError) return permError

    // Parse request body
    const body = await parseBody<{
      name: string
      url: string
      events: string[]
    }>(request)

    if (!body) {
      return ApiErrors.badRequest('Invalid JSON body')
    }

    // Validate required fields
    if (!body.name) {
      return ApiErrors.validationError('name is required')
    }
    if (!body.url) {
      return ApiErrors.validationError('url is required')
    }
    if (!body.events || body.events.length === 0) {
      return ApiErrors.validationError('events array is required')
    }

    try {
      const result = await ctx.runMutation(api.webhooks.create, {
        name: body.name,
        url: body.url,
        events: body.events,
      })

      return apiSuccess(result, { created: true }, 201)
    } catch (error) {
      console.error('API Error:', error)
      return ApiErrors.badRequest(
        error instanceof Error ? error.message : 'Failed to create webhook'
      )
    }
  }),
})

// GET /api/v1/webhooks/:id - Get a single webhook
http.route({
  pathPrefix: '/api/v1/webhooks/',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    // Validate API key
    const authResult = await validateApiKey(ctx, request)
    if (!authResult.success) {
      return authResult.response
    }

    // Check permission
    const permError = requirePermission(authResult.keyInfo, PERMISSIONS.ADMIN)
    if (permError) return permError

    // Extract webhook ID from URL
    const url = new URL(request.url)
    const webhookId = getLastPathSegment(url.pathname)

    if (!webhookId || webhookId === 'webhooks') {
      return ApiErrors.badRequest('Webhook ID is required')
    }

    try {
      const webhook = await ctx.runQuery(api.webhooks.get, {
        id: webhookId as any,
      })

      if (!webhook) {
        return ApiErrors.notFound('Webhook')
      }

      return apiSuccess(webhook)
    } catch (error) {
      console.error('API Error:', error)
      return ApiErrors.internalError('Failed to fetch webhook')
    }
  }),
})

// PATCH /api/v1/webhooks/:id - Update a webhook
http.route({
  pathPrefix: '/api/v1/webhooks/',
  method: 'PATCH',
  handler: httpAction(async (ctx, request) => {
    // Validate API key
    const authResult = await validateApiKey(ctx, request)
    if (!authResult.success) {
      return authResult.response
    }

    // Check permission
    const permError = requirePermission(authResult.keyInfo, PERMISSIONS.ADMIN)
    if (permError) return permError

    // Extract webhook ID from URL
    const url = new URL(request.url)
    const webhookId = getLastPathSegment(url.pathname)

    if (!webhookId || webhookId === 'webhooks') {
      return ApiErrors.badRequest('Webhook ID is required')
    }

    // Parse request body
    const body = await parseBody<{
      name?: string
      url?: string
      events?: string[]
      status?: 'active' | 'paused'
    }>(request)

    if (!body) {
      return ApiErrors.badRequest('Invalid JSON body')
    }

    try {
      await ctx.runMutation(api.webhooks.update, {
        id: webhookId as any,
        ...body,
      })

      return apiSuccess({ updated: true })
    } catch (error) {
      console.error('API Error:', error)
      return ApiErrors.badRequest(
        error instanceof Error ? error.message : 'Failed to update webhook'
      )
    }
  }),
})

// DELETE /api/v1/webhooks/:id - Delete a webhook
http.route({
  pathPrefix: '/api/v1/webhooks/',
  method: 'DELETE',
  handler: httpAction(async (ctx, request) => {
    // Validate API key
    const authResult = await validateApiKey(ctx, request)
    if (!authResult.success) {
      return authResult.response
    }

    // Check permission
    const permError = requirePermission(authResult.keyInfo, PERMISSIONS.ADMIN)
    if (permError) return permError

    // Extract webhook ID from URL
    const url = new URL(request.url)
    const webhookId = getLastPathSegment(url.pathname)

    if (!webhookId || webhookId === 'webhooks') {
      return ApiErrors.badRequest('Webhook ID is required')
    }

    try {
      await ctx.runMutation(api.webhooks.remove, {
        id: webhookId as any,
      })

      return apiSuccess({ deleted: true })
    } catch (error) {
      console.error('API Error:', error)
      return ApiErrors.badRequest(
        error instanceof Error ? error.message : 'Failed to delete webhook'
      )
    }
  }),
})

// GET /api/v1/webhooks/events - List available webhook events
http.route({
  path: '/api/v1/webhooks/events',
  method: 'GET',
  handler: httpAction(async () => {
    const events = [
      { type: 'event.created', description: 'When a new event is created' },
      { type: 'event.updated', description: 'When an event is updated' },
      { type: 'event.deleted', description: 'When an event is deleted' },
      { type: 'event.status_changed', description: 'When an event status changes' },
      { type: 'vendor.applied', description: 'When a vendor applies to an event' },
      { type: 'vendor.confirmed', description: 'When a vendor is confirmed for an event' },
      { type: 'vendor.declined', description: 'When a vendor is declined' },
      { type: 'sponsor.applied', description: 'When a sponsor applies to an event' },
      { type: 'sponsor.confirmed', description: 'When a sponsor is confirmed' },
      { type: 'sponsor.declined', description: 'When a sponsor is declined' },
      { type: 'task.created', description: 'When a task is created' },
      { type: 'task.completed', description: 'When a task is completed' },
    ]
    return apiSuccess(events)
  }),
})

// ============================================================================
// Streaming Chat Endpoint
// ============================================================================

const SYSTEM_PROMPT = `You are an expert AI event planning assistant for open-event, a platform that helps organizers create and manage events. You have access to tools that allow you to:

1. **Create and manage events** - You can create new events, update existing ones, and retrieve event details
2. **Search for vendors** - Find catering, AV, photography, and other service providers
3. **Search for sponsors** - Find companies interested in sponsoring events
4. **Get recommendations** - Get AI-matched vendor and sponsor recommendations for events
5. **Access user profile** - Understand the organizer's preferences and history

## How to help users:

1. **Understand their needs** - Ask clarifying questions about event type, date, size, budget, etc.
2. **Take action** - Use your tools to create events, search for vendors/sponsors, and help plan
3. **Be proactive** - Suggest relevant vendors or sponsors based on event details
4. **Confirm before acting** - For important actions (creating events, adding vendors), confirm with the user first

## Guidelines:

- Be conversational and helpful
- When you have enough information, USE YOUR TOOLS to take action
- Always confirm before creating events or adding vendors/sponsors
- Provide specific, actionable recommendations
- If searching returns no results, explain that the marketplace is growing
- Keep responses concise but informative

## Important:
- You MUST use your tools to perform actions. Don't just describe what could be done - actually do it!
- After gathering event details, call createEvent with the information
- When the user mentions needing a service, call searchVendors to find options
- Be proactive about suggesting next steps`

// Message type for conversation history
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCall[]
}

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle preflight OPTIONS request for CORS
http.route({
  path: '/api/chat/stream',
  method: 'OPTIONS',
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }),
})

// Handle preflight for tool execution endpoint
http.route({
  path: '/api/chat/execute-tool',
  method: 'OPTIONS',
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }),
})

// ============================================================================
// Direct Tool Execution Endpoint (for confirmed tools)
// ============================================================================

http.route({
  path: '/api/chat/execute-tool',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    // Parse request body
    const body = await request.json()
    const { toolName, toolArguments } = body as {
      toolName: ToolName
      toolArguments: Record<string, unknown>
    }

    if (!toolName) {
      return new Response(JSON.stringify({ error: 'Missing tool name' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get user identity from the Authorization header
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the user from the database
    const user = await ctx.runQuery(api.queries.auth.getCurrentUser)
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    try {
      // Execute the tool directly
      const result = await executeToolHandler(
        ctx,
        user._id,
        `confirmed-${Date.now()}`,
        toolName,
        toolArguments
      )

      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          summary: 'Tool execution failed',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
  }),
})

http.route({
  path: '/api/chat/stream',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    // Parse request body
    const body = await request.json()
    const { messages: clientMessages, userMessage, confirmedToolCalls } = body as {
      messages?: ChatMessage[]
      userMessage: string
      confirmedToolCalls?: string[]
    }

    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'Missing user message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get user identity from the Authorization header (Bearer token)
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the user from the database using the identity subject (user ID)
    const user = await ctx.runQuery(api.queries.auth.getCurrentUser)
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check rate limit
    const rateLimit = await ctx.runQuery(api.aiUsage.checkRateLimit, { userId: user._id })
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `You've used all ${rateLimit.limit} AI prompts for today. Your limit resets at midnight UTC.`,
          remaining: 0,
          limit: rateLimit.limit,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get user profile for context
    const profile = await ctx.runQuery(api.organizerProfiles.getMyProfile)

    // Build message history for OpenAI
    const chatHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: profile
          ? `${SYSTEM_PROMPT}\n\n## User Context:\n- Organization: ${profile.organizationName || 'Not set'}\n- Event Types: ${profile.eventTypes?.join(', ') || 'Not specified'}\n- Experience: ${profile.experienceLevel || 'Unknown'}`
          : SYSTEM_PROMPT,
      },
    ]

    // Add previous conversation history from client
    if (clientMessages && clientMessages.length > 0) {
      for (const msg of clientMessages) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          chatHistory.push({
            role: msg.role,
            content: msg.content,
          })
        }
      }
    }

    // Add the new user message
    chatHistory.push({
      role: 'user',
      content: userMessage,
    })

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Get available tools
    const tools = getOpenAITools()

    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        }

        try {
          const currentMessages = [...chatHistory]
          const allToolCalls: ToolCall[] = []
          const allToolResults: ToolResult[] = []
          const pendingConfirmations: ToolCall[] = []
          let finalMessage = ''
          let isComplete = false
          let entityId: string | undefined

          const MAX_ITERATIONS = 5
          let iteration = 0

          while (iteration < MAX_ITERATIONS) {
            iteration++

            // Send thinking event
            sendEvent('thinking', { iteration })

            // Create streaming completion
            const stream = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: currentMessages,
              tools,
              tool_choice: 'auto',
              temperature: 0.7,
              max_tokens: 1500,
              stream: true,
            })

            let currentContent = ''
            const currentToolCalls: Array<{
              id: string
              function: { name: string; arguments: string }
            }> = []

            // Process streaming chunks
            for await (const chunk of stream) {
              const delta = chunk.choices[0]?.delta

              // Stream text content
              if (delta?.content) {
                currentContent += delta.content
                sendEvent('text', { content: delta.content })
              }

              // Accumulate tool calls
              if (delta?.tool_calls) {
                for (const tc of delta.tool_calls) {
                  const index = tc.index
                  if (!currentToolCalls[index]) {
                    currentToolCalls[index] = {
                      id: tc.id || '',
                      function: { name: '', arguments: '' },
                    }
                  }
                  if (tc.id) currentToolCalls[index].id = tc.id
                  if (tc.function?.name) currentToolCalls[index].function.name += tc.function.name
                  if (tc.function?.arguments) currentToolCalls[index].function.arguments += tc.function.arguments
                }
              }
            }

            // If no tool calls, we're done
            if (currentToolCalls.length === 0) {
              finalMessage = currentContent
              break
            }

            // Process tool calls
            const toolCalls: ToolCall[] = currentToolCalls
              .filter((tc) => tc.id && tc.function.name)
              .map((tc) => {
                let parsedArgs: Record<string, unknown> = {}
                try {
                  parsedArgs = JSON.parse(tc.function.arguments)
                } catch {
                  // Continue with empty arguments
                }
                return {
                  id: tc.id,
                  name: tc.function.name as ToolName,
                  arguments: parsedArgs,
                }
              })

            // Add assistant message with tool calls to history
            currentMessages.push({
              role: 'assistant',
              content: currentContent,
              tool_calls: currentToolCalls.map((tc) => ({
                id: tc.id,
                type: 'function' as const,
                function: tc.function,
              })),
            })

            // Execute each tool call
            for (const toolCall of toolCalls) {
              allToolCalls.push(toolCall)

              // Send tool start event
              sendEvent('tool_start', {
                id: toolCall.id,
                name: toolCall.name,
                arguments: toolCall.arguments,
              })

              // Check if this tool requires confirmation
              if (toolRequiresConfirmation(toolCall.name)) {
                if (!confirmedToolCalls?.includes(toolCall.id)) {
                  pendingConfirmations.push(toolCall)
                  sendEvent('tool_pending', {
                    id: toolCall.id,
                    name: toolCall.name,
                    arguments: toolCall.arguments,
                  })

                  const placeholderResult: ToolResult = {
                    toolCallId: toolCall.id,
                    name: toolCall.name,
                    success: false,
                    error: 'Awaiting user confirmation',
                    summary: 'This action requires your confirmation',
                  }
                  allToolResults.push(placeholderResult)
                  currentMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(placeholderResult),
                  })
                  continue
                }
              }

              // Execute the tool
              const result = await executeToolHandler(
                ctx,
                user._id,
                toolCall.id,
                toolCall.name,
                toolCall.arguments
              )
              allToolResults.push(result)

              // Send tool result event
              sendEvent('tool_result', {
                id: toolCall.id,
                name: toolCall.name,
                success: result.success,
                summary: result.summary,
                data: result.data,
                error: result.error,
              })

              // Check if event was created
              if (result.name === 'createEvent' && result.success && result.data) {
                isComplete = true
                entityId = (result.data as { eventId: string }).eventId
              }

              // Add tool result to messages
              currentMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
              })
            }

            // If there are pending confirmations, stop and ask user
            if (pendingConfirmations.length > 0) {
              const confirmCompletion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                  ...currentMessages,
                  {
                    role: 'user',
                    content: 'The action requires user confirmation. Please explain what you are about to do and ask for confirmation.',
                  },
                ],
                temperature: 0.7,
                max_tokens: 500,
              })
              finalMessage = confirmCompletion.choices[0]?.message?.content || ''

              // Stream the confirmation message
              if (finalMessage) {
                sendEvent('text', { content: finalMessage })
              }
              break
            }
          }

          // Increment usage count for successful request
          await ctx.runMutation(internal.aiUsage.incrementUsageInternal, { userId: user._id })

          // Get updated remaining prompts
          const updatedRateLimit = await ctx.runQuery(api.aiUsage.checkRateLimit, { userId: user._id })

          // Send completion event
          sendEvent('done', {
            message: finalMessage,
            toolCalls: allToolCalls,
            toolResults: allToolResults,
            pendingConfirmations,
            isComplete,
            entityId,
            // Include rate limit info
            rateLimit: {
              remaining: updatedRateLimit.remaining,
              limit: updatedRateLimit.limit,
            },
          })
        } catch (error) {
          sendEvent('error', {
            message: error instanceof Error ? error.message : 'Unknown error',
          })
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }),
})

export default http
