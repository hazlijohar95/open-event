import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'

// ============================================================================
// HTTP Router
// ============================================================================
// 
// Note: AI chat functionality is handled via Convex actions (actions/agent.ts)
// which properly supports 'use node' for OpenAI SDK.
// 
// This file is for any public HTTP endpoints that don't require Node.js runtime.
// ============================================================================

const http = httpRouter()

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
