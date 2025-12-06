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
import {
  DashboardOverview,
  EventsPage,
  EventCreatePage,
  EventDetailPage,
  EventEditPage,
  VendorsPage,
  SponsorsPage,
  AnalyticsPage,
  SettingsPage,
} from '@/pages/dashboard'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { PrivacyPolicy, TermsOfService } from '@/pages/legal'

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
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/new" element={<EventCreatePage />} />
            <Route path="events/:eventId" element={<EventDetailPage />} />
            <Route path="events/:eventId/edit" element={<EventEditPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="sponsors" element={<SponsorsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
