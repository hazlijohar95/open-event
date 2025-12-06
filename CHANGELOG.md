# Changelog

## [Unreleased] - 2024-12-06

### Added

#### AI Agent System
- **Agentic AI for Event Creation** (`convex/actions/agent.ts`)
  - OpenAI function calling integration with GPT-4o-mini
  - Agentic loop supporting up to 5 iterations for multi-step tasks
  - Tool confirmation system for sensitive operations
  - Automatic conversation history management

- **Agent Tool Library** (`convex/lib/agent/`)
  - `types.ts` - TypeScript types for tools, results, and responses
  - `tools.ts` - 9 OpenAI function schemas with validation
  - `handlers.ts` - Tool execution handlers for database operations

- **Agent UI Components** (`src/components/agent/`)
  - `ToolExecutionCard.tsx` - Visual feedback for tool execution status
  - `ToolConfirmationDialog.tsx` - User confirmation for sensitive actions
  - `SearchResultsCard.tsx` - Display vendor/sponsor search results
  - `index.ts` - Clean exports

- **Centralized Tool Config** (`src/lib/agent-tools.ts`)
  - Unified tool icons, labels, and descriptions
  - Helper functions: `getToolConfig()`, `getToolIcon()`, etc.

- **Event Create Page** (`src/pages/dashboard/EventCreatePage.tsx`)
  - Full chat interface for AI agent interaction
  - Real-time tool execution visualization
  - Automatic navigation on event creation

- **Convex Backend Extensions**
  - `convex/aiConversations.ts` - AI conversation CRUD
  - `convex/vendors.ts` - Vendor queries for agent
  - `convex/sponsors.ts` - Sponsor queries for agent
  - Extended `convex/events.ts` with full field support

- **Testing Framework**
  - Vitest configuration with React Testing Library
  - 69 unit tests for agent tools and components
  - Test setup with common mocks

- **Documentation**
  - `docs/AGENT_SYSTEM.md` - Full system documentation

### Changed

- **Events Mutations** (`convex/events.ts`)
  - Extended `create` mutation with location, budget, and attendee fields
  - Extended `update` mutation with same fields
  - Added undefined value filtering in updates

- **Main Entry** (`src/main.tsx`)
  - Moved `Providers` component to separate file for HMR compatibility

- **Package.json**
  - Added test scripts: `test`, `test:run`, `test:coverage`
  - Added dev dependencies: vitest, testing-library, jsdom

### Fixed

- Fixed `as any` type assertions with proper `Id<'table'>` types
- Fixed ESLint warnings in handlers and events
- Fixed React fast-refresh lint error in main.tsx

### Technical Notes for Backend Engineers

1. **Convex Dev Server Required**: Run `npx convex dev` to start the backend
2. **OpenAI API Key**: Required in `.env` as `OPENAI_API_KEY`
3. **Schema Changes**: New tables `aiConversations` and `aiMessages` added
4. **Seed Data**: Consider adding sample vendors/sponsors for testing

### Files Added
```
convex/
├── actions/agent.ts
├── lib/agent/types.ts
├── lib/agent/tools.ts
├── lib/agent/handlers.ts
├── aiConversations.ts
├── vendors.ts
├── sponsors.ts
├── organizerProfiles.ts

src/
├── components/agent/
│   ├── index.ts
│   ├── ToolExecutionCard.tsx
│   ├── ToolConfirmationDialog.tsx
│   └── SearchResultsCard.tsx
├── lib/agent-tools.ts
├── providers.tsx
├── test/setup.ts
├── pages/dashboard/
│   ├── EventCreatePage.tsx
│   ├── VendorsPage.tsx
│   ├── SponsorsPage.tsx
│   ├── SettingsPage.tsx
│   ├── AnalyticsPage.tsx
│   └── DashboardOverview.tsx

docs/AGENT_SYSTEM.md
vitest.config.ts
convex.json
```

### Files Modified
```
convex/events.ts
convex/schema.ts
package.json
src/main.tsx
src/App.tsx
src/pages/dashboard/index.ts
```
