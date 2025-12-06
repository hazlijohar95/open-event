'use node'

import { v } from 'convex/values'
import { action } from '../_generated/server'
import { api } from '../_generated/api'
import type { Id } from '../_generated/dataModel'
import OpenAI from 'openai'
import { getOpenAITools, toolRequiresConfirmation } from '../lib/agent/tools'
import { executeToolHandler } from '../lib/agent/handlers'
import type { ToolName, ToolCall, ToolResult, AgentResponse } from '../lib/agent/types'

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
// Main Agent Action
// ============================================================================

export const chat = action({
  args: {
    conversationId: v.id('aiConversations'),
    userMessage: v.string(),
    confirmedToolCalls: v.optional(v.array(v.string())), // IDs of tool calls the user confirmed
  },
  handler: async (ctx, args): Promise<AgentResponse> => {
    // Get conversation history
    const messages = await ctx.runQuery(api.aiConversations.getMessages, {
      conversationId: args.conversationId,
    })

    // Get user profile for context
    const profile = await ctx.runQuery(api.organizerProfiles.getMyProfile)
    const user = await ctx.runQuery(api.queries.auth.getCurrentUser)

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Build message history for OpenAI
    const chatHistory: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: profile
          ? `${SYSTEM_PROMPT}\n\n## User Context:\n- Organization: ${profile.organizationName || 'Not set'}\n- Event Types: ${profile.eventTypes?.join(', ') || 'Not specified'}\n- Experience: ${profile.experienceLevel || 'Unknown'}`
          : SYSTEM_PROMPT,
      },
    ]

    // Add conversation history
    for (const msg of messages) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        chatHistory.push({
          role: msg.role,
          content: msg.content,
        })
      }
    }

    // Add the new user message
    chatHistory.push({
      role: 'user',
      content: args.userMessage,
    })

    // Save user message to database
    await ctx.runMutation(api.aiConversations.sendMessage, {
      conversationId: args.conversationId,
      content: args.userMessage,
    })

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Get available tools
    const tools = getOpenAITools()

    // Agentic loop - keep running until we get a final response
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

      // Call OpenAI with tools
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: currentMessages,
        tools,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 1500,
      })

      const choice = completion.choices[0]
      if (!choice) break

      const assistantMessage = choice.message

      // If there are no tool calls, we're done
      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        finalMessage = assistantMessage.content || ''
        break
      }

      // Process tool calls with safe JSON parsing
      const toolCalls: ToolCall[] = []
      for (const tc of assistantMessage.tool_calls) {
        const toolCall = tc as { id: string; function: { name: string; arguments: string } }
        let parsedArgs: Record<string, unknown> = {}
        try {
          parsedArgs = JSON.parse(toolCall.function.arguments)
        } catch (parseError) {
          console.error(`Failed to parse tool arguments for ${toolCall.function.name}:`, parseError)
          // Continue with empty arguments rather than failing the whole request
        }
        toolCalls.push({
          id: toolCall.id,
          name: toolCall.function.name as ToolName,
          arguments: parsedArgs,
        })
      }

      // Add assistant message with tool calls to history
      currentMessages.push({
        role: 'assistant',
        content: assistantMessage.content,
        tool_calls: assistantMessage.tool_calls,
      })

      // Execute each tool call
      for (const toolCall of toolCalls) {
        allToolCalls.push(toolCall)

        // Check if this tool requires confirmation
        if (toolRequiresConfirmation(toolCall.name)) {
          // Check if this tool was already confirmed
          if (!args.confirmedToolCalls?.includes(toolCall.id)) {
            pendingConfirmations.push(toolCall)
            // Add a placeholder result
            const placeholderResult: ToolResult = {
              toolCallId: toolCall.id,
              name: toolCall.name,
              success: false,
              error: 'Awaiting user confirmation',
              summary: `This action requires your confirmation`,
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
        // Get a response that acknowledges the pending action
        const confirmCompletion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            ...currentMessages,
            {
              role: 'user',
              content:
                'The action requires user confirmation. Please explain what you are about to do and ask for confirmation.',
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        })
        finalMessage = confirmCompletion.choices[0]?.message?.content || ''
        break
      }
    }

    // Build response message with tool results
    let responseContent = finalMessage

    // Add tool execution summaries if any tools were run
    if (allToolResults.length > 0) {
      const executedResults = allToolResults.filter(
        (r) => r.error !== 'Awaiting user confirmation'
      )
      if (executedResults.length > 0 && !finalMessage.includes('successfully')) {
        const summaries = executedResults.map((r) => `- ${r.summary}`).join('\n')
        responseContent = `${finalMessage}\n\n**Actions taken:**\n${summaries}`
      }
    }

    // Save assistant response
    await ctx.runMutation(api.aiConversations.addAssistantMessage, {
      conversationId: args.conversationId,
      content: responseContent,
      metadata: {
        model: 'gpt-4o-mini',
        extractedFields: allToolCalls.map((tc) => tc.name),
        suggestedActions: pendingConfirmations.map((tc) => tc.name),
      },
    })

    return {
      message: responseContent,
      toolCalls: allToolCalls,
      toolResults: allToolResults,
      pendingConfirmations,
      isComplete,
      entityId: entityId as Id<'events'> | undefined,
    }
  },
})

// ============================================================================
// Confirm and Execute Action
// ============================================================================

export const confirmAndExecute = action({
  args: {
    conversationId: v.id('aiConversations'),
    toolCallId: v.string(),
    toolName: v.string(),
    toolArguments: v.any(),
  },
  handler: async (ctx, args): Promise<ToolResult> => {
    const user = await ctx.runQuery(api.queries.auth.getCurrentUser)
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Execute the confirmed tool
    const result = await executeToolHandler(
      ctx,
      user._id,
      args.toolCallId,
      args.toolName as ToolName,
      args.toolArguments
    )

    // If event was created, link conversation
    if (result.name === 'createEvent' && result.success && result.data) {
      const eventId = (result.data as { eventId: string }).eventId
      await ctx.runMutation(api.aiConversations.linkToEvent, {
        conversationId: args.conversationId,
        eventId: eventId as Id<'events'>,
      })
    }

    // Save a message about the executed action
    await ctx.runMutation(api.aiConversations.addAssistantMessage, {
      conversationId: args.conversationId,
      content: result.success
        ? `Action completed: ${result.summary}`
        : `Action failed: ${result.error}`,
      metadata: {
        extractedFields: [result.name],
      },
    })

    return result
  },
})
