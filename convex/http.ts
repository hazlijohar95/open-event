'use node'

import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { api } from './_generated/api'
import { streamText, type CoreMessage } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { AGENT_TOOLS, toolRequiresConfirmation } from './lib/agent/tools'
import { executeToolHandler } from './lib/agent/handlers'
import type { ToolName } from './lib/agent/types'
import type { Id } from './_generated/dataModel'

// ============================================================================
// System Prompt
// ============================================================================

const SYSTEM_PROMPT = `You are an expert AI event planning assistant for open-event, a platform that helps organizers create and manage events. You have access to tools that allow you to:

1. **Create and manage events** - You can create new events, update existing ones, and retrieve event details
2. **Search for vendors** - Find catering, AV, photography, and other service providers
3. **Search for sponsors** - Find companies interested in sponsoring events
4. **Access user profile** - Understand the organizer's preferences and history

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

// ============================================================================
// Convert tools to Vercel AI SDK format
// ============================================================================

function getAISDKTools() {
  const tools: Record<string, {
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, unknown>
      required?: string[]
    }
  }> = {}

  for (const tool of AGENT_TOOLS) {
    tools[tool.name] = {
      description: tool.description,
      parameters: tool.parameters as {
        type: 'object'
        properties: Record<string, unknown>
        required?: string[]
      },
    }
  }

  return tools
}

// ============================================================================
// HTTP Router
// ============================================================================

const http = httpRouter()

http.route({
  path: '/api/chat',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json()
      const { messages } = body as {
        messages: CoreMessage[]
      }

      // Get user from auth header (Clerk token)
      const user = await ctx.runQuery(api.queries.auth.getCurrentUser)

      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Get user profile for context
      const profile = await ctx.runQuery(api.organizerProfiles.getMyProfile)

      // Build system prompt with user context
      const systemPrompt = profile
        ? `${SYSTEM_PROMPT}\n\n## User Context:\n- Organization: ${profile.organizationName || 'Not set'}\n- Event Types: ${profile.eventTypes?.join(', ') || 'Not specified'}\n- Experience: ${profile.experienceLevel || 'Unknown'}`
        : SYSTEM_PROMPT

      // Create OpenAI provider
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })

      // Get AI SDK tools
      const tools = getAISDKTools()

      // Stream the response
      const result = streamText({
        model: openai('gpt-4o-mini'),
        system: systemPrompt,
        messages,
        tools,
        maxSteps: 5, // Allow multi-step agentic behavior
        onStepFinish: async ({ toolCalls, toolResults }) => {
          // Log tool execution for debugging
          if (toolCalls && toolCalls.length > 0) {
            console.log('Tool calls:', toolCalls.map(tc => tc.toolName))
          }
          if (toolResults && toolResults.length > 0) {
            console.log('Tool results:', toolResults.length)
          }
        },
        experimental_toolCallStreaming: true,
        // Handle tool execution
        async experimental_generateMessageId() {
          return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
        },
      })

      // Return streaming response
      return result.toDataStreamResponse({
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    } catch (error) {
      console.error('Chat API error:', error)
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Internal server error'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }),
})

// CORS preflight
http.route({
  path: '/api/chat',
  method: 'OPTIONS',
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
})

// ============================================================================
// Tool Execution Endpoint
// ============================================================================

http.route({
  path: '/api/chat/tool',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json()
      const { toolCallId, toolName, args } = body as {
        toolCallId: string
        toolName: string
        args: Record<string, unknown>
      }

      // Get user
      const user = await ctx.runQuery(api.queries.auth.getCurrentUser)

      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Check if tool requires confirmation
      if (toolRequiresConfirmation(toolName)) {
        // Return pending status - frontend should show confirmation UI
        return new Response(
          JSON.stringify({
            status: 'pending_confirmation',
            toolCallId,
            toolName,
            args,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        )
      }

      // Execute the tool
      const result = await executeToolHandler(
        ctx,
        user._id as Id<'users'>,
        toolCallId,
        toolName as ToolName,
        args
      )

      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    } catch (error) {
      console.error('Tool execution error:', error)
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Tool execution failed'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }),
})

http.route({
  path: '/api/chat/tool',
  method: 'OPTIONS',
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
})

// ============================================================================
// Confirm and Execute Endpoint
// ============================================================================

http.route({
  path: '/api/chat/confirm',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json()
      const { toolCallId, toolName, args, conversationId } = body as {
        toolCallId: string
        toolName: string
        args: Record<string, unknown>
        conversationId?: string
      }

      // Get user
      const user = await ctx.runQuery(api.queries.auth.getCurrentUser)

      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Execute the confirmed tool
      const result = await executeToolHandler(
        ctx,
        user._id as Id<'users'>,
        toolCallId,
        toolName as ToolName,
        args
      )

      // If event was created, link conversation
      if (result.name === 'createEvent' && result.success && result.data && conversationId) {
        const eventId = (result.data as { eventId: string }).eventId
        await ctx.runMutation(api.aiConversations.linkToEvent, {
          conversationId: conversationId as Id<'aiConversations'>,
          eventId: eventId as Id<'events'>,
        })
      }

      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    } catch (error) {
      console.error('Confirm execution error:', error)
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Confirm execution failed'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }),
})

http.route({
  path: '/api/chat/confirm',
  method: 'OPTIONS',
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }),
})

export default http
