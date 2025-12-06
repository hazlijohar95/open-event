import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getCurrentUser } from './auth'

// Create a new AI conversation
export const create = mutation({
  args: {
    purpose: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) throw new Error('Not authenticated')

    return await ctx.db.insert('aiConversations', {
      userId: user._id,
      status: 'active',
      purpose: args.purpose ?? 'event-creation',
      createdAt: Date.now(),
    })
  },
})

// Get a conversation by ID
export const get = query({
  args: { id: v.id('aiConversations') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) return null

    const conversation = await ctx.db.get(args.id)
    if (!conversation || conversation.userId !== user._id) return null

    return conversation
  },
})

// Get the active conversation for event creation, or return null
export const getActiveForEventCreation = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    if (!user) return null

    const conversations = await ctx.db
      .query('aiConversations')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .filter((q) =>
        q.and(
          q.eq(q.field('status'), 'active'),
          q.eq(q.field('purpose'), 'event-creation')
        )
      )
      .order('desc')
      .first()

    return conversations
  },
})

// Get all messages for a conversation
export const getMessages = query({
  args: { conversationId: v.id('aiConversations') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) return []

    // Verify user owns this conversation
    const conversation = await ctx.db.get(args.conversationId)
    if (!conversation || conversation.userId !== user._id) return []

    return await ctx.db
      .query('aiMessages')
      .withIndex('by_conversation', (q) => q.eq('conversationId', args.conversationId))
      .order('asc')
      .collect()
  },
})

// Send a user message
export const sendMessage = mutation({
  args: {
    conversationId: v.id('aiConversations'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) throw new Error('Not authenticated')

    // Verify user owns this conversation
    const conversation = await ctx.db.get(args.conversationId)
    if (!conversation || conversation.userId !== user._id) {
      throw new Error('Conversation not found')
    }

    // Insert user message
    const messageId = await ctx.db.insert('aiMessages', {
      conversationId: args.conversationId,
      role: 'user',
      content: args.content,
      createdAt: Date.now(),
    })

    // Update conversation timestamp
    await ctx.db.patch(args.conversationId, {
      updatedAt: Date.now(),
    })

    return messageId
  },
})

// Add an assistant message (called by AI action)
export const addAssistantMessage = mutation({
  args: {
    conversationId: v.id('aiConversations'),
    content: v.string(),
    metadata: v.optional(
      v.object({
        extractedFields: v.optional(v.array(v.string())),
        suggestedActions: v.optional(v.array(v.string())),
        model: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('aiMessages', {
      conversationId: args.conversationId,
      role: 'assistant',
      content: args.content,
      metadata: args.metadata,
      createdAt: Date.now(),
    })
  },
})

// Update conversation with extracted event data
export const updateContext = mutation({
  args: {
    conversationId: v.id('aiConversations'),
    context: v.object({
      eventType: v.optional(v.string()),
      extractedData: v.optional(v.any()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) throw new Error('Not authenticated')

    const conversation = await ctx.db.get(args.conversationId)
    if (!conversation || conversation.userId !== user._id) {
      throw new Error('Conversation not found')
    }

    await ctx.db.patch(args.conversationId, {
      context: args.context,
      updatedAt: Date.now(),
    })
  },
})

// Link conversation to created event
export const linkToEvent = mutation({
  args: {
    conversationId: v.id('aiConversations'),
    eventId: v.id('events'),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) throw new Error('Not authenticated')

    const conversation = await ctx.db.get(args.conversationId)
    if (!conversation || conversation.userId !== user._id) {
      throw new Error('Conversation not found')
    }

    await ctx.db.patch(args.conversationId, {
      eventId: args.eventId,
      status: 'completed',
      updatedAt: Date.now(),
    })
  },
})
