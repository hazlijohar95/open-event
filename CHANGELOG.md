# Changelog

All notable changes to Open Event are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.3.0] - 2024-12-06

### 🚀 Vercel AI SDK Migration & Streaming

Major upgrade: Migrated from direct OpenAI SDK to **Vercel AI SDK** for improved streaming and reliability.

#### Added

- **HTTP Streaming Endpoint** (`convex/http.ts`)
  ```
  POST /api/chat         → Main chat with streaming
  POST /api/chat/tool    → Tool execution
  POST /api/chat/confirm → Confirmed tool execution
  ```
  - Real-time streaming responses with `streamText()`
  - Multi-step agentic behavior (up to 5 steps)
  - Experimental tool call streaming

- **Event Detail Page** (`src/pages/dashboard/EventDetailPage.tsx`)
  ```
  ┌────────────────────────────────────────────────────────────┐
  │ ← Claude Code Meetup                         [Draft]       │
  ├────────────────────────────────────────────────────────────┤
  │                                                            │
  │  📅 Date & Time           │  📊 Event Details              │
  │  ───────────────          │  ───────────────               │
  │  Saturday, Oct 7, 2023    │  Type: Conference              │
  │  2:00 PM - 5:00 PM        │  👥 Attendees: 200             │
  │                           │  💰 Budget: $10,000            │
  │  📍 Location              │                                │
  │  ───────────────          │  🏢 Vendors                    │
  │  📍 In-Person             │  ───────────────               │
  │  Overtime Cafe            │  No vendors yet                │
  │  123 Main St              │                                │
  │                           │  🤝 Sponsors                   │
  │  ✅ Requirements          │  ───────────────               │
  │  ───────────────          │  No sponsors yet               │
  │  🍽️ Catering  🎤 AV       │                                │
  └────────────────────────────────────────────────────────────┘
  ```
  - Full event information display with loading states
  - Edit and delete functionality with toast notifications
  - Responsive layout with status badges

- **Vercel AI SDK Integration**
  - `@ai-sdk/openai` for OpenAI provider
  - `ai` package for streaming utilities
  - Tool schema conversion for AI SDK format

#### Changed

- **EventCreatePage.tsx** - Migrated to `useChat` hook from Vercel AI SDK
- **Error Handling** - Improved catch blocks without unused variables

#### Fixed

- **Lint Errors** (7 total fixes):
  - Removed unused `ToolResultPart` import in `convex/http.ts`
  - Removed unused `conversationId` from destructuring (2 locations)
  - Fixed `any` type in `convex/mutations/auth.ts` with proper type assertions
  - Fixed unused `err` variables in catch blocks

---

## [0.2.0] - 2024-12-05

### 🤖 AI Agent System

Complete AI-powered event creation assistant with tool calling.

#### Added

- **Agentic AI for Event Creation** (`convex/actions/agent.ts`)
  - OpenAI function calling integration with GPT-4o-mini
  - Agentic loop supporting up to 5 iterations for multi-step tasks
  - Tool confirmation system for sensitive operations
  - Automatic conversation history management

- **Agent Tool Library** (`convex/lib/agent/`)
  | File | Description |
  |------|-------------|
  | `types.ts` | TypeScript types for tools, results, responses |
  | `tools.ts` | 9 OpenAI function schemas with validation |
  | `handlers.ts` | Tool execution handlers for database operations |

- **Agent UI Components** (`src/components/agent/`)
  | Component | Description |
  |-----------|-------------|
  | `ToolExecutionCard.tsx` | Visual feedback for tool execution status |
  | `ToolConfirmationDialog.tsx` | User confirmation for sensitive actions |
  | `SearchResultsCard.tsx` | Display vendor/sponsor search results |

- **Centralized Tool Config** (`src/lib/agent-tools.ts`)
  - Unified tool icons, labels, and descriptions
  - Helper functions: `getToolConfig()`, `getToolIcon()`, etc.

- **Event Create Page** (`src/pages/dashboard/EventCreatePage.tsx`)
  - Full chat interface for AI agent interaction
  - Real-time tool execution visualization
  - Automatic navigation on event creation

- **Convex Backend Extensions**
  - `convex/vendors.ts` - Vendor queries for agent
  - `convex/sponsors.ts` - Sponsor queries for agent
  - Extended `convex/events.ts` with full field support

- **Testing Framework**
  - Vitest configuration with React Testing Library
  - 69 unit tests for agent tools and components
  - Test setup with common mocks

- **Documentation**
  - `docs/AGENT_SYSTEM.md` - Full system documentation

#### Changed

- **Events Mutations** (`convex/events.ts`)
  - Extended `create` mutation with location, budget, and attendee fields
  - Extended `update` mutation with same fields
  - Added undefined value filtering in updates

- **Main Entry** (`src/main.tsx`)
  - Moved `Providers` component to separate file for HMR compatibility

- **Package.json**
  - Added test scripts: `test`, `test:run`, `test:coverage`
  - Added dev dependencies: vitest, testing-library, jsdom

#### Fixed

- Fixed `as any` type assertions with proper `Id<'table'>` types
- Fixed ESLint warnings in handlers and events
- Fixed React fast-refresh lint error in main.tsx

---

## [0.1.0] - 2024-12-04

### 🎉 Initial Release

First release with landing page and dashboard foundation.

#### Added

- **Landing Page** with hero, features, and CTA sections
- **Dashboard Layout** with sidebar navigation
- **Authentication** with Clerk integration
- **Database** with Convex backend
- **Styling** with TailwindCSS v4 + ShadCN UI
- **Icons** with Phosphor Icons (duotone weight)
- **Typography** with Geist fonts

---

## Technical Notes

### Backend Requirements

```bash
# 1. Start Convex dev server
npx convex dev

# 2. Set environment variables (Convex Dashboard)
OPENAI_API_KEY=sk-...
```

### Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                      Core Tables                             │
├─────────────────────────────────────────────────────────────┤
│  users              │  email, name, role                    │
│  events             │  organizerId, title, dates, location  │
│  vendors            │  name, category, location, rating     │
│  sponsors           │  name, industry, tier, budget         │
│  organizerProfiles  │  userId, organization, preferences    │
└─────────────────────────────────────────────────────────────┘
```

### Files Overview

```
convex/                         src/
├── http.ts           ← SSE     ├── pages/dashboard/
├── lib/agent/                  │   ├── EventCreatePage.tsx
│   ├── types.ts                │   ├── EventDetailPage.tsx
│   ├── tools.ts                │   └── ...
│   └── handlers.ts             ├── components/agent/
├── events.ts                   │   ├── ToolExecutionCard.tsx
├── vendors.ts                  │   ├── ToolConfirmationDialog.tsx
└── sponsors.ts                 │   └── SearchResultsCard.tsx
                                └── lib/agent-tools.ts
```
