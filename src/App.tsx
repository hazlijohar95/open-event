import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/onboarding/complete" element={<OnboardingComplete />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
