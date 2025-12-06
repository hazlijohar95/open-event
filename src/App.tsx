import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import {
  Hero,
  Problem,
  CoreConcept,
  FeaturesByUser,
  AIAgent,
  SocialProof,
  UseCases,
  WhyOpenSource,
  OpenAPI,
  ScreenPreviews,
  FAQ,
  CallToAction,
  Footer,
} from '@/components/landing'
import { SignIn, SignUp } from '@/pages/auth'
import { Onboarding, OnboardingComplete } from '@/pages/onboarding'
import { Dashboard } from '@/pages/dashboard'
import { PrivacyPolicy, TermsOfService } from '@/pages/legal'
import { ClerkConvexSync } from '@/components/auth/ClerkConvexSync'

// Check if Convex is configured
const isConvexConfigured = Boolean(import.meta.env.VITE_CONVEX_URL)

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <Hero />
        <Problem />
        <CoreConcept />
        <FeaturesByUser />
        <AIAgent />
        <SocialProof />
        <UseCases />
        <WhyOpenSource />
        <OpenAPI />
        <ScreenPreviews />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        {/* Sync Clerk user to Convex when signed in */}
        {isConvexConfigured && <ClerkConvexSync />}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-in/sso-callback" element={<AuthenticateWithRedirectCallback />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/onboarding/complete" element={<OnboardingComplete />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
