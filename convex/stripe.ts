/**
 * Stripe Integration - Checkout sessions and webhook handling
 *
 * Improvements:
 * - Fixed API version to valid Stripe version
 * - Added idempotency checking for webhooks
 * - Added dispute handling
 * - Enhanced error logging with context
 * - Proper refund flow with Stripe API
 */

import { v } from 'convex/values'
import { action } from './_generated/server'
import { api, internal } from './_generated/api'
import Stripe from 'stripe'

// Platform fee percentage (configurable) - reserved for future use
// const PLATFORM_FEE_PERCENT = 0.03 // 3%

// Initialize Stripe with correct API version
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY environment variable not set. Please add it to your Convex dashboard.'
    )
  }
  return new Stripe(key, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
  })
}

// Check if Stripe is configured
export const isConfigured = action({
  handler: async () => {
    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY
    const hasPublishableKey = !!process.env.STRIPE_PUBLISHABLE_KEY
    const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET

    return {
      configured: hasSecretKey && hasPublishableKey,
      webhookConfigured: hasWebhookSecret,
      missing: [
        !hasSecretKey && 'STRIPE_SECRET_KEY',
        !hasPublishableKey && 'STRIPE_PUBLISHABLE_KEY',
        !hasWebhookSecret && 'STRIPE_WEBHOOK_SECRET',
      ].filter(Boolean),
    }
  },
})

