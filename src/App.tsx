import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import {
  Hero,
  Problem,
  CoreConcept,
  WhyOpenSource,
  OpenAPI,
  AIAgent,
  FeaturesByUser,
  UseCases,
  ScreenPreviews,
  CallToAction,
  Footer,
} from '@/components/landing'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        <main>
          <Hero />
          <Problem />
          <CoreConcept />
          <WhyOpenSource />
          <OpenAPI />
          <AIAgent />
          <FeaturesByUser />
          <UseCases />
          <ScreenPreviews />
          <CallToAction />
        </main>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App
