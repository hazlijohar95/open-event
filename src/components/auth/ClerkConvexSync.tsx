import { useEffect, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'

/**
 * Syncs Clerk user data to Convex database.
 * This component should be rendered inside both ClerkProvider and ConvexProviderWithClerk.
 * It automatically syncs user data when the user signs in.
 */
export function ClerkConvexSync() {
  const { isSignedIn, isLoaded } = useAuth()
  const syncUser = useMutation(api.mutations.auth.syncUser)
  const hasSynced = useRef(false)

  useEffect(() => {
    // Only sync when Clerk is loaded and user is signed in
    if (!isLoaded) {
      console.log('[ClerkConvexSync] Waiting for Clerk to load...')
      return
    }

    if (!isSignedIn) {
      console.log('[ClerkConvexSync] User not signed in, skipping sync')
      hasSynced.current = false
      return
    }

    // Prevent duplicate syncs
    if (hasSynced.current) {
      console.log('[ClerkConvexSync] Already synced, skipping')
      return
    }

    console.log('[ClerkConvexSync] Starting user sync...')
    hasSynced.current = true

    // Sync user to Convex
    syncUser()
      .then((userId) => {
        console.log('[ClerkConvexSync] ✅ User synced to Convex successfully! User ID:', userId)
      })
      .catch((error) => {
        console.error('[ClerkConvexSync] ❌ Failed to sync user to Convex:', error)
        console.error('[ClerkConvexSync] Error details:', {
          message: error.message,
          stack: error.stack,
        })
        hasSynced.current = false // Allow retry on error
      })
  }, [isLoaded, isSignedIn, syncUser])

  return null
}
