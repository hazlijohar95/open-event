/**
 * Admin Management
 *
 * Handles admin account CRUD operations.
 * Only superadmin can create/manage admin accounts.
 */

import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { assertRole, ROLE_HIERARCHY } from './lib/auth'

// ============================================================================
// Queries
// ============================================================================

/**
 * List all admin users
 * Only accessible by superadmin
 */
export const listAdmins = query({
  args: {},
  handler: async (ctx) => {
    await assertRole(ctx, 'superadmin')

    const admins = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'admin'))
      .collect()

    return admins.map((admin) => ({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      status: admin.status || 'active',
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    }))
  },
})

/**
 * Get a single admin by ID
 * Only accessible by superadmin
 */
export const getAdmin = query({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    await assertRole(ctx, 'superadmin')

    const admin = await ctx.db.get(args.id)
    if (!admin || admin.role !== 'admin') {
      return null
    }

    return {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      status: admin.status || 'active',
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    }
  },
})

/**
 * List all users (for admin management overview)
 * Accessible by admin and superadmin
 *
 * Deduplicates users by email, keeping the one with the highest role
 * or most recent activity to handle auth sync issues.
 */
export const listAllUsers = query({
  args: {
    role: v.optional(v.union(v.literal('admin'), v.literal('organizer'), v.literal('superadmin'))),
    status: v.optional(
      v.union(v.literal('active'), v.literal('suspended'), v.literal('pending'))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await assertRole(ctx, 'admin')

    let users

    // Filter by role if specified
    if (args.role) {
      users = await ctx.db
        .query('users')
        .withIndex('by_role', (q) => q.eq('role', args.role))
        .collect()
    } else {
      users = await ctx.db.query('users').collect()
    }

    // Deduplicate by email - keep the user with highest role or most recent update
    const emailMap = new Map<string, typeof users[0]>()
    for (const user of users) {
      if (!user.email) continue

      const existing = emailMap.get(user.email)
      if (!existing) {
        emailMap.set(user.email, user)
      } else {
        // Keep the one with higher role, or if same role, keep the more recently updated
        const existingRoleLevel = ROLE_HIERARCHY[existing.role || 'organizer'] || 1
        const userRoleLevel = ROLE_HIERARCHY[user.role || 'organizer'] || 1

        if (userRoleLevel > existingRoleLevel) {
          emailMap.set(user.email, user)
        } else if (
          userRoleLevel === existingRoleLevel &&
          (user.updatedAt || 0) > (existing.updatedAt || 0)
        ) {
          emailMap.set(user.email, user)
        }
      }
    }

    let deduplicatedUsers = Array.from(emailMap.values())

    // Filter by status in memory if specified
    if (args.status) {
      deduplicatedUsers = deduplicatedUsers.filter(
        (u) => (u.status || 'active') === args.status
      )
    }

    // Sort by creation date (newest first)
    deduplicatedUsers.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

    // Apply limit
    const limit = args.limit || 100
    const limitedUsers = deduplicatedUsers.slice(0, limit)

    return limitedUsers.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'organizer',
      status: user.status || 'active',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      suspendedAt: user.suspendedAt,
      suspendedReason: user.suspendedReason,
    }))
  },
})

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new admin account
 * Only superadmin can create admins
 *
 * Note: This creates a placeholder user record. The admin will need to
 * complete authentication via the auth flow with this email.
 */
export const createAdmin = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const superadmin = await assertRole(ctx, 'superadmin')

    // Check if user with this email already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('email', (q) => q.eq('email', args.email))
      .first()

    if (existingUser) {
      // If user exists, upgrade them to admin
      if (existingUser.role === 'admin' || existingUser.role === 'superadmin') {
        throw new Error('User is already an admin or superadmin')
      }

      await ctx.db.patch(existingUser._id, {
        role: 'admin',
        updatedAt: Date.now(),
      })

      // Log the action
      await ctx.db.insert('moderationLogs', {
        adminId: superadmin._id,
        action: 'admin_created',
        targetType: 'user',
        targetId: existingUser._id,
        reason: `Upgraded existing user to admin`,
        metadata: { previousRole: existingUser.role },
        createdAt: Date.now(),
      })

      return existingUser._id
    }

    // Create new admin user
    const now = Date.now()
    const adminId = await ctx.db.insert('users', {
      email: args.email,
      name: args.name,
      role: 'admin',
      status: 'pending', // Pending until they complete auth
      createdAt: now,
      updatedAt: now,
    })

    // Log the action
    await ctx.db.insert('moderationLogs', {
      adminId: superadmin._id,
      action: 'admin_created',
      targetType: 'user',
      targetId: adminId,
      reason: `Created new admin account`,
      createdAt: now,
    })

    return adminId
  },
})

/**
 * Remove admin role from a user
 * Only superadmin can remove admins
 */
export const removeAdmin = mutation({
  args: {
    adminId: v.id('users'),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const superadmin = await assertRole(ctx, 'superadmin')

    const admin = await ctx.db.get(args.adminId)
    if (!admin) {
      throw new Error('User not found')
    }

    if (admin.role !== 'admin') {
      throw new Error('User is not an admin')
    }

    // Cannot remove yourself
    if (admin._id === superadmin._id) {
      throw new Error('Cannot remove yourself as admin')
    }

    // Downgrade to organizer
    await ctx.db.patch(args.adminId, {
      role: 'organizer',
      updatedAt: Date.now(),
    })

    // Log the action
    await ctx.db.insert('moderationLogs', {
      adminId: superadmin._id,
      action: 'admin_removed',
      targetType: 'user',
      targetId: args.adminId,
      reason: args.reason || 'Admin role removed',
      metadata: { previousRole: 'admin' },
      createdAt: Date.now(),
    })

    return { success: true }
  },
})

/**
 * Update admin details
 * Only superadmin can update admin details
 */
export const updateAdmin = mutation({
  args: {
    adminId: v.id('users'),
    name: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal('active'), v.literal('suspended'), v.literal('pending'))
    ),
  },
  handler: async (ctx, args) => {
    await assertRole(ctx, 'superadmin')

    const admin = await ctx.db.get(args.adminId)
    if (!admin) {
      throw new Error('User not found')
    }

    if (admin.role !== 'admin') {
      throw new Error('User is not an admin')
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    }

    if (args.name !== undefined) {
      updates.name = args.name
    }

    if (args.status !== undefined) {
      updates.status = args.status
    }

    await ctx.db.patch(args.adminId, updates)

    return { success: true }
  },
})
