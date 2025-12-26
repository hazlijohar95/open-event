# FORME - Project Structure Guide

## What This Project Does

**Open Event** is an open-source event management platform that connects three key players:

- **Organizers**: Create and manage events with AI assistance, track budgets, coordinate vendors, and find sponsors
- **Vendors**: Showcase services, discover event opportunities, and get hired
- **Sponsors**: Find events to support, manage sponsorship tiers, and track investments

The platform includes an AI-powered event assistant, real-time dashboards, task management, budget tracking, and a public API with webhooks.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS 4
- **Backend**: Convex (real-time database + serverless functions)
- **AI**: OpenAI GPT-4o-mini with function calling
- **Auth**: Convex Auth (Google OAuth, Email/Password)
- **UI**: ShadCN UI components + Phosphor Icons
- **Testing**: Vitest (unit tests), React Testing Library, Playwright (E2E tests)

## Project Organization

### `/convex` - Backend (Convex Functions)

The backend is organized by domain:

- **`schema.ts`** - Database schema definitions (users, events, vendors, sponsors, etc.)
- **`auth.ts`** - Authentication configuration
- **`events.ts`** - Event CRUD operations
- **`vendors.ts`** - Vendor management
- **`sponsors.ts`** - Sponsor management
- **`eventTasks.ts`** - Task management for events
- **`budgetItems.ts`** - Budget tracking
- **`eventVendors.ts`** - Event-vendor relationships
- **`eventSponsors.ts`** - Event-sponsor relationships
- **`eventApplications.ts`** - Vendor/sponsor applications to events
- **`publicApplications.ts`** - Public vendor/sponsor application forms
- **`inquiries.ts`** - Messaging between organizers and vendors/sponsors
- **`users.ts`** - User management
- **`organizerProfiles.ts`** - User onboarding/profile data
- **`apiKeys.ts`** - API key management for public API
- **`webhooks.ts`** - Webhook delivery system
- **`aiUsage.ts`** - AI rate limiting and usage tracking
- **`moderation.ts`** - Admin moderation actions
- **`analytics.ts`** - Analytics queries
- **`admin.ts`** - Admin-only operations
- **`organizations.ts`** - Multi-tenant organization/team management
- **`accountLockout.ts`** - Brute force protection (account lockout after failed attempts)
- **`globalRateLimit.ts`** - IP-based rate limiting with sliding windows
- **`auditLog.ts`** - Security audit trail logging
- **`twoFactorAuth.ts`** - TOTP-based two-factor authentication

**Subdirectories:**

- **`lib/agent/`** - AI agent system (tools, handlers, types)
- **`lib/ai/`** - AI provider abstraction (OpenAI, Anthropic, Groq adapters)
- **`api/`** - Public API endpoints and helpers
- **`queries/`** - Reusable query helpers
- **`mutations/`** - Reusable mutation helpers

### `/src` - Frontend (React Application)

#### `/src/components` - Reusable UI Components

- **`ui/`** - ShadCN UI primitives (Button, Dialog, Input, etc.)
- **`app/`** - App shell components (Sidebar, TopBar, AppShell)
- **`auth/`** - Authentication components (SignIn, SignUp, ProtectedRoute, SignInForm, SignUpForm)
- **`landing/`** - Landing page sections (Hero, Features, FAQ, etc.)
- **`agentic-v2/`** - AI chat interface components (main AI assistant UI)
- **`agentic/`** - Legacy AI chat components
- **`agent/`** - AI tool execution UI (confirmations, results)
- **`admin/`** - Admin panel components (AdminLayout, AdminSidebar)
- **`dashboard/`** - Dashboard-specific components
- **`security/`** - Security components (TwoFactorSetup, TwoFactorStatus, TwoFactorVerifyModal)
- **`organizations/`** - Organization management (CreateOrganizationModal, TeamMembersList, InviteMemberModal)
- **`chat/`** - Chat UI components (messages, streaming text)
- **`onboarding/`** - User onboarding flow components
- **`playground/`** - Tldraw-based event canvas (Beta feature)
- **`pwa/`** - PWA installation and update prompts
- **`typeform/`** - Multi-step form components

#### `/src/pages` - Page Components (Route Handlers)

- **`dashboard/`** - Main app pages (Events, Vendors, Sponsors, Analytics, Settings)
- **`admin/`** - Admin panel pages (Users, Vendors, Sponsors, Moderation, AuditLogs, RateLimits)
- **`auth/`** - Authentication pages (SignIn, SignUp)
- **`onboarding/`** - User onboarding flow
- **`public/`** - Public pages (Event directory, event details)
- **`apply/`** - Public application forms (vendor/sponsor applications)
- **`legal/`** - Legal pages (Privacy, Terms, Cookies)
- **`docs/`** - Documentation pages
- **`opensource/`** - Open source contributors page

