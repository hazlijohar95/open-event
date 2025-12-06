# Open Event

> Open-source event operations platform with AI-powered event creation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Convex](https://img.shields.io/badge/Convex-Backend-ff6b6b.svg)](https://convex.dev/)

---

## Overview

Open Event is a modern event management platform that helps organizers create and manage events, find vendors, and discover sponsors - all powered by an AI assistant.

### Key Features

| Feature | Description |
|---------|-------------|
| **AI Event Assistant** | Create events through natural conversation with GPT-4o-mini |
| **Smart Vendor Search** | Find catering, AV, photography, and other service providers |
| **Sponsor Discovery** | Connect with companies interested in sponsoring events |
| **Real-time Updates** | Powered by Convex for instant data synchronization |
| **Modern UI** | Clean, minimal design with dark/light mode support |

---

## Screenshots

### Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  open-event                    Welcome back, User      🌙   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐                                            │
│  │ + Create    │   Events                                   │
│  │   Event     │   ─────────────────────────                │
│  ├─────────────┤   Manage all your events in one place      │
│  │ Overview    │                                            │
│  │ Events    ◀ │   ┌─────────────────────────────────────┐  │
│  │ Vendors     │   │ Claude Code Meetup    [Draft]       │  │
│  │ Sponsors    │   │ Oct 7, 2023 • Overtime Cafe         │  │
│  │ Analytics   │   └─────────────────────────────────────┘  │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

### AI Event Assistant
```
┌─────────────────────────────────────────────────────────────┐
│  ← AI Event Assistant                    ⚡ Agentic         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🤖  Hi! I'm your AI event planning assistant.              │
│      I can help you:                                        │
│      • Create events - describe and I'll set it up          │
│      • Find vendors - catering, AV, photography             │
│      • Discover sponsors - find interested companies        │
│                                                             │
│                         I want to create a tech conference  │
│                         for 200 people next month      👤   │
│                                                             │
│  🤖  Great! Let me create that for you...                   │
│                                                             │
│      ┌─────────────────────────────────────┐                │
│      │ 🔧 Creating Event...                │                │
│      │    ✓ Tech Conference                │                │
│      │    ✓ 200 attendees                  │                │
│      │    [Confirm] [Cancel]               │                │
│      └─────────────────────────────────────┘                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Tell me about your event...]                      [Send]  │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19 + TypeScript | UI framework |
| **Styling** | TailwindCSS v4 + ShadCN UI | Design system |
| **Icons** | Phosphor Icons (duotone) | Consistent iconography |
| **Fonts** | Geist Sans/Mono | Typography |
| **Backend** | Convex | Database, auth, real-time |
| **AI** | OpenAI GPT-4o-mini | Event creation assistant |
| **Auth** | Clerk | User authentication |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- [Convex account](https://convex.dev) (free)
- [Clerk account](https://clerk.com) (free)
- [OpenAI API key](https://platform.openai.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/hazlijohar95/open-event.git
cd open-event

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# 4. Start Convex backend (in one terminal)
npx convex dev

# 5. Start frontend (in another terminal)
npm run dev

# 6. Open http://localhost:5173
```

### Environment Variables

```env
# Convex (auto-generated by npx convex dev)
VITE_CONVEX_URL=https://your-project.convex.cloud

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# OpenAI (set in Convex Dashboard → Settings → Environment Variables)
OPENAI_API_KEY=sk-...
```

---

## Project Structure

```
open-event/
├── 📁 convex/                    # Backend (Convex)
│   ├── 📁 actions/
│   │   └── agent.ts              # AI agent with OpenAI
│   ├── 📁 lib/agent/
│   │   ├── types.ts              # Tool type definitions
│   │   ├── tools.ts              # 9 AI tools (create event, search, etc.)
│   │   └── handlers.ts           # Tool execution logic
│   ├── 📁 mutations/
│   │   └── auth.ts               # User sync from Clerk
│   ├── 📁 queries/
│   │   └── auth.ts               # Auth queries
│   ├── schema.ts                 # Database schema
│   ├── events.ts                 # Event CRUD
│   ├── aiConversations.ts        # AI chat history
│   ├── vendors.ts                # Vendor queries
│   ├── sponsors.ts               # Sponsor queries
│   └── http.ts                   # HTTP streaming endpoint
│
├── 📁 src/                       # Frontend (React)
│   ├── 📁 components/
│   │   ├── 📁 agent/             # AI assistant UI
│   │   │   ├── ToolExecutionCard.tsx
│   │   │   ├── ToolConfirmationDialog.tsx
│   │   │   └── SearchResultsCard.tsx
│   │   ├── 📁 dashboard/         # Dashboard layout
│   │   ├── 📁 landing/           # Landing page sections
│   │   └── 📁 ui/                # ShadCN components
│   ├── 📁 pages/
│   │   ├── 📁 dashboard/
│   │   │   ├── EventCreatePage.tsx   # AI chat interface
│   │   │   ├── EventDetailPage.tsx   # Event details view
│   │   │   ├── EventsPage.tsx        # Events list
│   │   │   └── ...
│   │   ├── 📁 auth/              # Sign in/up pages
│   │   └── 📁 onboarding/        # User onboarding
│   ├── 📁 lib/
│   │   ├── utils.ts              # Utility functions
│   │   └── agent-tools.ts        # Tool configs for UI
│   └── 📁 test/
│       └── setup.ts              # Test configuration
│
├── 📁 docs/                      # Documentation
│   └── AGENT_SYSTEM.md           # AI system docs
│
├── CHANGELOG.md                  # Version history
├── CLAUDE.md                     # AI coding guidelines
└── README.md                     # This file
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |

---

## AI Agent System

The AI assistant uses OpenAI's function calling to provide an agentic experience:

### Available Tools

| Tool | Description | Confirmation |
|------|-------------|--------------|
| `createEvent` | Create a new event | Required |
| `updateEvent` | Update event details | Required |
| `getEventDetails` | Get event information | Auto |
| `getUpcomingEvents` | List upcoming events | Auto |
| `searchVendors` | Search for vendors | Auto |
| `addVendorToEvent` | Add vendor to event | Required |
| `searchSponsors` | Search for sponsors | Auto |
| `addSponsorToEvent` | Add sponsor to event | Required |
| `getUserProfile` | Get user preferences | Auto |

### How It Works

```
User Message → AI Agent → Tool Selection → Execution → Response
                  ↓
         ┌───────────────────┐
         │ OpenAI GPT-4o-mini │
         │ with Function      │
         │ Calling            │
         └───────────────────┘
                  ↓
         Tool requires confirmation?
                  ↓
         Yes → Show confirmation dialog
         No  → Execute immediately
                  ↓
         Return results to user
```

See [docs/AGENT_SYSTEM.md](docs/AGENT_SYSTEM.md) for detailed documentation.

---

## Database Schema

### Core Tables

```typescript
// Users - Synced from Clerk
users: {
  clerkId: string
  email: string
  name: string
  role: 'superadmin' | 'organizer'
}

// Events - Main entity
events: {
  organizerId: Id<'users'>
  title: string
  description?: string
  eventType?: string
  startDate: number
  endDate?: number
  locationType?: 'in-person' | 'virtual' | 'hybrid'
  venueName?: string
  expectedAttendees?: number
  budget?: number
  status: 'draft' | 'planning' | 'active' | 'completed'
}

// AI Conversations
aiConversations: {
  userId: Id<'users'>
  eventId?: Id<'events'>
  status: 'active' | 'completed' | 'abandoned'
  purpose?: string
}

// AI Messages
aiMessages: {
  conversationId: Id<'aiConversations'>
  role: 'user' | 'assistant' | 'system'
  content: string
  toolCalls?: ToolCall[]
  isStreaming?: boolean
}
```

---

## Testing

The project includes 69 unit tests:

```bash
# Run all tests
npm run test:run

# Watch mode
npm run test

# With coverage
npm run test:coverage
```

### Test Coverage

| Component | Tests |
|-----------|-------|
| Agent Tools Config | 18 |
| ToolExecutionCard | 11 |
| ToolConfirmationDialog | 19 |
| SearchResultsCard | 21 |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Roadmap

- [x] AI Event Creation Assistant
- [x] Event Detail Page
- [x] Error Handling with Toast Notifications
- [x] Tool Confirmation System
- [ ] Streaming Chat Responses
- [ ] Vendor Management
- [ ] Sponsor Management
- [ ] Event Analytics
- [ ] Email Notifications
- [ ] Calendar Integration

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [Convex](https://convex.dev) - Real-time backend
- [Clerk](https://clerk.com) - Authentication
- [OpenAI](https://openai.com) - AI capabilities
- [ShadCN UI](https://ui.shadcn.com) - Component library
- [Phosphor Icons](https://phosphoricons.com) - Icon set
