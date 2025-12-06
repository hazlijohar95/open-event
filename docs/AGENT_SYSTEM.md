# AI Agent System Documentation

This document describes the agentic AI system built for open-event, enabling AI-powered event creation, vendor search, and sponsor discovery.

## Overview

The system uses OpenAI's function calling (tools) to create an autonomous agent that can:
- **Create events** - Parse natural language descriptions into structured event data
- **Search vendors** - Find catering, AV, photography, and other service providers
- **Search sponsors** - Discover companies interested in sponsoring events
- **Manage events** - Update event details, get event information

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  EventCreatePage.tsx    - Chat UI for agent interaction         │
│  ToolExecutionCard.tsx  - Shows tool execution status           │
│  ToolConfirmationDialog - Confirms sensitive actions            │
│  SearchResultsCard.tsx  - Displays vendor/sponsor results       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Convex Actions (Backend)                     │
├─────────────────────────────────────────────────────────────────┤
│  actions/agent.ts       - Main agent loop with OpenAI           │
│    - chat()             - Handles conversation + tool execution │
│    - confirmAndExecute()- Executes user-confirmed tools         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Agent Library (convex/lib/agent/)           │
├─────────────────────────────────────────────────────────────────┤
│  types.ts    - TypeScript types for tools, results, responses   │
│  tools.ts    - OpenAI function schemas (9 tools defined)        │
│  handlers.ts - Tool execution logic (database operations)       │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

### Backend (Convex)

```
convex/
├── actions/
│   └── agent.ts              # Main agent action with OpenAI integration
├── lib/
│   └── agent/
│       ├── types.ts          # Type definitions
│       ├── tools.ts          # Tool schemas for OpenAI
│       └── handlers.ts       # Tool execution handlers
├── aiConversations.ts        # Conversation CRUD operations
├── events.ts                 # Event mutations (extended for agent)
├── vendors.ts                # Vendor queries
├── sponsors.ts               # Sponsor queries
└── schema.ts                 # Database schema (includes AI tables)
```

### Frontend (React)

```
src/
├── components/
│   └── agent/
│       ├── index.ts                    # Exports
│       ├── ToolExecutionCard.tsx       # Tool status display
│       ├── ToolConfirmationDialog.tsx  # Action confirmation UI
│       └── SearchResultsCard.tsx       # Search results display
├── lib/
│   ├── agent-tools.ts                  # Centralized tool config
│   └── agent-tools.test.ts             # Unit tests
├── pages/
│   └── dashboard/
│       └── EventCreatePage.tsx         # Main agent chat page
└── test/
    └── setup.ts                        # Vitest test setup
```

## Available Tools

| Tool Name | Description | Requires Confirmation |
|-----------|-------------|----------------------|
| `createEvent` | Create a new event | ✅ Yes |
| `updateEvent` | Update event details | ✅ Yes |
| `getEventDetails` | Get event information | No |
| `getUpcomingEvents` | List user's upcoming events | No |
| `searchVendors` | Search for vendors by category | No |
| `addVendorToEvent` | Add vendor to an event | ✅ Yes |
| `searchSponsors` | Search for sponsors by industry | No |
| `addSponsorToEvent` | Add sponsor to an event | ✅ Yes |
| `getUserProfile` | Get organizer profile | No |

## Database Schema Additions

### aiConversations
Stores AI conversation sessions for event creation.

```typescript
aiConversations: {
  userId: Id<'users'>
  eventId?: Id<'events'>       // Linked after event creation
  status: 'active' | 'completed' | 'abandoned'
  purpose?: string             // 'event-creation', 'vendor-search', etc.
  context?: {
    eventType?: string
    extractedData?: any
  }
  createdAt: number
  updatedAt?: number
}
```

### aiMessages
Individual messages within conversations.

```typescript
aiMessages: {
  conversationId: Id<'aiConversations'>
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: {
    extractedFields?: string[]    // Tools that were called
    suggestedActions?: string[]   // Pending confirmations
    model?: string                // 'gpt-4o-mini'
  }
  createdAt: number
}
```

## Agent Flow

1. **User sends message** → `EventCreatePage.tsx`
2. **Frontend calls** `agentChat` action
3. **Agent action**:
   - Builds conversation history
   - Calls OpenAI with tools
   - Loops up to 5 iterations for multi-step tasks
   - For tools requiring confirmation → returns `pendingConfirmations`
   - For auto-execute tools → runs handler immediately
4. **If confirmation needed**:
   - Frontend shows `ToolConfirmationDialog`
   - User confirms → Frontend calls `confirmAndExecute`
5. **Tool execution** → handlers in `handlers.ts`
6. **Results returned** → UI updated

## Environment Variables Required

```env
OPENAI_API_KEY=sk-...          # For agent LLM calls
VITE_CONVEX_URL=https://...    # Convex deployment URL
VITE_CLERK_PUBLISHABLE_KEY=pk_...  # Clerk auth
```

## Testing

The system includes 69 unit tests covering:
- Agent tools configuration (`agent-tools.test.ts`)
- ToolExecutionCard component
- ToolConfirmationDialog component
- SearchResultsCard component

Run tests:
```bash
npm run test        # Watch mode
npm run test:run    # Single run
npm run test:coverage  # With coverage
```

## Backend Engineer TODO

1. **Run Convex Dev Server**:
   ```bash
   npx convex dev
   ```

2. **Seed Test Data** (optional):
   - Add sample vendors to `vendors` table
   - Add sample sponsors to `sponsors` table

3. **Review/Extend**:
   - `convex/lib/agent/handlers.ts` - Add more sophisticated tool logic
   - `convex/vendors.ts` - Enhance search with filters
   - `convex/sponsors.ts` - Enhance search with filters

4. **Consider Adding**:
   - Rate limiting for agent calls
   - Token usage tracking
   - Error logging/monitoring
   - More sophisticated event creation (multi-day, recurring)

## API Reference

### `agentChat` Action

```typescript
// Input
{
  conversationId: Id<'aiConversations'>
  userMessage: string
  confirmedToolCalls?: string[]  // IDs of confirmed tools
}

// Output
{
  message: string
  toolCalls: ToolCall[]
  toolResults: ToolResult[]
  pendingConfirmations: ToolCall[]
  isComplete: boolean
  entityId?: Id<'events'>
}
```

### `confirmAndExecute` Action

```typescript
// Input
{
  conversationId: Id<'aiConversations'>
  toolCallId: string
  toolName: string
  toolArguments: Record<string, unknown>
}

// Output: ToolResult
{
  toolCallId: string
  name: string
  success: boolean
  data?: unknown
  error?: string
  summary: string
}
```
