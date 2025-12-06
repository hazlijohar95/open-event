# Open Event

Open-source event operations platform for organizers. Manage vendors, sponsors, volunteers, and logistics in one place.

## Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- TailwindCSS v4
- ShadCN UI

**Backend:**
- Convex (database, queries, mutations, storage, auth, realtime)

**AI (planned):**
- OpenAI, Anthropic, Groq

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Convex account (free at [convex.dev](https://convex.dev))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/open-event.git
   cd open-event
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Convex:
   ```bash
   npx convex dev
   ```
   This will prompt you to log in and create a new project. It will automatically create a `.env.local` file with your `VITE_CONVEX_URL`.

4. Start the development server:
   ```bash
   npm run dev
   ```

### Development Scripts

- `npm run dev` - Start Vite dev server
- `npm run dev:backend` - Start Convex dev server
- `npm run dev:all` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Project Structure

```
open-event/
├── convex/           # Convex backend
│   ├── schema.ts     # Database schema
│   ├── events.ts     # Event queries/mutations
│   └── users.ts      # User queries/mutations
├── src/
│   ├── components/   # React components
│   │   └── ui/       # ShadCN UI components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions
│   ├── pages/        # Page components
│   ├── services/     # API services
│   ├── types/        # TypeScript types
│   ├── App.tsx       # Main app component
│   └── main.tsx      # Entry point
├── .env.example      # Environment variables template
└── package.json
```

## License

MIT
