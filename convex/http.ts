import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { auth } from './auth'
import OpenAI from 'openai'
import { api, internal } from './_generated/api'
import { getOpenAITools, toolRequiresConfirmation } from './lib/agent/tools'
import { executeToolHandler } from './lib/agent/handlers'
import type { ToolName, ToolCall, ToolResult } from './lib/agent/types'

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
