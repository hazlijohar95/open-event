/**
 * Custom Authentication System
 * Uses actions for bcrypt (which needs setTimeout) and internal mutations for DB writes
 *
 * Security Features:
 * - Short-lived access tokens (15 minutes)
 * - Long-lived refresh tokens (7 days) with rotation
 * - Strong password requirements (12+ chars, complexity)
 * - httpOnly cookie support via HTTP endpoints
 */

import { v } from 'convex/values'
import { action, internalAction, internalMutation, internalQuery, query } from './_generated/server'
import { internal } from './_generated/api'
import bcrypt from 'bcryptjs'
import { validatePassword } from './lib/passwordValidation'
import { isValidEmail } from './lib/emailValidation'
import type { Id } from './_generated/dataModel'

// Token expiry constants
const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000 // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type UserRole = 'superadmin' | 'admin' | 'organizer'
type UserStatus = 'active' | 'suspended' | 'pending'

interface PublicUser {
  _id: Id<'users'>
  email: string | undefined
  name: string | undefined
  role: UserRole | undefined
  image: string | undefined
  status?: UserStatus | undefined
}

interface AuthResult {
  userId: Id<'users'>
  accessToken: string
  refreshToken: string
  sessionId: Id<'sessions'>
  accessTokenExpiresAt: number
  user: PublicUser
}

interface SignInResult extends AuthResult {
  user: PublicUser
}

interface SignInInternalResult {
  success: boolean
  error?: string
  accessToken?: string
  refreshToken?: string
  accessTokenExpiresAt?: number
  user?: PublicUser
}

interface RefreshResult {
  success: boolean
  error?: string
  accessToken?: string
  refreshToken?: string
  accessTokenExpiresAt?: number
  user?: PublicUser
}

// Signup action - Create new user account
export const signup = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<AuthResult> => {
    // Validate email format
    if (!isValidEmail(args.email)) {
      throw new Error('Invalid email format')
    }

    // Validate password strength using new requirements
    const passwordValidation = validatePassword(args.password)
    if (!passwordValidation.isValid) {
      throw new Error(`Password requirements not met: ${passwordValidation.errors.join(', ')}`)
    }

    // Check if user already exists
    const existingUser = await ctx.runQuery(internal.customAuth.checkEmailExists, {
      email: args.email.toLowerCase(),
    })

    if (existingUser) {
      throw new Error('Email already exists')
    }

    // Hash password (this is why we need an action - bcrypt uses setTimeout)
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(args.password, saltRounds)

    // Create user via internal mutation
    const result = await ctx.runMutation(internal.customAuth.createUserWithSession, {
      email: args.email.toLowerCase(),
      name: args.name,
      passwordHash,
    })

    // Send verification email (don't block on this - it can fail without breaking signup)
    try {
      await ctx.runAction(internal.emailVerification.sendVerificationEmail, {
        userId: result.userId,
      })
    } catch (error) {
      console.error('Failed to send verification email:', error)
      // Continue anyway - user can resend verification email later
    }

    return result
  },
})

// Signin action - Login existing user
export const signin = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<SignInResult> => {
    // Find user by email
    const user = await ctx.runQuery(internal.customAuth.getUserByEmail, {
      email: args.email.toLowerCase(),
    })

    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Check if user has passwordHash (might be OAuth user)
    if (!user.passwordHash) {
      throw new Error('Please sign in with Google')
    }

    // Verify password (this is why we need an action - bcrypt uses setTimeout)
    const isValidPassword = await bcrypt.compare(args.password, user.passwordHash)
    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }

    // Check account status
    if (user.status === 'suspended') {
      throw new Error('Your account has been suspended')
    }

    // Create session via internal mutation
    const result = await ctx.runMutation(internal.customAuth.createSessionForUser, {
      userId: user._id,
    })

    return {
      ...result,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    }
  },
})

// Signout action - Invalidate session
export const signout = action({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.customAuth.deleteSession, {
      accessToken: args.accessToken,
    })

    return { success: true }
  },
})

// Get current user from access token
export const getCurrentUser = query({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Find valid session by access token
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_access_token', (q) => q.eq('accessToken', args.accessToken))
      .first()

    if (!session) {
      return null
    }

    // Check if access token expired (handle optional field for migration)
    if (!session.accessTokenExpiresAt || session.accessTokenExpiresAt < Date.now()) {
      return null
    }

    // Get user
    const user = await ctx.db.get(session.userId)
    if (!user) {
      return null
    }

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
      status: user.status,
    }
  },
})

// Verify session (lightweight check)
export const verifySession = query({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_access_token', (q) => q.eq('accessToken', args.accessToken))
      .first()

    if (!session) {
      return { valid: false, needsRefresh: false }
    }

    if (!session.accessTokenExpiresAt || session.accessTokenExpiresAt < Date.now()) {
      // Access token expired - check if refresh token is still valid
      if (session.refreshTokenExpiresAt && session.refreshTokenExpiresAt > Date.now()) {
        return { valid: false, needsRefresh: true, userId: session.userId }
      }
      return { valid: false, needsRefresh: false }
    }

    return { valid: true, needsRefresh: false, userId: session.userId }
  },
})

// ============================================================================
// INTERNAL MUTATIONS - Only callable from actions
// ============================================================================

// Check if email exists (internal)
export const checkEmailExists = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('email', (q) => q.eq('email', args.email))
      .first()
    return !!user
  },
})

// Get user by email (internal)
export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('email', (q) => q.eq('email', args.email))
      .first()
  },
})

