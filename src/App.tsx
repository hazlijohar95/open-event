import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { InstallPrompt, UpdatePrompt } from '@/components/pwa'
import {
  Hero,
  LogoCloud,
  CoreConcept,
  FeaturesByUser,
  AIAgent,
  WhyOpenSource,
  FAQ,
  CallToAction,
  Footer,
} from '@/components/landing'
import { SignIn, SignUp } from '@/pages/auth'
import { AuthRedirect } from '@/components/auth/AuthRedirect'
import { Onboarding, OnboardingComplete } from '@/pages/onboarding'
import {
  DashboardOverview,
  EventsPage,
  EventCreatePage,
  EventDetailPage,
  EventEditPage,
  EventApplicationsPage,
  EventBudgetPage,
  EventTasksPage,
  VendorsPage,
  SponsorsPage,
  AnalyticsPage,
  SettingsPage,
} from '@/pages/dashboard'
import { AppShell } from '@/components/app'
import { AdminLayout } from '@/components/admin'
import {
  AdminDashboard,
  AdminVendors,
  AdminSponsors,
  AdminUsers,
  AdminModeration,
  AdminSettings,
  AdminPublicApplications,
  AdminAIUsage,
} from '@/pages/admin'
import { PrivacyPolicy, TermsOfService, CookiePolicy } from '@/pages/legal'
import { DocsPage } from '@/pages/docs'
import { OpenSourcePage } from '@/pages/opensource'
import { EventDirectory, EventDetailPublic } from '@/pages/public'
import {
  VendorApplicationPage,
  SponsorApplicationPage,
  ApplicationSuccess,
} from '@/pages/apply'

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <Hero />
        <LogoCloud />
        <FeaturesByUser />
        <CoreConcept />
        <AIAgent />
        <WhyOpenSource />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  // Listen for service worker update events
  useEffect(() => {
    const handleSwUpdate = () => {
      setShowUpdatePrompt(true)
    }

    window.addEventListener('sw-update-available', handleSwUpdate)
    return () => window.removeEventListener('sw-update-available', handleSwUpdate)
  }, [])

  const handleUpdate = useCallback(() => {
    // Call the global updateSW function
    if (window.__updateSW) {
      window.__updateSW(true)
    } else {
      // Fallback: reload the page
      window.location.reload()
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          {/* Smart redirect based on role */}
          <Route path="/auth/redirect" element={<AuthRedirect />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/onboarding/complete" element={<OnboardingComplete />} />
          <Route path="/dashboard" element={<AppShell />}>
            <Route index element={<DashboardOverview />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/new" element={<EventCreatePage />} />
            <Route path="events/:eventId" element={<EventDetailPage />} />
            <Route path="events/:eventId/edit" element={<EventEditPage />} />
            <Route path="events/:eventId/applications" element={<EventApplicationsPage />} />
            <Route path="events/:eventId/budget" element={<EventBudgetPage />} />
            <Route path="events/:eventId/tasks" element={<EventTasksPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="sponsors" element={<SponsorsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="sponsors" element={<AdminSponsors />} />
            <Route path="applications" element={<AdminPublicApplications />} />
            <Route path="moderation" element={<AdminModeration />} />
            <Route path="ai-usage" element={<AdminAIUsage />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          {/* Public Routes */}
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/contributors" element={<OpenSourcePage />} />
          <Route path="/events" element={<EventDirectory />} />
          <Route path="/events/:eventId" element={<EventDetailPublic />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          {/* Apply Routes (Public - No Auth Required) */}
          <Route path="/apply/vendor" element={<VendorApplicationPage />} />
          <Route path="/apply/sponsor" element={<SponsorApplicationPage />} />
          <Route path="/apply/success" element={<ApplicationSuccess />} />
        </Routes>
        <Toaster />

        {/* PWA Components */}
        <InstallPrompt />
        {showUpdatePrompt && <UpdatePrompt onUpdate={handleUpdate} />}
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
