import Google from '@auth/core/providers/google'
import Resend from '@auth/core/providers/resend'
import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth } from '@convex-dev/auth/server'

const SITE_URL = process.env.SITE_URL || 'http://localhost:5173'
const EMAIL_FROM = process.env.EMAIL_FROM || 'Open Event <noreply@openevent.app>'

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    // Email/Password authentication
    Password,
    // Google OAuth
    Google,
    // Magic Links via Resend
    Resend({
      from: EMAIL_FROM,
    }),
  ],
  callbacks: {
    async redirect({ redirectTo }) {
      // Handle relative paths by prepending SITE_URL
      if (redirectTo.startsWith('/')) {
        return `${SITE_URL}${redirectTo}`
      }
      // Allow URLs that start with SITE_URL
      if (redirectTo.startsWith(SITE_URL)) {
        return redirectTo
      }
      // Default to SITE_URL
      return SITE_URL
    },
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId }) {
      if (!existingUserId) {
        // New user - set default role to organizer
        await ctx.db.patch(userId, {
          role: 'organizer',
          createdAt: Date.now(),
        })
      } else {
        // Existing user - update timestamp
        await ctx.db.patch(userId, {
          updatedAt: Date.now(),
        })
      }
    },
  },
})