// Create user and session
export const createUserWithSession = internalMutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    passwordHash: v.string(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create user
    const userId = await ctx.db.insert('users', {
      email: args.email,
      name: args.name,
      passwordHash: args.passwordHash,
      role: 'organizer', // Default role
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Create session with access and refresh tokens
    const accessToken = crypto.randomUUID()
    const refreshToken = crypto.randomUUID()
    const now = Date.now()

    const sessionId = await ctx.db.insert('sessions', {
      userId,
      accessToken,
      refreshToken,
      accessTokenExpiresAt: now + ACCESS_TOKEN_EXPIRY,
      refreshTokenExpiresAt: now + REFRESH_TOKEN_EXPIRY,
      createdAt: now,
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
    })

    return {
      userId,
      accessToken,
      refreshToken,
      sessionId,
      accessTokenExpiresAt: now + ACCESS_TOKEN_EXPIRY,
      user: {
        _id: userId,
        email: args.email,
        name: args.name,
        role: 'organizer' as const,
        image: undefined,
      },
    }
  },
})

// Create session for existing user
export const createSessionForUser = internalMutation({
  args: {
    userId: v.id('users'),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create new session with access and refresh tokens
    const accessToken = crypto.randomUUID()
    const refreshToken = crypto.randomUUID()
    const now = Date.now()

    const sessionId = await ctx.db.insert('sessions', {
      userId: args.userId,
      accessToken,
      refreshToken,
      accessTokenExpiresAt: now + ACCESS_TOKEN_EXPIRY,
      refreshTokenExpiresAt: now + REFRESH_TOKEN_EXPIRY,
      createdAt: now,
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
    })

    // Update last login
    await ctx.db.patch(args.userId, {
      updatedAt: now,
    })

    return {
      userId: args.userId,
      accessToken,
      refreshToken,
      sessionId,
      accessTokenExpiresAt: now + ACCESS_TOKEN_EXPIRY,
    }
  },
})

// Delete session by access token
export const deleteSession = internalMutation({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_access_token', (q) => q.eq('accessToken', args.accessToken))
      .first()

    if (session) {
      await ctx.db.delete(session._id)
    }
  },
})

// Delete session by refresh token (for logout from HTTP endpoint)
export const deleteSessionByRefreshToken = internalMutation({
  args: {
    refreshToken: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_refresh_token', (q) => q.eq('refreshToken', args.refreshToken))
      .first()

    if (session) {
      await ctx.db.delete(session._id)
    }
  },
})

// Refresh session - rotate tokens
export const refreshSessionInternal = internalMutation({
  args: {
    refreshToken: v.string(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find session by refresh token
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_refresh_token', (q) => q.eq('refreshToken', args.refreshToken))
      .first()

    if (!session) {
      return { success: false, error: 'Invalid refresh token' }
    }

    // Check if refresh token expired (handle optional field for migration)
    if (!session.refreshTokenExpiresAt || session.refreshTokenExpiresAt < Date.now()) {
      // Delete the expired session
      await ctx.db.delete(session._id)
      return { success: false, error: 'Refresh token expired' }
    }

    // Get user to return in response
    const user = await ctx.db.get(session.userId)
    if (!user) {
      await ctx.db.delete(session._id)
      return { success: false, error: 'User not found' }
    }

    // Generate new tokens (rotation)
    const newAccessToken = crypto.randomUUID()
    const newRefreshToken = crypto.randomUUID()
    const now = Date.now()

    // Update session with new tokens
    await ctx.db.patch(session._id, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiresAt: now + ACCESS_TOKEN_EXPIRY,
      refreshTokenExpiresAt: now + REFRESH_TOKEN_EXPIRY,
      userAgent: args.userAgent ?? session.userAgent,
      ipAddress: args.ipAddress ?? session.ipAddress,
    })

    return {
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiresAt: now + ACCESS_TOKEN_EXPIRY,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    }
  },
})

// ============================================================================
// INTERNAL ACTIONS - For HTTP cookie endpoints
// ============================================================================

// Internal signin action (called by HTTP endpoint)
export const signInInternal = internalAction({
  args: {
    email: v.string(),
    password: v.string(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<SignInInternalResult> => {
    // Find user by email
    const user = await ctx.runQuery(internal.customAuth.getUserByEmail, {
      email: args.email.toLowerCase(),
    })

    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Check if user has passwordHash (might be OAuth user)
    if (!user.passwordHash) {
      return { success: false, error: 'Please sign in with Google' }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(args.password, user.passwordHash)
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Check account status
    if (user.status === 'suspended') {
      return { success: false, error: 'Your account has been suspended' }
    }

    // Create session via internal mutation
    const result = await ctx.runMutation(internal.customAuth.createSessionForUser, {
      userId: user._id,
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
    })

    return {
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      accessTokenExpiresAt: result.accessTokenExpiresAt,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    }
  },
})

// Public refresh action (for frontend use)
export const refreshSession = action({
  args: {
    refreshToken: v.string(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<RefreshResult> => {
    return await ctx.runMutation(internal.customAuth.refreshSessionInternal, {
      refreshToken: args.refreshToken,
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
    })
  },
})

// Get user by access token (internal query for HTTP endpoint)
export const getUserByAccessToken = internalQuery({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_access_token', (q) => q.eq('accessToken', args.accessToken))
      .first()

    if (!session) {
      return null
    }

    if (!session.accessTokenExpiresAt || session.accessTokenExpiresAt < Date.now()) {
      return null
    }

    const user = await ctx.db.get(session.userId)
    if (!user) {
      return null
    }

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
      status: user.status,
    }
  },
})