#### `/src/hooks` - Custom React Hooks

- **`useAsyncAction.ts`** - Reusable async action with toast handling
- **`use-pwa.ts`** - PWA installation hooks
- **`use-onboarding.ts`** - Onboarding state management
- **`use-github-data.ts`** - GitHub API integration
- **`use-demo-player.ts`** - Demo playback controls
- **`use-scroll-animation.ts`** - Scroll-based animations
- **`use-audience-toggle.ts`** - Audience visibility toggle

**Note:** Unit tests for hooks are co-located (e.g., `use-audience-toggle.test.ts`).

#### `/src/lib` - Utility Functions

- **`utils.ts`** - General utilities (cn, formatters)
- **`constants.ts`** - App-wide constants
- **`validation.ts`** - Form validation helpers
- **`errors.ts`** - Error handling utilities
- **`agent-tools.ts`** - Client-side AI tool definitions
- **`playground/`** - Playground-specific utilities

**Note:** Unit tests for utilities are co-located (e.g., `utils.test.ts`, `validation.test.ts`).

#### `/src/types` - TypeScript Type Definitions

- **`index.ts`** - Shared types
- **`onboarding.ts`** - Onboarding-specific types

### `/docs` - Documentation

- **`API.md`** - Public API reference
- **`AGENT_SYSTEM.md`** - AI agent system documentation
- **`OPEN_SOURCE_API_GUIDE.md`** - Complete API integration guide
- **`API_TESTING_GUIDE.md`** - How to test the public API
- **`ANALYTICS_FRONTEND_GUIDE.md`** - Analytics implementation guide
- **`DESIGN_SYSTEM.md`** - Design system documentation
- **`PWA_GUIDE.md`** - Progressive Web App guide

### `/e2e` - End-to-End Tests

- **`auth.spec.ts`** - Authentication flow tests
- **`landing.spec.ts`** - Landing page tests

**Note:** Unit tests are co-located with their components/utilities (e.g., `SignUpForm.test.tsx` next to `SignUpForm.tsx`). Security module tests are in `src/lib/` (accountLockout.test.ts, globalRateLimit.test.ts, auditLog.test.ts). Test setup is in `src/test/setup.ts`.

### `/scripts` - Utility Scripts

- **`generateKeys.mjs`** - API key generation utility
- **`test-api.ps1`** - API testing script

### `/public` - Static Assets

- PWA manifest and icons
- Offline fallback page
- Auth background images
- Favicons and OG images

## Key Architecture Patterns

1. **Convex Backend**: All data operations go through Convex queries/mutations. Real-time subscriptions are automatic.
2. **AI Agent System**: Uses OpenAI function calling with 13 tools for event management operations.
3. **Component Organization**: Pages compose components from `/components`, which use UI primitives from `/components/ui`.
4. **Type Safety**: Full TypeScript coverage with Convex-generated types from `_generated/api`.
5. **Public API**: RESTful API with API key authentication, rate limiting, and webhook support.
6. **Security Layer**: Account lockout, global rate limiting, audit logging, and optional 2FA for enterprise users.

## Entry Points

- **`src/main.tsx`** - React app entry point
- **`src/App.tsx`** - Main router and route definitions
- **`convex/http.ts`** - HTTP endpoints (AI streaming, public API)
- **`index.html`** - HTML entry point

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│                         (React 19 + TypeScript)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Landing    │  │    Auth      │  │  Dashboard   │  │    Admin     │   │
│  │    Pages     │  │    Pages     │  │    Pages     │  │    Pages     │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │                 │             │
│         └─────────────────┴─────────────────┴─────────────────┘             │
│                                    │                                         │
│                           ┌────────▼────────┐                                │
│                           │   App Router    │                                │
│                           │  (React Router) │                                │
│                           └────────┬────────┘                                │
│                                    │                                         │
│         ┌──────────────────────────┼──────────────────────────┐              │
│         │                          │                          │              │
│  ┌──────▼──────┐         ┌─────────▼─────────┐      ┌───────▼──────┐       │
│  │   UI        │         │   Agentic Chat     │      │   Admin      │       │
│  │ Components  │         │   Components       │      │  Components  │       │
│  │ (ShadCN)    │         │  (agentic-v2/)     │      │              │       │
│  └──────┬──────┘         └─────────┬─────────┘      └───────┬──────┘       │
│         │                          │                          │              │
│  ┌──────▼──────┐         ┌─────────▼─────────┐              │              │
│  │   Hooks     │         │  useStreamingChat  │              │              │
│  │  (Custom)   │         │  (AI SDK React)    │              │              │
│  └──────┬──────┘         └─────────┬─────────┘              │              │
│         │                          │                          │              │
└─────────┼──────────────────────────┼──────────────────────────┼──────────────┘
          │                          │                          │
          │                          │                          │
          │         HTTP/SSE          │      Convex Client       │
          │         (AI Chat)         │   (Queries/Mutations)    │
          │                          │                          │
          └──────────┬───────────────┼──────────────────────────┘
                     │               │
                     │               │
