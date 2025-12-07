import { v } from 'convex/values'
import { query, mutation, internalMutation } from './_generated/server'
import { getCurrentUser, isAdminRole } from './lib/auth'
import type { Id } from './_generated/dataModel'

// Default daily limit for free users
const DEFAULT_DAILY_LIMIT = 5

// Get today's date string in YYYY-MM-DD format
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get current user's AI usage stats
 */
export const getMyUsage = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    if (!user) return null

    const today = getTodayDateString()

    // Get or create usage record
    const usage = await ctx.db
      .query('aiUsage')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first()

    if (!usage) {
      // No usage record yet - user has full quota
      return {
        promptsUsed: 0,
        promptsRemaining: DEFAULT_DAILY_LIMIT,
        dailyLimit: DEFAULT_DAILY_LIMIT,
        totalPrompts: 0,
        resetsAt: getNextResetTime(),
      }
    }

    // Check if we need to reset (new day)
    const promptCount = usage.lastResetDate === today ? usage.promptCount : 0
    const dailyLimit = usage.dailyLimit ?? DEFAULT_DAILY_LIMIT

    return {
      promptsUsed: promptCount,
      promptsRemaining: Math.max(0, dailyLimit - promptCount),
      dailyLimit,
      totalPrompts: usage.totalPrompts ?? 0,
      resetsAt: getNextResetTime(),
    }
  },
})

/**
 * Check if user can make an AI request (has remaining quota)
 * Returns { allowed: boolean, remaining: number, limit: number }
 */
export const checkRateLimit = query({
  args: {
    userId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    // If userId provided, use it (for internal calls), otherwise get current user
    let userId: Id<'users'> | null = args.userId ?? null

    if (!userId) {
      const user = await getCurrentUser(ctx)
      if (!user) {
        return { allowed: false, remaining: 0, limit: 0, reason: 'Not authenticated' }
      }
      userId = user._id

      // Admins have unlimited access
      if (isAdminRole(user.role)) {
        return { allowed: true, remaining: 999, limit: 999, reason: 'Admin access' }
      }
    }

    const today = getTodayDateString()

    const usage = await ctx.db
      .query('aiUsage')
      .withIndex('by_user', (q) => q.eq('userId', userId!))
      .first()

    if (!usage) {
      // No usage yet - allowed
      return {
        allowed: true,
        remaining: DEFAULT_DAILY_LIMIT,
        limit: DEFAULT_DAILY_LIMIT,
      }
    }

    // Check if we need to reset (new day)
    const promptCount = usage.lastResetDate === today ? usage.promptCount : 0
    const dailyLimit = usage.dailyLimit ?? DEFAULT_DAILY_LIMIT
    const remaining = dailyLimit - promptCount

    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      limit: dailyLimit,
      reason: remaining <= 0 ? 'Daily limit reached' : undefined,
    }
  },
})

/**
 * Increment usage count after a successful AI request
 */
export const incrementUsage = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)
    if (!user) return { success: false, error: 'Not authenticated' }

    // Admins don't count against limits
    if (isAdminRole(user.role)) {
      return { success: true }
    }

    const today = getTodayDateString()
    const now = Date.now()

    const usage = await ctx.db
      .query('aiUsage')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first()

    if (!usage) {
      // Create new usage record
      await ctx.db.insert('aiUsage', {
        userId: user._id,
        promptCount: 1,
        lastResetDate: today,
        totalPrompts: 1,
        createdAt: now,
        updatedAt: now,
      })
    } else {
      // Update existing record
      const isNewDay = usage.lastResetDate !== today
      await ctx.db.patch(usage._id, {
        promptCount: isNewDay ? 1 : usage.promptCount + 1,
        lastResetDate: today,
        totalPrompts: (usage.totalPrompts ?? 0) + 1,
        updatedAt: now,
      })
    }

    return { success: true }
  },
})

/**
 * Internal mutation to increment usage (for HTTP actions)
 */
export const incrementUsageInternal = internalMutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const today = getTodayDateString()
    const now = Date.now()

    const usage = await ctx.db
      .query('aiUsage')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (!usage) {
      await ctx.db.insert('aiUsage', {
        userId: args.userId,
        promptCount: 1,
        lastResetDate: today,
        totalPrompts: 1,
        createdAt: now,
        updatedAt: now,
      })
    } else {
      const isNewDay = usage.lastResetDate !== today
      await ctx.db.patch(usage._id, {
        promptCount: isNewDay ? 1 : usage.promptCount + 1,
        lastResetDate: today,
        totalPrompts: (usage.totalPrompts ?? 0) + 1,
        updatedAt: now,
      })
    }

    return { success: true }
  },
})

/**
 * Admin: Set custom daily limit for a user
 */
export const setUserLimit = mutation({
  args: {
    userId: v.id('users'),
    dailyLimit: v.number(),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentUser(ctx)
    if (!admin || !isAdminRole(admin.role)) {
      throw new Error('Unauthorized')
    }

    const usage = await ctx.db
      .query('aiUsage')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    const now = Date.now()

    if (!usage) {
      await ctx.db.insert('aiUsage', {
        userId: args.userId,
        promptCount: 0,
        lastResetDate: getTodayDateString(),
        dailyLimit: args.dailyLimit,
        totalPrompts: 0,
        createdAt: now,
        updatedAt: now,
      })
    } else {
      await ctx.db.patch(usage._id, {
        dailyLimit: args.dailyLimit,
        updatedAt: now,
      })
    }

    return { success: true }
  },
})

/**
 * Admin: Reset a user's daily usage
 */
export const resetUserUsage = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentUser(ctx)
    if (!admin || !isAdminRole(admin.role)) {
      throw new Error('Unauthorized')
    }

    const usage = await ctx.db
      .query('aiUsage')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first()

    if (usage) {
      await ctx.db.patch(usage._id, {
        promptCount: 0,
        lastResetDate: getTodayDateString(),
        updatedAt: Date.now(),
      })
    }

    return { success: true }
  },
})

// Helper: Get next reset time (midnight UTC)
function getNextResetTime(): number {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  tomorrow.setUTCHours(0, 0, 0, 0)
  return tomorrow.getTime()
}
