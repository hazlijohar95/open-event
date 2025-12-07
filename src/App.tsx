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
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { AdminLayout } from '@/components/admin'
import {
  AdminDashboard,
  AdminVendors,
  AdminSponsors,
  AdminUsers,
  AdminModeration,
  AdminSettings,
  AdminPublicApplications,
} from '@/pages/admin'
import { PrivacyPolicy, TermsOfService } from '@/pages/legal'
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
          {/* Smart redirect based on role */}
          <Route path="/auth/redirect" element={<AuthRedirect />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/onboarding/complete" element={<OnboardingComplete />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
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
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          {/* Public Routes */}
          <Route path="/events" element={<EventDirectory />} />
          <Route path="/events/:eventId" element={<EventDetailPublic />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          {/* Apply Routes (Public - No Auth Required) */}
          <Route path="/apply/vendor" element={<VendorApplicationPage />} />
          <Route path="/apply/sponsor" element={<SponsorApplicationPage />} />
          <Route path="/apply/success" element={<ApplicationSuccess />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