┌────────────────────▼───────────────▼─────────────────────────────────────────┐
│                         CONVEX BACKEND LAYER                                  │
│                    (Serverless Functions + Database)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        HTTP Endpoints                                │   │
│  │                         (convex/http.ts)                             │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  POST /api/chat/stream    → AI streaming chat                        │   │
│  │  POST /api/v1/events     → Public API (events)                      │   │
│  │  POST /api/v1/vendors    → Public API (vendors)                      │   │
│  │  POST /api/v1/sponsors   → Public API (sponsors)                     │   │
│  │  POST /api/v1/webhooks   → Webhook management                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│         ┌───────────────────────────┼───────────────────────────┐            │
│         │                           │                           │            │
│  ┌──────▼──────┐          ┌────────▼────────┐        ┌────────▼────────┐   │
│  │   AI Agent  │          │   Public API    │        │   Webhooks      │   │
│  │   System    │          │   Handlers      │        │   Delivery      │   │
│  │             │          │                 │        │                 │   │
│  │ lib/agent/  │          │ api/helpers.ts   │        │ webhooks.ts     │   │
│  │  - tools.ts │          │ api/mutations.ts │        │                 │   │
│  │  - handlers │          │                 │        │                 │   │
│  └──────┬──────┘          └─────────────────┘        └────────┬────────┘   │
│         │                                                    │              │
│         │                    ┌───────────────────────────────┘              │
│         │                    │                                               │
│  ┌──────▼────────────────────▼───────────────────────────────────────────┐  │
│  │                    Domain Functions                                   │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │  events.ts │ vendors.ts │ sponsors.ts │ eventTasks.ts │ budgetItems.ts│  │
│  │  users.ts  │ inquiries.ts │ apiKeys.ts │ aiUsage.ts │ moderation.ts  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐  │
│  │                    Convex Database (Real-time)                        │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │  Tables: users, events, vendors, sponsors, eventTasks, budgetItems,   │  │
│  │          eventVendors, eventSponsors, eventApplications, inquiries,   │  │
│  │          apiKeys, webhooks, webhookDeliveries, aiUsage, organizations,│  │
│  │          organizationMembers, organizationInvitations, auditLogs,     │  │
│  │          rateLimitRecords, accountLockouts, etc.                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐  │
│  │                    Real-time Subscriptions                              │  │
│  │              (Automatic updates to connected clients)                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
         │                          │                          │
┌────────▼────────┐      ┌───────────▼──────────┐    ┌─────────▼─────────┐
│   OpenAI API    │      │   Google OAuth      │    │  External Apps    │
│  (GPT-4o-mini)  │      │   (Convex Auth)     │    │  (Webhook URLs)   │
│                 │      │                     │    │                   │
│ - Function      │      │ - Authentication    │    │ - Event updates   │
│   Calling       │      │ - User sessions     │    │ - Notifications   │
│ - Streaming     │      │                     │    │                   │
│   Responses     │      │                     │    │                   │
└─────────────────┘      └─────────────────────┘    └───────────────────┘
```

### Data Flow Architecture

#### 1. AI Chat Flow (Streaming)

```
User Input
    │
    ▼
┌─────────────────┐
│ AgenticChatV2   │  (Frontend Component)
│ useStreamingChat │  (Custom Hook)
└────────┬────────┘
         │ POST /api/chat/stream
         │ (Server-Sent Events)
         ▼
┌─────────────────┐
│ convex/http.ts  │  (HTTP Action)
│ /api/chat/stream│
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ OpenAI API   │  │ AI Agent     │
│ streamText() │  │ Tools (13)   │
└──────┬───────┘  └──────┬───────┘
       │                 │
       │ tool_call       │ executeToolHandler()
       │                 │
       └────────┬────────┘
                │
                ▼
┌─────────────────────────┐
│ Convex Mutations        │
│ - events.create         │
│ - vendors.search        │
│ - sponsors.search       │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Convex Database         │
│ (Real-time update)      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Frontend Subscription   │
│ (Automatic UI update)   │
└─────────────────────────┘
```

#### 2. Standard CRUD Flow (Real-time)

```
User Action (Frontend)
    │
    ▼
┌─────────────────┐
│ Page Component  │
│ (e.g., Events)  │
└────────┬────────┘
         │ useMutation(api.events.create)
         ▼
