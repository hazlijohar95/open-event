import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import './index.css'
import App from './App.tsx'

// Clerk publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  console.warn('Missing VITE_CLERK_PUBLISHABLE_KEY - Auth will not work')
}

// Convex URL
const convexUrl = import.meta.env.VITE_CONVEX_URL
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

function Providers({ children }: { children: React.ReactNode }) {
  // Both Clerk and Convex configured - use integrated provider
  if (clerkPubKey && convex) {
    return (
      <ClerkProvider publishableKey={clerkPubKey}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    )
  }

  // Only Clerk configured
  if (clerkPubKey) {
    return (
      <ClerkProvider publishableKey={clerkPubKey}>
        {children}
      </ClerkProvider>
    )
  }

  // Only Convex configured
  if (convex) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>
  }

  // Neither configured
  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
