import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App.tsx'

// Clerk publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  console.warn('Missing VITE_CLERK_PUBLISHABLE_KEY - Auth will not work')
}

// Convex is optional for now - will be configured later
const convexUrl = import.meta.env.VITE_CONVEX_URL
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

function Providers({ children }: { children: React.ReactNode }) {
  // Wrap with Clerk if key exists
  let content = children

  if (clerkPubKey) {
    content = (
      <ClerkProvider publishableKey={clerkPubKey}>
        {content}
      </ClerkProvider>
    )
  }

  // Wrap with Convex if configured
  if (convex) {
    content = <ConvexProvider client={convex}>{content}</ConvexProvider>
  }

  return content
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