┌─────────────────┐
│ Convex Mutation │
│ events.create() │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Convex Database │
│ (Write)         │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌──────────────┐  ┌──────────────────┐
│ Real-time    │  │ Other Clients    │
│ Subscription │  │ (Auto-update)    │
│ (Same Client)│  │                  │
└──────────────┘  └──────────────────┘
```

#### 3. Public API Flow

```
External Application
    │
    │ API Key Authentication
    ▼
┌─────────────────┐
│ POST /api/v1/*  │
│ (convex/http.ts)│
└────────┬────────┘
         │
         ├─ Validate API Key
         ├─ Check Rate Limits
         ├─ Verify Permissions
         │
         ▼
┌─────────────────┐
│ API Handlers    │
│ api/helpers.ts  │
│ api/mutations.ts │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Convex Database │
│ (Read/Write)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Webhook Trigger │
│ (if configured) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ External URL    │
│ (POST payload)  │
└─────────────────┘
```

### Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Pages                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │  Dashboard   │    │    Events    │    │    Admin     │     │
│  │   Overview   │    │     Page     │    │    Panel     │     │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘     │
│         │                   │                   │              │
│         └───────────────────┴───────────────────┘              │
│                            │                                    │
│                   ┌────────▼────────┐                           │
│                   │   AppShell      │                           │
│                   │  (Layout)       │                           │
│                   └────────┬────────┘                           │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                │
│         │                  │                  │                │
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌──────▼──────┐        │
│  │   Sidebar   │  │    TopBar       │  │  Agentic    │        │
│  │             │  │                 │  │  Chat V2    │        │
│  │ - Events    │  │ - User Menu     │  │             │        │
│  │ - Vendors   │  │ - Notifications │  │ - AI Input │        │
│  │ - Sponsors  │  │ - Theme Toggle  │  │ - Streaming│        │
│  │ - Analytics │  │                 │  │ - Tools    │        │
│  └─────────────┘  └──────────────────┘  └──────┬─────┘        │
│                                                 │              │
│                                                 ▼              │
│                                        ┌─────────────────┐     │
│                                        │ useStreamingChat│     │
│                                        │ (AI SDK Hook)   │     │
│                                        └────────┬────────┘     │
│                                                 │              │
└─────────────────────────────────────────────────┼──────────────┘
                                                  │
                                                  │ HTTP/SSE
                                                  │
┌─────────────────────────────────────────────────▼──────────────┐
│                      Convex Backend                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              HTTP Action Handlers                        │  │
│  │  - /api/chat/stream → AI streaming                      │  │
│  │  - /api/v1/* → Public API                               │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                      │
│         ┌───────────────┼───────────────┐                      │
│         │               │               │                      │
│  ┌──────▼──────┐  ┌────▼────┐  ┌──────▼──────┐              │
│  │ AI Agent    │  │  Public  │  │  Webhooks   │              │
│  │ System      │  │   API    │  │  System     │              │
│  │             │  │          │  │            │              │
│  │ - Tools     │  │ - Auth   │  │ - Delivery │              │
│  │ - Handlers  │  │ - Rate   │  │ - Retry    │              │
│  │ - OpenAI    │  │   Limit  │  │ - Logging  │              │
│  └──────┬──────┘  └────┬─────┘  └──────┬─────┘              │
│         │              │                │                     │
│         └──────────────┼────────────────┘                     │
│                        │                                      │
│              ┌─────────▼─────────┐                           │
│              │  Domain Functions │                           │
│              │  (Queries/Mutations)                           │
│              └─────────┬─────────┘                           │
│                        │                                      │
│              ┌─────────▼─────────┐                           │
│              │  Convex Database  │                           │
│              │  (Real-time)      │                           │
│              └───────────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architecture Patterns

1. **Real-time Data Flow**: Convex automatically syncs database changes to all subscribed clients
2. **AI Streaming**: Server-Sent Events (SSE) for streaming AI responses
3. **Function Calling**: OpenAI tools map to Convex mutations for data operations
4. **API Gateway**: Single HTTP endpoint (`convex/http.ts`) routes to different handlers
5. **Type Safety**: Convex generates TypeScript types from schema automatically
6. **Component Composition**: Pages → Components → UI Primitives hierarchy

### Technology Integration Points

- **Frontend ↔ Backend**: Convex React hooks (`useQuery`, `useMutation`)
- **AI Chat ↔ OpenAI**: HTTP streaming via AI SDK
- **Public API ↔ External Apps**: RESTful endpoints with API key auth
- **Webhooks ↔ External Services**: HTTP POST with retry logic
- **Auth ↔ Google OAuth**: Convex Auth handles OAuth flow