// Create a Stripe Checkout Session
export const createCheckoutSession = action({
  args: {
    orderId: v.id('orders'),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ sessionId: string; url: string }> => {
    const stripe = getStripe()

    // Get the order using internal query
    const orderData = await ctx.runQuery(internal.orders.getById, {
      orderId: args.orderId,
    })

    if (!orderData) {
      throw new Error('Order not found')
    }

    // Prevent creating session for non-pending orders
    if (orderData.paymentStatus !== 'pending' && orderData.paymentStatus !== 'processing') {
      throw new Error(`Cannot checkout order with status: ${orderData.paymentStatus}`)
    }

    // Check if session already exists and is valid
    if (orderData.stripeSessionId) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(orderData.stripeSessionId)
        if (existingSession.status === 'open' && existingSession.url) {
          return {
            sessionId: existingSession.id,
            url: existingSession.url,
          }
        }
      } catch {
        // Session expired or invalid, create new one
      }
    }

    // Get event details
    const event = await ctx.runQuery(api.events.get, {
      id: orderData.eventId,
    })

    if (!event) {
      throw new Error('Event not found')
    }

    // Build line items with proper metadata
    type OrderItem = (typeof orderData.items)[number]
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = orderData.items.map(
      (item: OrderItem) => ({
        price_data: {
          currency: orderData.currency,
          product_data: {
            name: `${event.title} - ${item.ticketTypeName}`,
            description: `Ticket for ${event.title}`,
            metadata: {
              ticketTypeId: item.ticketTypeId,
              eventId: orderData.eventId,
            },
          },
          unit_amount: item.unitPrice,
        },
        quantity: item.quantity,
      })
    )

    // Add platform fee as separate line item (transparent pricing)
    if (orderData.fees > 0) {
      lineItems.push({
        price_data: {
          currency: orderData.currency,
          product_data: {
            name: 'Service Fee',
            description: 'Platform and payment processing fee',
          },
          unit_amount: orderData.fees,
        },
        quantity: 1,
      })
    }

    // Create checkout session with enhanced options
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: orderData.buyerEmail,
      client_reference_id: orderData.orderNumber,
      metadata: {
        orderId: args.orderId,
        orderNumber: orderData.orderNumber,
        eventId: orderData.eventId,
        eventTitle: event.title,
      },
      payment_intent_data: {
        metadata: {
          orderId: args.orderId,
          orderNumber: orderData.orderNumber,
        },
      },
      success_url: `${args.successUrl}?session_id={CHECKOUT_SESSION_ID}&order=${orderData.orderNumber}`,
      cancel_url: `${args.cancelUrl}?order=${orderData.orderNumber}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
      // Enable automatic tax if configured
      // automatic_tax: { enabled: true },
    })

    // Update order with session ID
    await ctx.runMutation(api.orders.setStripeSession, {
      orderId: args.orderId,
      stripeSessionId: session.id,
    })

    return {
      sessionId: session.id,
      url: session.url!,
    }
  },
})

// Handle Stripe webhook events with idempotency
export const handleWebhook = action({
  args: {
    payload: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = getStripe()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured')
      throw new Error('Webhook secret not configured')
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(args.payload, args.signature, webhookSecret)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[Stripe Webhook] Signature verification failed:', message)
      throw new Error('Webhook signature verification failed')
    }

    // Log event for debugging
    console.log(`[Stripe Webhook] Processing event: ${event.type} (${event.id})`)

    // Check idempotency - prevent processing same event twice
    const existingEvent = await ctx.runQuery(internal.orders.getProcessedWebhook, {
      eventId: event.id,
    })

    if (existingEvent) {
      console.log(`[Stripe Webhook] Event ${event.id} already processed, skipping`)
      return { received: true, status: 'duplicate' }
    }

    // Record this webhook event
    await ctx.runMutation(internal.orders.recordWebhookEvent, {
      eventId: event.id,
      eventType: event.type,
      processedAt: Date.now(),
    })

    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session
          console.log(
            `[Stripe Webhook] Checkout completed for order: ${session.metadata?.orderNumber}`
          )

          await ctx.runMutation(internal.orders.updatePaymentStatus, {
            stripeSessionId: session.id,
            paymentStatus: 'completed',
            paymentMethod: session.payment_method_types?.[0] || 'card',
            stripeCustomerId: session.customer as string | undefined,
            stripePaymentIntentId: session.payment_intent as string | undefined,
          })
          break
        }

        case 'checkout.session.expired': {
          const session = event.data.object as Stripe.Checkout.Session
          console.log(
            `[Stripe Webhook] Checkout expired for order: ${session.metadata?.orderNumber}`
          )

          await ctx.runMutation(internal.orders.updatePaymentStatus, {
            stripeSessionId: session.id,
            paymentStatus: 'cancelled',
          })

          // Release reserved tickets
          await ctx.runMutation(internal.orders.releaseTicketReservation, {
            stripeSessionId: session.id,
          })
          break
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent
          console.log(`[Stripe Webhook] Payment failed: ${paymentIntent.id}`)

          await ctx.runMutation(internal.orders.updatePaymentStatus, {
            stripePaymentIntentId: paymentIntent.id,
            paymentStatus: 'failed',
          })
          break
        }

        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge
          if (charge.payment_intent) {
            console.log(
              `[Stripe Webhook] Charge refunded for payment intent: ${charge.payment_intent}`
            )

            await ctx.runMutation(internal.orders.updatePaymentStatus, {
              stripePaymentIntentId: charge.payment_intent as string,
              paymentStatus: 'refunded',
            })
          }
          break
        }

        case 'charge.dispute.created': {
          const dispute = event.data.object as Stripe.Dispute
          console.warn(
            `[Stripe Webhook] DISPUTE CREATED: ${dispute.id} for charge ${dispute.charge}`
          )

          // TODO: Send alert to organizer, possibly freeze ticket
          break
        }

        case 'charge.dispute.closed': {
          const dispute = event.data.object as Stripe.Dispute
          console.log(
            `[Stripe Webhook] Dispute closed: ${dispute.id} with status ${dispute.status}`
          )
          break
        }

        default:
          console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
      }

      return { received: true, status: 'processed' }
    } catch (processingError) {
      const message = processingError instanceof Error ? processingError.message : 'Unknown error'
      console.error(`[Stripe Webhook] Error processing ${event.type}:`, message)
      throw new Error(`Webhook processing failed: ${message}`)
    }
  },
})

// Create a refund in Stripe AND update database
export const createRefund = action({
  args: {
    orderId: v.id('orders'),
    reason: v.optional(v.string()),
    amount: v.optional(v.number()), // Partial refund amount in cents
  },
  handler: async (
    ctx,
    args
  ): Promise<{ success: boolean; refundId: string; amount: number; isPartial: boolean }> => {
    const stripe = getStripe()

    // Get order to find payment intent
    const order = await ctx.runQuery(internal.orders.getById, {
      orderId: args.orderId,
    })

    if (!order) {
      throw new Error('Order not found')
    }

    if (!order.stripePaymentIntentId) {
      throw new Error('No payment intent found for this order. Was the payment completed?')
    }

    if (order.paymentStatus !== 'completed') {
      throw new Error(`Cannot refund order with status: ${order.paymentStatus}`)
    }

    // Determine refund amount
    const refundAmount = args.amount || order.total

    try {
      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
        amount: refundAmount,
        reason: 'requested_by_customer',
        metadata: {
          orderId: args.orderId,
          orderNumber: order.orderNumber,
          refundReason: args.reason || 'Organizer requested refund',
        },
      })

      console.log(`[Stripe Refund] Created refund ${refund.id} for order ${order.orderNumber}`)

      // Update order status in database
      const isFullRefund = refundAmount >= order.total
      await ctx.runMutation(internal.orders.updatePaymentStatus, {
        orderId: args.orderId,
        paymentStatus: isFullRefund ? 'refunded' : 'completed', // Keep completed for partial
      })

      // Mark order as refunded with details
      await ctx.runMutation(internal.orders.markRefunded, {
        orderId: args.orderId,
        refundId: refund.id,
        refundAmount,
        reason: args.reason,
        isPartial: !isFullRefund,
      })

      return {
        success: true,
        refundId: refund.id,
        amount: refundAmount,
        isPartial: !isFullRefund,
      }
    } catch (stripeError) {
      const message = stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error'
      console.error(`[Stripe Refund] Failed for order ${order.orderNumber}:`, message)
      throw new Error(`Stripe refund failed: ${message}`)
    }
  },
})

// Get Stripe publishable key (for frontend)
export const getPublishableKey = action({
  handler: async () => {
    const key = process.env.STRIPE_PUBLISHABLE_KEY
    if (!key) {
      throw new Error('STRIPE_PUBLISHABLE_KEY environment variable not set')
    }
    return { publishableKey: key }
  },
})

// Get payment details for a completed order
export const getPaymentDetails = action({
  args: {
    orderId: v.id('orders'),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    status: string
    amount: number
    currency: string
    paymentMethod: string
    receiptUrl: string | null | undefined
    last4: string | undefined
    brand: string | undefined
  } | null> => {
    const stripe = getStripe()

    const order = await ctx.runQuery(internal.orders.getById, {
      orderId: args.orderId,
    })

    if (!order?.stripePaymentIntentId) {
      return null
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId, {
        expand: ['payment_method', 'latest_charge'],
      })

      const charge = paymentIntent.latest_charge as Stripe.Charge | null

      return {
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method_types[0],
        receiptUrl: charge?.receipt_url,
        last4: (paymentIntent.payment_method as Stripe.PaymentMethod)?.card?.last4,
        brand: (paymentIntent.payment_method as Stripe.PaymentMethod)?.card?.brand,
      }
    } catch {
      return null
    }
  },
})
