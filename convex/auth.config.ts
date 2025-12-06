import { AuthConfig } from "convex/server";

/**
 * Convex Auth Configuration
 * 
 * This file configures authentication providers for Convex.
 * Currently set up for Clerk, but can be extended to support other providers.
 * 
 * Setup Instructions:
 * 1. Sign up for Clerk at https://clerk.com
 * 2. Create a new application in Clerk dashboard
 * 3. Go to JWT Templates → New Template → Select "Convex"
 * 4. Name it exactly "convex" (don't rename it)
 * 5. Copy the Issuer URL from the template
 * 6. Replace YOUR_ISSUER_URL below with your Clerk Issuer URL
 * 7. Get your Clerk Publishable Key and add it to .env.local as VITE_CLERK_PUBLISHABLE_KEY
 * 
 * For other providers, see: https://docs.convex.dev/auth
 */
export default {
  providers: [
    {
      domain: "https://infinite-catfish-76.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
