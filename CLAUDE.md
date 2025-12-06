# Claude Code Guidelines for Open-Event

This file contains project-specific guidelines and best practices that Claude should follow when working on this codebase.

---

## React Best Practices

### You Might Not Need an Effect

Reference: https://react.dev/learn/you-might-not-need-an-effect

#### When NOT to use `useEffect`:

1. **Deriving state from props/state** - Calculate during render instead
2. **Handling user events** - Use event handlers, not Effects
3. **Transforming data for rendering** - Compute in render or use `useMemo`
4. **Resetting state when props change** - Use `key` prop instead
5. **Notifying parent of state changes** - Update in the same event handler
6. **Chaining state updates** - Calculate all updates in the event handler

#### When TO use `useEffect`:

1. **Subscribing to external systems** (browser APIs, third-party libraries)
2. **Synchronizing with external stores** (consider `useSyncExternalStore`)
3. **Setting up event listeners** on window/document
4. **Intersection Observer, ResizeObserver, etc.**
5. **WebSocket connections**
6. **Analytics/logging that depends on rendered state**

#### Code Patterns

```tsx
// ❌ BAD: Deriving state with Effect
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(firstName + ' ' + lastName);
}, [firstName, lastName]);

// ✅ GOOD: Calculate during render
const fullName = firstName + ' ' + lastName;
```

```tsx
// ❌ BAD: Filtering with Effect
const [filteredList, setFilteredList] = useState(items);
useEffect(() => {
  setFilteredList(items.filter(item => item.active));
}, [items]);

// ✅ GOOD: Use useMemo for expensive computations
const filteredList = useMemo(
  () => items.filter(item => item.active),
  [items]
);

// ✅ BETTER: Calculate during render if not expensive
const filteredList = items.filter(item => item.active);
```

```tsx
// ❌ BAD: Resetting state with Effect
useEffect(() => {
  setComment('');
}, [userId]);

// ✅ GOOD: Use key to force remount
<CommentForm key={userId} userId={userId} />
```

```tsx
// ❌ BAD: Notifying parent in Effect
useEffect(() => {
  onChange(selectedItem);
}, [selectedItem, onChange]);

// ✅ GOOD: Call in event handler
function handleSelect(item) {
  setSelectedItem(item);
  onChange(item);
}
```

```tsx
// ❌ BAD: Chained Effects
useEffect(() => { setGoldCount(c => c + 1); }, [card]);
useEffect(() => { setRound(r => r + 1); }, [goldCount]);

// ✅ GOOD: Calculate all in event handler
function handlePlaceCard(nextCard) {
  const newGoldCount = nextCard.gold ? goldCount + 1 : goldCount;
  setCard(nextCard);
  setGoldCount(newGoldCount);
  if (newGoldCount >= 3) setRound(round + 1);
}
```

#### Checklist Before Using `useEffect`:

- [ ] Can this be calculated during render?
- [ ] Is this responding to a user event? (Use event handler instead)
- [ ] Am I syncing with an external system? (Valid use case)
- [ ] Am I creating a chain of state updates? (Refactor to event handler)
- [ ] Could I use `useMemo` or `useCallback` instead?
- [ ] Should I reset state? (Use `key` prop instead)

---

## Project Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS v4 + ShadCN UI
- **Backend**: Convex (database, queries, mutations, realtime)
- **AI**: OpenAI, Anthropic, Groq (planned)

### Folder Structure
```
src/
├── components/
│   ├── landing/     # Landing page sections
│   └── ui/          # ShadCN UI components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── pages/           # Page components
├── services/        # API services
└── types/           # TypeScript types

convex/
├── schema.ts        # Database schema
├── events.ts        # Event queries/mutations
└── users.ts         # User queries/mutations
```

### Import Aliases
- `@/` maps to `./src/`
- Example: `import { Button } from '@/components/ui/button'`

---

## Styling Guidelines

### Design System
- **Style**: Minimal & clean with generous whitespace
- **Typography**: Monospace (`font-mono`) for headlines
- **Theme**: System preference with dark/light toggle
- **Animations**: Moderate - scroll animations, hover effects

### Component Patterns
```tsx
// Use cn() for conditional classes
import { cn } from '@/lib/utils'

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'primary' && 'primary-classes'
)} />
```

### Animation Classes
- `animate-float-slow` - 4s floating animation
- `animate-float-medium` - 3s floating animation
- `animate-float-fast` - 3.5s floating animation

---

## Convex Guidelines

### Queries & Mutations
- Use typed validators from `convex/values`
- Always define argument schemas
- Use indexes for filtered queries

```tsx
// Query example
export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db.query('events').collect();
  },
});
```

### React Integration
```tsx
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

// In component
const events = useQuery(api.events.list);
const createEvent = useMutation(api.events.create);
```

---

## Code Quality

### TypeScript
- Strict mode enabled
- Define types in `src/types/`
- Avoid `any` - use `unknown` and narrow

### Performance
- Use `useMemo` for expensive computations
- Use `useCallback` for stable function references passed to children
- Avoid creating objects/arrays in render (move to constants or useMemo)

### Accessibility
- Use semantic HTML
- Include `aria-` attributes where needed
- Ensure keyboard navigation works
- Test with screen readers

---

## Git Workflow

- Commit messages should explain "why" not "what"
- Keep commits focused and atomic
- Run `npm run build` before committing to catch type errors
