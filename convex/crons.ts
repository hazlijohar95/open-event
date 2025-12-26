/**
 * Scheduled Tasks (Cron Jobs)
 *
 * This file defines all scheduled tasks that run automatically.
 * Uses Convex's built-in cron functionality.
 */

import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

/**
 * Clean up expired orders every 15 minutes
 *
 * This releases reserved tickets for orders that:
 * - Are in 'pending' status
 * - Have been pending for more than 30 minutes
 *
 * This prevents ticket inventory from being permanently locked
 * by abandoned checkout sessions.
 */
crons.interval('cleanup-expired-orders', { minutes: 15 }, internal.orders.cleanupExpiredOrders)

/**
 * Clean up old webhook events every hour
 *
 * Removes webhook event records older than 7 days.
 * These are only needed for idempotency checks which
 * are only relevant for a short window.
 */
crons.interval('cleanup-old-webhook-events', { hours: 1 }, internal.orders.cleanupOldWebhookEvents)

/**
 * Clean up old account lockout records every 6 hours
 *
 * Removes lockout records that are:
 * - Older than 24 hours
 * - No longer locked
 *
 * This prevents the failedLoginAttempts table from growing indefinitely.
 */
crons.interval(
  'cleanup-lockout-records',
  { hours: 6 },
  internal.accountLockout.cleanupOldRecords
)

/**
 * Clean up old global rate limit records every hour
 *
 * Removes rate limit records older than 1 hour.
 * These are only needed for the current window.
 */
crons.interval(
  'cleanup-rate-limits',
  { hours: 1 },
  internal.globalRateLimit.cleanupOldRecords
)

/**
 * Clean up old audit logs every day
 *
 * Removes audit logs older than 90 days by default.
 * This keeps the audit trail manageable while maintaining
 * sufficient history for security reviews.
 */
crons.daily('cleanup-audit-logs', { hourUTC: 3, minuteUTC: 0 }, internal.auditLog.cleanupOldLogs, {})

export default crons
