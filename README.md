<p align="center">
  <img src="https://raw.githubusercontent.com/hazlijohar95/open-event/main/.github/assets/logo.svg" alt="Open Event Logo" width="120" height="120">
</p>

<h1 align="center">Open Event</h1>

<p align="center">
  <strong>The open-source event management platform for modern teams</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <a href="https://github.com/hazlijohar95/open-event/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  </a>
  <a href="https://github.com/hazlijohar95/open-event/stargazers">
    <img src="https://img.shields.io/github/stars/hazlijohar95/open-event" alt="Stars">
  </a>
  <a href="https://github.com/hazlijohar95/open-event/issues">
    <img src="https://img.shields.io/github/issues/hazlijohar95/open-event" alt="Issues">
  </a>
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-19-61dafb.svg" alt="React">
  <img src="https://img.shields.io/badge/Convex-Backend-ff6b6b.svg" alt="Convex">
</p>

---

## Overview

Open Event is a comprehensive event management platform that connects **organizers**, **vendors**, and **sponsors** in one unified ecosystem. Built with modern technologies and designed for scalability, it provides everything you need to plan, manage, and execute successful events.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Open Event                              │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Organizers    │     Vendors     │         Sponsors            │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ • Create Events │ • Browse Events │ • Discover Opportunities    │
│ • Manage Tasks  │ • Apply to Join │ • Support Events            │
│ • Track Budget  │ • Get Hired     │ • Track Partnerships        │
│ • Find Partners │ • Build Profile │ • Manage Investments        │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

---

## Screenshots

### Dashboard Overview
```
┌─────────────────────────────────────────────────────────────┐
│  open-event                    Welcome back, User      🌙   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐                                            │
│  │ + Create    │   Overview Dashboard                       │
│  │   Event     │   ─────────────────────────                │
│  ├─────────────┤                                            │
│  │ Overview    │   ┌────────┐  ┌────────┐  ┌────────┐       │
│  │ Events    ◀ │   │ Total  │  │ Active │  │ Budget │       │
│  │ Vendors     │   │  12    │  │   4    │  │ $45K   │       │
│  │ Sponsors    │   └────────┘  └────────┘  └────────┘       │
│  │ Tasks       │                                            │
│  │ Budget      │   Recent Events                            │
│  │ Analytics   │   ┌──────────────────────────────────┐     │
│  └─────────────┘   │ Tech Conference 2024   [Active]  │     │
│                    │ Jan 15, 2024 • Convention Center │     │
│                    └──────────────────────────────────┘     │
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

## Features

### For Event Organizers

| Feature | Description |
|---------|-------------|
| **Event Dashboard** | Comprehensive overview with analytics, quick actions, and real-time updates |
| **AI Event Assistant** | Create events through natural conversation with AI |
| **Task Management** | Kanban-style task boards with categories, priorities, and due dates |
| **Budget Tracking** | Track expenses, manage budget items, and monitor spending |
| **Vendor Management** | Discover, invite, and manage vendors for your events |
| **Sponsor Outreach** | Find sponsors, send inquiries, and track partnerships |
| **Team Collaboration** | Invite team members and manage roles |

### For Vendors

| Feature | Description |
|---------|-------------|
| **Profile Showcase** | Build a professional profile with portfolio and services |
| **Event Discovery** | Browse public events looking for vendors |
| **Application System** | Apply to events with proposals and quotes |
| **Verified Status** | Get verified to build trust with organizers |

### For Sponsors

| Feature | Description |
|---------|-------------|
| **Sponsor Directory** | Showcase your brand and sponsorship offerings |
| **Event Matching** | Find events that align with your target audience |
| **Tier Options** | Offer different sponsorship tiers and benefits |
| **ROI Tracking** | Track your sponsorship investments |

### Platform Features

- **Real-time Updates** — Powered by Convex for instant data synchronization
- **Role-based Access** — Secure, granular permissions for all user types
- **Dark Mode** — Full theme support with system preference detection
- **Responsive Design** — Works beautifully on desktop, tablet, and mobile
- **Type Safety** — End-to-end TypeScript for reliability

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** 9+ or **pnpm**
- A [Convex](https://convex.dev) account (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/hazlijohar95/open-event.git
cd open-event

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Convex URL

# Start the development servers
npm run dev:all
```

