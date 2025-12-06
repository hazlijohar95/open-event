import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { AudienceToggle } from '@/components/ui/audience-toggle'
import { Logo } from '@/components/ui/logo'
import { DemoModal } from '@/components/demo'
import { useAudienceToggle, type Audience } from '@/hooks/use-audience-toggle'
import {
  GithubLogo,
  ArrowRight,
  Play,
  SignIn,
} from '@phosphor-icons/react'

interface HeroContent {
  headline: string
  subheadline: string[]
  primaryCta: { label: string; action: 'github' | 'signup' }
  secondaryCta: { label: string; action: 'docs' | 'demo' }
  badges: string[]
}

const content: Record<Audience, HeroContent> = {
  developer: {
    headline: 'The open-source event operations stack.',
    subheadline: [
      'Self-host or extend. Full API access.',
      'Build custom workflows for any event type.',
    ],
    primaryCta: { label: 'View on GitHub', action: 'github' },
    secondaryCta: { label: 'Read the docs', action: 'docs' },
    badges: ['open-source', 'self-hostable', 'api-first'],
  },
  organizer: {
    headline: 'Run seamless events with the right partners.',
    subheadline: [
      'Find vetted sponsors and vendors, manage logistics with AI,',
      'and execute flawless events — all in one platform.',
    ],
    primaryCta: { label: 'Get Started Free', action: 'signup' },
    secondaryCta: { label: 'Watch demo', action: 'demo' },
    badges: ['ai-powered', 'all-in-one', 'open-source'],
  },
}

function HeroContentLayer({
  data,
  isActive,
  audienceKey,
  onWatchDemo,
  onGetStarted,
}: {
  data: HeroContent
  isActive: boolean
  audienceKey: string
  onWatchDemo?: () => void
  onGetStarted?: () => void
}) {
  const handlePrimaryClick = () => {
    if (data.primaryCta.action === 'github') {
      window.open('https://github.com/hazlijohar95/open-event', '_blank')
    } else if (data.primaryCta.action === 'signup') {
      onGetStarted?.()
    }
  }

  const handleSecondaryClick = () => {
    if (data.secondaryCta.action === 'demo') {
      onWatchDemo?.()
    }
    // 'docs' action can link to docs page when ready
  }

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ease-out ${
        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
      }`}
    >
      <div className="max-w-4xl mx-auto text-center w-full px-6">
        {/* Headline */}
        <h1 className="font-mono text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          {data.headline}
        </h1>

        {/* Sub-headline */}
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-8">
          {data.subheadline[0]}
          <br className="hidden sm:block" />
          {data.subheadline[1]}
        </p>

        {/* CTAs - Clean 2-button layout */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
          <Button
            size="lg"
            className="w-full sm:w-auto group"
            onClick={handlePrimaryClick}
          >
            {data.primaryCta.label}
            {data.primaryCta.action === 'github' ? (
              <GithubLogo className="ml-2" size={18} weight="duotone" />
            ) : (
              <ArrowRight className="ml-2 transition-transform group-hover:translate-x-0.5" size={18} weight="bold" />
            )}
          </Button>

          <button
            onClick={handleSecondaryClick}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          >
            {data.secondaryCta.action === 'demo' && (
              <Play size={16} weight="fill" className="text-primary" />
            )}
            <span className="text-sm font-medium border-b border-transparent group-hover:border-current">
              {data.secondaryCta.label}
            </span>
          </button>
        </div>

        {/* Badge Row - Static, no animation */}
        <div className="flex items-center justify-center gap-2 mt-12">
          {data.badges.map((badge, index) => (
            <span key={`${audienceKey}-${badge}`} className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                {badge}
              </span>
              {index < data.badges.length - 1 && (
                <span className="text-muted-foreground/50">·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  const { audience, setAudience, isDeveloper } = useAudienceToggle()
  const [demoOpen, setDemoOpen] = useState(false)
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/sign-up')
  }

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Grid Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern-subtle" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <Logo />
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <AudienceToggle value={audience} onChange={setAudience} />
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-6">
            <Link
              to="/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Button size="sm" asChild>
              <Link to="/sign-up">Get Started</Link>
            </Button>
          </div>
          <Link to="/sign-in" className="sm:hidden text-muted-foreground hover:text-foreground transition-colors">
            <SignIn size={20} weight="duotone" />
          </Link>
        </div>
      </nav>

      {/* Hero Content - Stacked layers for crossfade */}
      <div className="flex-1 relative">
        <HeroContentLayer
          data={content.developer}
          isActive={isDeveloper}
          audienceKey="developer"
        />
        <HeroContentLayer
          data={content.organizer}
          isActive={!isDeveloper}
          audienceKey="organizer"
          onWatchDemo={() => setDemoOpen(true)}
          onGetStarted={handleGetStarted}
        />
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-20">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2" />
        </div>
      </div>

      {/* Demo Modal */}
      <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </section>
  )
}
