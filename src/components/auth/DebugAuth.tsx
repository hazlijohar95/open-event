import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'

/**
 * Temporary debug component to inspect Clerk tokens
 * This will help us see what's in the JWT
 */
export function DebugAuth() {
  const { getToken, isSignedIn } = useAuth()

  useEffect(() => {
    if (!isSignedIn) return

    const debugToken = async () => {
      try {
        // Get the Convex token
        const token = await getToken({ template: 'convex' })
        
        if (!token) {
          console.log('🔴 [DebugAuth] No token received')
          return
        }

        // Decode JWT (simple base64 decode, not verification)
        const parts = token.split('.')
        if (parts.length !== 3) {
          console.log('🔴 [DebugAuth] Invalid JWT format')
          return
        }

        const payload = JSON.parse(atob(parts[1]))
        
        console.log('🔍 [DebugAuth] JWT Payload:', {
          iss: payload.iss,
          aud: payload.aud,
          sub: payload.sub,
          exp: payload.exp,
          iat: payload.iat,
          fullPayload: payload
        })

        // Check critical claims
        if (payload.aud !== 'convex') {
          console.error('❌ [DebugAuth] PROBLEM: aud claim is not "convex"')
          console.error('   Current aud:', payload.aud)
          console.error('   Expected: "convex"')
        } else {
          console.log('✅ [DebugAuth] aud claim is correct: "convex"')
        }

        if (payload.iss !== 'https://infinite-catfish-76.clerk.accounts.dev') {
          console.error('❌ [DebugAuth] PROBLEM: iss claim does not match')
          console.error('   Current iss:', payload.iss)
          console.error('   Expected: "https://infinite-catfish-76.clerk.accounts.dev"')
        } else {
          console.log('✅ [DebugAuth] iss claim is correct')
        }
      } catch (error) {
        console.error('🔴 [DebugAuth] Error decoding token:', error)
      }
    }

    debugToken()
  }, [isSignedIn, getToken])

  return null
}
