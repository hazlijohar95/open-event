import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { auth } from './auth'

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

export default http
