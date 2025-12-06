import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { AudienceToggle } from '@/components/ui/audience-toggle'
import { DemoModal } from '@/components/demo'
import { useAudienceToggle, type Audience } from '@/hooks/use-audience-toggle'
import {
  GithubLogo,
  Code,
  Rocket,
  Play,
  BookOpen,
  CaretDown,
  SignIn,
  type Icon,
} from '@phosphor-icons/react'

interface HeroContent {
  headline: string
  subheadline: string[]
  ctas: { label: string; icon: Icon; variant: 'default' | 'outline' | 'ghost' }[]
  badges: string[]
}

const content: Record<Audience, HeroContent> = {
  developer: {
    headline: 'The open-source event operations stack.',
    subheadline: [
      'Self-host or extend. Full API access.',
      'Build custom workflows for any event type.',
    ],
    ctas: [
      { label: 'View on GitHub', icon: GithubLogo, variant: 'default' },
      { label: 'Read Docs', icon: BookOpen, variant: 'outline' },
      { label: 'Try the API', icon: Code, variant: 'ghost' },
    ],
    badges: ['open-source', 'self-hostable', 'api-first'],
  },
  organizer: {
    headline: 'Run seamless events with the right partners.',
    subheadline: [
      'Find vetted sponsors and vendors, manage logistics with AI,',
      'and execute flawless events — all in one platform.',
    ],
    ctas: [
      { label: 'Book a Demo', icon: Rocket, variant: 'default' },
      { label: 'Watch Demo', icon: Play, variant: 'outline' },
      { label: 'See How It Works', icon: CaretDown, variant: 'ghost' },
    ],
    badges: ['ai-powered', 'all-in-one', 'open-source'],
  },
}

const floatAnimations = ['animate-float-slow', 'animate-float-medium', 'animate-float-fast']

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

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          {data.ctas.map(({ label, icon: IconComponent, variant }) => {
            const handleClick = () => {
              if (label === 'Watch Demo') onWatchDemo?.()
              else if (label === 'Book a Demo') onGetStarted?.()
              else if (label === 'View on GitHub') {
                window.open('https://github.com/hazlijohar95/open-event', '_blank')
              }
            }
            return (
              <Button
                key={label}
                size="lg"
                variant={variant}
                className="w-full sm:w-auto"
                onClick={handleClick}
              >
                {variant === 'default' ? (
                  <>
                    {label}
                    <IconComponent className="ml-2" size={18} weight="duotone" />
                  </>
                ) : (
                  <>
                    <IconComponent className="mr-2" size={18} weight="duotone" />
                    {label}
                  </>
                )}
              </Button>
            )
          })}
        </div>

        {/* Badge Row */}
        <div className="flex items-center justify-center gap-3 mt-12">
          {data.badges.map((badge, index) => (
            <span key={`${audienceKey}-${badge}`} className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className={floatAnimations[index % floatAnimations.length]}
              >
                {badge}
              </Badge>
              {index < data.badges.length - 1 && (
                <span className="text-muted-foreground">·</span>
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
      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="font-mono text-lg font-semibold">open-event</div>
        <div className="flex items-center gap-2 sm:gap-4">
          <AudienceToggle value={audience} onChange={setAudience} />
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2 ml-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/sign-in">
                <SignIn size={16} weight="duotone" className="mr-1.5" />
                Sign In
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/sign-up">Get Started</Link>
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="sm:hidden" asChild>
            <Link to="/sign-in">
              <SignIn size={20} weight="duotone" />
            </Link>
          </Button>
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