This starts:
- **Frontend** at `http://localhost:5173`
- **Convex backend** in development mode

### Convex Setup

1. Create a free account at [convex.dev](https://convex.dev)
2. Create a new project
3. Copy your deployment URL to `.env`
4. Run `npx convex dev` to sync your schema

---

## Tech Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend                                  │
├─────────────────────────────────────────────────────────────────┤
│  React 19  │  TypeScript  │  Vite  │  TailwindCSS  │  ShadCN   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend                                   │
├─────────────────────────────────────────────────────────────────┤
│  Convex (Database + Serverless Functions + Real-time Sync)     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Authentication                               │
├─────────────────────────────────────────────────────────────────┤
│  Convex Auth  │  Google OAuth  │  Email/Pass                    │
└─────────────────────────────────────────────────────────────────┘
```

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite 7, TailwindCSS 4, ShadCN UI |
| **Backend** | Convex (queries, mutations, real-time subscriptions) |
| **Auth** | Convex Auth with Google OAuth, Email/Password |
| **Icons** | Phosphor Icons (duotone weight) |
| **Fonts** | Geist Sans & Geist Mono |
| **Testing** | Vitest, React Testing Library, Playwright |
| **AI** | OpenAI GPT-4o-mini (AI assistant) |

---

## Project Structure

```
open-event/
├── convex/                 # Backend (Convex functions)
│   ├── schema.ts          # Database schema
│   ├── events.ts          # Event queries & mutations
│   ├── vendors.ts         # Vendor management
│   ├── sponsors.ts        # Sponsor management
│   ├── eventVendors.ts    # Event-vendor relationships
│   ├── eventSponsors.ts   # Event-sponsor relationships
│   ├── eventTasks.ts      # Task management
│   ├── budgetItems.ts     # Budget tracking
│   ├── inquiries.ts       # Communication system
│   ├── eventApplications.ts # Application workflow
│   ├── auth.ts            # Auth configuration
│   └── lib/
│       ├── auth.ts        # Auth helpers
│       └── agent/         # AI Agent System
│           ├── types.ts   # Tool & message types
│           ├── tools.ts   # Tool definitions (13 tools)
│           └── handlers.ts # Tool execution handlers
│
├── src/
│   ├── components/
│   │   ├── ui/            # ShadCN UI components
│   │   ├── app/           # App shell, sidebar, topbar
│   │   ├── landing/       # Landing page sections (9 components)
│   │   ├── admin/         # Admin components
│   │   ├── agentic/       # AI chat assistant
│   │   ├── chat/          # Chat UI components
│   │   ├── auth/          # Authentication components
│   │   ├── demo/          # Demo modal and scenes
│   │   └── onboarding/    # User onboarding flow
│   │
│   ├── pages/
│   │   ├── dashboard/     # Dashboard pages
│   │   ├── auth/          # Authentication pages
│   │   ├── admin/         # Admin pages
│   │   └── public/        # Public pages
│   │
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript types
│
├── e2e/                   # End-to-end tests (Playwright)
└── public/                # Static assets
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend development server |
| `npm run dev:backend` | Start Convex development server |
| `npm run dev:all` | Start both frontend and backend |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (watch mode) |
| `npm run test:run` | Run unit tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run end-to-end tests |

---

## Environment Variables

See [`.env.example`](.env.example) for all available configuration options.

### Required Variables

| Variable | Description |
|----------|-------------|
| `VITE_CONVEX_URL` | Your Convex deployment URL |

### Optional Variables (Convex Dashboard)

| Variable | Description |
|----------|-------------|
| `SITE_URL` | Your production URL (for OAuth redirects) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `AUTH_RESEND_KEY` | Resend API key for password reset emails |
| `EMAIL_FROM` | Email sender address |
| `OPENAI_API_KEY` | OpenAI API key (for AI features) |

---

## Database Schema

```
┌──────────────┐     ┌───────────────┐     ┌────────────────┐
│    users     │────▶│    events     │◀────│  eventTasks    │
└──────────────┘     └───────────────┘     └────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌──────────────┐   ┌───────────────┐   ┌───────────────┐
│ eventVendors │   │eventSponsors  │   │  budgetItems  │
└──────────────┘   └───────────────┘   └───────────────┘
         │                  │
         ▼                  ▼
┌──────────────┐   ┌───────────────┐
│   vendors    │   │   sponsors    │
└──────────────┘   └───────────────┘
```

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts with roles (organizer, admin, superadmin) |
| `events` | Events with status workflow (draft → planning → active → completed) |
| `vendors` | Vendor profiles and verification status |
| `sponsors` | Sponsor profiles and offerings |
| `eventVendors` | Event-vendor relationships |
| `eventSponsors` | Event-sponsor relationships |
| `eventTasks` | Task management for events |
| `budgetItems` | Budget tracking and expenses |
| `inquiries` | Communication between organizers and vendors/sponsors |
| `eventApplications` | Vendor/sponsor applications to events |

---

## AI Agent System

The AI assistant uses OpenAI's function calling to provide a truly **agentic experience**. It can perform real actions on your behalf, not just answer questions.

### Available Tools (13 Tools)

#### Event Management
| Tool | Description | Confirmation |
|------|-------------|--------------|
| `createEvent` | Create a new event with full details | Required |
| `updateEvent` | Update event details | Required |
| `getEventDetails` | Get event information | Auto |
| `getUpcomingEvents` | List upcoming events | Auto |

#### Vendor Management
| Tool | Description | Confirmation |
|------|-------------|--------------|
| `searchVendors` | Search for vendors by category | Auto |
| `addVendorToEvent` | Add vendor to event (creates inquiry) | Required |
| `getRecommendedVendors` | Get AI-matched vendor recommendations | Auto |
| `getEventVendors` | List vendors linked to an event | Auto |

#### Sponsor Management
| Tool | Description | Confirmation |
|------|-------------|--------------|
| `searchSponsors` | Search for sponsors by industry | Auto |
| `addSponsorToEvent` | Add sponsor to event (creates inquiry) | Required |
| `getRecommendedSponsors` | Get AI-matched sponsor recommendations | Auto |
| `getEventSponsors` | List sponsors linked to an event | Auto |

#### Profile
| Tool | Description | Confirmation |
|------|-------------|--------------|
| `getUserProfile` | Get user preferences for personalization | Auto |

### Intelligent Matching

The agent includes smart recommendation tools that score vendors and sponsors based on:
- **Vendors**: Rating, verification status, price range vs. event budget
- **Sponsors**: Verification, target event types, budget alignment with event size

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
         Persist to database → Return results to user
```

### Security

All agent actions are:
- **Authenticated**: Requires valid user session
- **Authorized**: Verifies resource ownership before modifications
- **Validated**: Input validation and status whitelisting
- **Auditable**: All changes are timestamped

---

## Testing

The project includes comprehensive testing:

```bash
# Run all unit tests (114 tests)
npm run test:run

# Watch mode
npm run test

# With coverage
npm run test:coverage

# End-to-end tests
npm run test:e2e
```

### Test Coverage

| Category | Tests |
|----------|-------|
| Agent Tools Config | 18 |
| ToolExecutionCard | 11 |
| ToolConfirmationDialog | 19 |
| SearchResultsCard | 21 |
| Other Components | 45+ |

---

## Roadmap

- [x] AI Event Creation Assistant
- [x] Event Dashboard with Analytics
- [x] Vendor Management System
- [x] Sponsor Management System
- [x] Task Management (Kanban)
- [x] Budget Tracking
- [x] Inquiry System
- [x] Application Workflow
- [x] Role-based Access Control
- [x] Dark Mode Support
- [ ] Email Notifications
- [ ] Calendar Integration
- [ ] Mobile App
- [ ] Event Templates
- [ ] Advanced Analytics

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test:run && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Convex](https://convex.dev) - Real-time backend platform
- [ShadCN UI](https://ui.shadcn.com) - UI component library
- [Phosphor Icons](https://phosphoricons.com) - Icon library
- [Geist](https://vercel.com/font) - Font family
- [OpenAI](https://openai.com) - AI capabilities

---

<p align="center">
  Researched & designed by <a href="https://github.com/hazlijohar95">Hazli</a> · Built by <a href="https://github.com/azmir32">Azmir</a>
</p>

<p align="center">
  <a href="https://github.com/hazlijohar95/open-event/issues">Report Bug</a>
  •
  <a href="https://github.com/hazlijohar95/open-event/issues">Request Feature</a>
</p>
