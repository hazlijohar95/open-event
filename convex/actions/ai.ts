'use node'

import { v } from 'convex/values'
import { action } from '../_generated/server'
import { api } from '../_generated/api'
// Temporarily commented out to fix esbuild bundling issue
// import OpenAI from 'openai'

const EVENT_CREATION_SYSTEM_PROMPT = `You are an expert event planning assistant helping organizers create events. Your goal is to gather all necessary information to set up a successful event.

You should ask about and help with:
1. Event basics: type, name, description
2. Date and time preferences
3. Location (in-person, virtual, or hybrid)
4. Expected attendance and target audience
5. Budget considerations
6. Vendor requirements (catering, AV, photography, etc.)
7. Sponsor opportunities

Guidelines:
- Be friendly, professional, and conversational
- Ask one or two related questions at a time to avoid overwhelming the user
- Provide helpful suggestions based on their event type
- When you have enough info, offer to create the event
- Keep responses concise but helpful
- Use markdown for formatting when appropriate

When you think you have gathered enough information to create an event, include a JSON block in your response with the extracted data:

\`\`\`json:event_data
{
  "ready": true,
  "title": "Event Title",
  "description": "Event description",
  "eventType": "conference|hackathon|workshop|meetup|corporate|other",
  "startDate": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "locationType": "in-person|virtual|hybrid",
  "venueName": "Venue name or null",
  "expectedAttendees": number,
  "budget": number or null,
  "requirements": {
    "catering": boolean,
    "av": boolean,
    "photography": boolean,
    "security": boolean,
    "transportation": boolean,
    "decoration": boolean
  }
}
\`\`\`

Only include this JSON block when you have enough information and the user confirms they want to create the event.`

export const chat = action({
  args: {
    conversationId: v.id('aiConversations'),
    userMessage: v.string(),
  },
  handler: async (ctx, args) => {
    // Get conversation history
    const messages = await ctx.runQuery(api.aiConversations.getMessages, {
      conversationId: args.conversationId,
    })

    // Build message history for OpenAI
    // Temporarily commented out - using agent.ts instead
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatHistory: any[] = [
      { role: 'system', content: EVENT_CREATION_SYSTEM_PROMPT },
    ]

    // Add conversation history
    for (const msg of messages) {
      chatHistory.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })
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

    // Call OpenAI - Temporarily disabled, use agent.ts instead
    // const openai = new OpenAI({
    //   apiKey: process.env.OPENAI_API_KEY,
    // })

    // const completion = await openai.chat.completions.create({
    //   model: 'gpt-4o-mini',
    //   messages: chatHistory,
    //   temperature: 0.7,
    //   max_tokens: 1000,
    // })

    // const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.'
    const assistantMessage = 'This action has been moved to agent.ts. Please use api.actions.agent.chat instead.'

    // Check if the response contains event data
    let extractedFields: string[] = []
    let suggestedActions: string[] = []

    if (assistantMessage.includes('```json:event_data')) {
      extractedFields = ['event_data']
      suggestedActions = ['create_event']
    }

    // Save assistant message
    await ctx.runMutation(api.aiConversations.addAssistantMessage, {
      conversationId: args.conversationId,
      content: assistantMessage,
      metadata: {
        extractedFields: extractedFields.length > 0 ? extractedFields : undefined,
        suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
        model: 'gpt-4o-mini',
      },
    })

    return {
      message: assistantMessage,
      hasEventData: extractedFields.includes('event_data'),
    }
  },
})

// Parse event data from AI response
export const parseEventData = action({
  args: {
    content: v.string(),
  },
  handler: async (_ctx, args) => {
    const jsonMatch = args.content.match(/```json:event_data\n([\s\S]*?)```/)
    if (!jsonMatch) return null

    try {
      const eventData = JSON.parse(jsonMatch[1])
      return eventData
    } catch {
      return null
    }
  },
})
