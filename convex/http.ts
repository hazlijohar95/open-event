import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { auth } from './auth'
import OpenAI from 'openai'
import { api, internal } from './_generated/api'
import { getOpenAITools, toolRequiresConfirmation } from './lib/agent/tools'
import { executeToolHandler } from './lib/agent/handlers'
import type { ToolName, ToolCall, ToolResult } from './lib/agent/types'
import { z } from 'zod'

// ============================================================================
// Request Validation Schemas
// ============================================================================

const VALID_TOOL_NAMES = [
  'createEvent',
  'updateEvent',
  'getEventDetails',
  'getUpcomingEvents',
  'searchVendors',
  'addVendorToEvent',
  'searchSponsors',
  'addSponsorToEvent',
  'getUserProfile',
  'getRecommendedVendors',
  'getRecommendedSponsors',
  'getEventVendors',
  'getEventSponsors',
] as const

const executeToolSchema = z.object({
  toolName: z.enum(VALID_TOOL_NAMES),
  toolArguments: z.record(z.string(), z.unknown()).default({}),
})

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(50000),
  toolCalls: z.array(z.unknown()).optional(),
})

const chatStreamSchema = z.object({
  messages: z.array(chatMessageSchema).optional(),
  userMessage: z.string().min(1).max(10000),
  confirmedToolCalls: z.array(z.string()).optional(),
})

// ============================================================================
// HTTP Router
// ============================================================================

const http = httpRouter()

// Convex Auth HTTP routes (handles OAuth callbacks, magic links, etc.)
auth.addHttpRoutes(http)

// Health check endpoint
http.route({
  path: '/api/health',
  method: 'GET',
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({ status: 'ok', timestamp: Date.now() }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }),
})

// ============================================================================
// Streaming Chat Endpoint
// ============================================================================

const SYSTEM_PROMPT = `You are an AI event creation assistant for Open Event. Your PRIMARY job is to quickly help users CREATE events.

## Your Approach:

1. **Be concise** - Keep responses to 2-3 sentences max
2. **Act quickly** - After getting basic info (title, date, type), CREATE the event immediately
3. **Ask only essential questions** - Don't overwhelm users with long lists of what they COULD provide

## Event Creation Flow:

When a user wants to create an event:
1. If they give you enough info (event type + rough date), call createEvent immediately
2. If missing critical info, ask ONE quick question like: "What date are you planning for?"
3. Use sensible defaults for optional fields - don't ask about every possible detail

## Minimum Info Needed to Create Event:
- Title or event type (required)
- Approximate date (required)
- Everything else can use defaults or be added later

## Response Style:

- SHORT responses (1-3 sentences)
- NO bullet lists of tips or suggestions unless asked
- NO lengthy explanations of what info you need
- DIRECT action: "I'll create that for you now" or "What date works for you?"

## Example Good Responses:

User: "I want to create a workshop"
Good: "Got it! What date are you thinking for the workshop?"

User: "A tech meetup next Friday"
Good: "I'll create your tech meetup for next Friday now."
[Then call createEvent]

User: "Conference in January for 200 people"
Good: "Creating your conference for January with 200 expected attendees."
[Then call createEvent with title, date, expectedAttendees]

## What NOT to do:

- DON'T list 10 things the user could tell you
- DON'T give generic event planning advice
- DON'T explain all your capabilities
- DON'T ask multiple questions at once

## Tools Available:

- createEvent: Create events (requires confirmation)
- searchVendors/searchSponsors: Find service providers
- getRecommendedVendors/getRecommendedSponsors: Get AI-matched recommendations
- getUserProfile: Get user context

Remember: Your job is to CREATE events quickly, not to be an event planning consultant.`

// ============================================================================
// CORS Configuration
// ============================================================================

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://open-event.vercel.app',
  'https://openevent.app',
  // Add production domains as needed
]

function getCorsHeaders(request: Request) {
  const origin = request.headers.get('Origin')
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

// Handle preflight OPTIONS request for CORS
http.route({
  path: '/api/chat/stream',
  method: 'OPTIONS',
  handler: httpAction(async (_, request) => {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request),
    })
  }),
})

// Handle preflight for tool execution endpoint
http.route({
  path: '/api/chat/execute-tool',
  method: 'OPTIONS',
  handler: httpAction(async (_, request) => {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request),
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
    const headers = { ...getCorsHeaders(request), 'Content-Type': 'application/json' }

    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers,
      })
    }

    const parsed = executeToolSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request body',
          details: parsed.error.issues.map((i) => i.message),
        }),
        { status: 400, headers }
      )
    }

    const { toolName, toolArguments } = parsed.data

    // Get user identity from the Authorization header
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers,
      })
    }

    // Get the user from the database
    const user = await ctx.runQuery(api.queries.auth.getCurrentUser)
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers,
      })
    }

    // Check rate limit (uses same limit as chat endpoint)
    const rateLimit = await ctx.runQuery(api.aiUsage.checkRateLimit, { userId: user._id })
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `You've used all ${rateLimit.limit} AI prompts for today.`,
          remaining: 0,
          limit: rateLimit.limit,
        }),
        { status: 429, headers }
      )
    }

    try {
      // Execute the tool directly
      const result = await executeToolHandler(
        ctx,
        user._id,
        `confirmed-${Date.now()}`,
        toolName as ToolName,
        toolArguments
      )

      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers,
      })
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          summary: 'Tool execution failed',
        }),
        { status: 500, headers }
      )
    }
  }),
})

http.route({
  path: '/api/chat/stream',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const headers = { ...getCorsHeaders(request), 'Content-Type': 'application/json' }

    // Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers,
      })
    }

    const parsed = chatStreamSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request body',
          details: parsed.error.issues.map((i) => i.message),
        }),
        { status: 400, headers }
      )
    }

    const { messages: clientMessages, userMessage, confirmedToolCalls } = parsed.data

    // Get user identity from the Authorization header (Bearer token)
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers,
      })
    }

    // Get the user from the database using the identity subject (user ID)
    const user = await ctx.runQuery(api.queries.auth.getCurrentUser)
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers,
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
          headers,
        }
      )
    }

    // Get user profile for context
    const profile = await ctx.runQuery(api.organizerProfiles.getMyProfile)

    // Build message history for OpenAI
    // Include current date so AI uses correct year for dates
    const today = new Date()
    const dateContext = `\n\n## Current Date:\nToday is ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. When users mention dates like "December 25th" without a year, use the NEXT upcoming occurrence (which would be ${today.getFullYear()} or ${today.getFullYear() + 1} depending on whether it has passed).`

    const chatHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: profile
          ? `${SYSTEM_PROMPT}${dateContext}\n\n## User Context:\n- Organization: ${profile.organizationName || 'Not set'}\n- Event Types: ${profile.eventTypes?.join(', ') || 'Not specified'}\n- Experience: ${profile.experienceLevel || 'Unknown'}`
          : `${SYSTEM_PROMPT}${dateContext}`,
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
        ...getCorsHeaders(request),
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }),
})

export default http
