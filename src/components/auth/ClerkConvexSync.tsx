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
    if (!isLoaded || !isSignedIn) {
      hasSynced.current = false
      return
    }

    // Prevent duplicate syncs
    if (hasSynced.current) {
      return
    }

    hasSynced.current = true

    // Sync user to Convex
    syncUser()
      .then(() => {
        console.log('User synced to Convex')
      })
      .catch((error) => {
        console.error('Failed to sync user to Convex:', error)
        hasSynced.current = false
      })
  }, [isLoaded, isSignedIn, syncUser])

  return null
}
