import { useState, useEffect } from 'react'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import {
  Calendar,
  MagnifyingGlass,
  Rocket,
  Binoculars,
  Target,
  ChartLineUp,
  Storefront,
  UsersThree,
  Handshake,
  Sparkle,
  ArrowRight,
  type Icon,
} from '@phosphor-icons/react'

type AudienceType = 'organizers' | 'sponsors' | 'vendors'

interface Step {
  number: number
  title: string
  description: string
  icon: Icon
}

const audienceData: Record<AudienceType, {
  label: string
  emoji: string
  color: string
  borderColor: string
  textColor: string
  steps: Step[]
}> = {
  organizers: {
    label: 'Organizers',
    emoji: '🎯',
    color: 'indigo',
    borderColor: 'border-indigo-400 dark:border-indigo-500',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    steps: [
      {
        number: 1,
        title: 'Create Event',
        description: 'Set requirements, budget, timeline, and what you need from sponsors and vendors.',
        icon: Calendar,
      },
      {
        number: 2,
        title: 'Discover Partners',
        description: 'Browse AI-matched sponsors and vendors. Compare pricing, reviews, and availability.',
        icon: MagnifyingGlass,
      },
      {
        number: 3,
        title: 'Execute',
        description: 'Manage logistics, track progress, and generate reports — all in one dashboard.',
        icon: Rocket,
      },
    ],
  },
  sponsors: {
    label: 'Sponsors',
    emoji: '💰',
    color: 'amber',
    borderColor: 'border-amber-400 dark:border-amber-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    steps: [
      {
        number: 1,
        title: 'Browse Events',
        description: 'Filter by industry, audience size, location, and sponsorship tier availability.',
        icon: Binoculars,
      },
      {
        number: 2,
        title: 'Apply & Get Matched',
        description: 'AI scores your fit and shows expected ROI based on audience alignment.',
        icon: Target,
      },
      {
        number: 3,
        title: 'Track Results',
        description: 'Real engagement metrics — booth visits, lead captures, brand impressions.',
        icon: ChartLineUp,
      },
    ],
  },
  vendors: {
    label: 'Vendors',
    emoji: '🏪',
    color: 'emerald',
    borderColor: 'border-emerald-400 dark:border-emerald-500',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    steps: [
      {
        number: 1,
        title: 'List Services',
        description: 'Add your pricing, portfolio, availability, and service categories.',
        icon: Storefront,
      },
      {
        number: 2,
        title: 'Get Discovered',
        description: 'Organizers find you through search and AI recommendations — no cold outreach.',
        icon: UsersThree,
      },
      {
        number: 3,
        title: 'Win Contracts',
        description: 'Transparent bidding, secure payments, and repeat client management.',
        icon: Handshake,
      },
    ],
  },
}

export function CoreConcept() {
  const { ref, isVisible } = useScrollAnimation()
  const [activeAudience, setActiveAudience] = useState<AudienceType>('organizers')
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const currentData = audienceData[activeAudience]

  // Auto-advance through steps for demo effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [activeAudience])

  const handleTabChange = (audience: AudienceType) => {
    if (audience === activeAudience) return
    setIsAnimating(true)
    setActiveStep(0)
    setTimeout(() => {
      setActiveAudience(audience)
      setIsAnimating(false)
    }, 200)
  }

  return (
    <section className="relative py-20 sm:py-28 px-6 overflow-hidden">
      {/* Clean subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div
          ref={ref}
          className={cn(
            'text-center mb-12 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            How it{' '}
            <span className="relative inline-block">
              works
              <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                <path d="M0 5 Q25 0 50 5 T100 5" stroke="currentColor" strokeWidth="2" fill="none" className="text-amber-400" />
              </svg>
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Three steps for everyone. Pick your role.
          </p>
        </div>

        {/* Minimal tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 p-1 rounded-full border border-border bg-background">
            {(Object.keys(audienceData) as AudienceType[]).map((key) => {
              const data = audienceData[key]
              const isActive = activeAudience === key
              return (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer',
                    isActive
                      ? `${data.textColor} bg-muted/50`
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="text-base">{data.emoji}</span>
                  <span className="hidden sm:inline">{data.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Steps */}
        <div className={cn(
          'transition-all duration-300',
          isAnimating && 'opacity-0 scale-95'
        )}>
          {/* Progress dots */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={cn(
                    'transition-all duration-300 cursor-pointer rounded-full',
                    activeStep === i
                      ? `w-6 h-1.5 ${currentData.textColor.replace('text-', 'bg-')}`
                      : 'w-1.5 h-1.5 bg-border hover:bg-muted-foreground/50'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {currentData.steps.map((step, index) => (
              <StepCard
                key={`${activeAudience}-${step.number}`}
                step={step}
                index={index}
                isActive={activeStep === index}
                borderColor={currentData.borderColor}
                textColor={currentData.textColor}
              />
            ))}
          </div>

          {/* Connecting line on desktop */}
          <div className="hidden md:flex justify-center mt-8">
            <div className="flex items-center gap-2 text-muted-foreground/40">
              <div className="w-16 h-px bg-border" />
              <ArrowRight size={14} weight="bold" />
              <div className="w-16 h-px bg-border" />
              <ArrowRight size={14} weight="bold" />
              <div className="w-16 h-px bg-border" />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground/50 flex items-center justify-center gap-2">
              <Sparkle size={12} weight="fill" className="text-amber-400" />
              That's it. No 47-step onboarding.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function StepCard({
  step,
  index,
  isActive,
  borderColor,
  textColor,
}: {
  step: Step
  index: number
  isActive: boolean
  borderColor: string
  textColor: string
}) {
  const { ref, isVisible } = useScrollAnimation()
  const IconComponent = step.icon

  return (
    <div
      ref={ref}
      className={cn(
        'relative p-6 rounded-2xl border bg-card transition-all duration-500',
        isActive
          ? `${borderColor} border-2`
          : 'border-border hover:border-border/80',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Step number - minimal outline style */}
      <div className={cn(
        'absolute -top-3 left-6 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-background transition-all duration-300',
        isActive ? borderColor : 'border-border',
        isActive ? textColor : 'text-muted-foreground'
      )}>
        {step.number}
      </div>

      {/* Icon - minimal with color on active */}
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center mb-4 mt-2 border transition-all duration-300',
        isActive
          ? `${borderColor} border-2`
          : 'border-border'
      )}>
        <IconComponent
          size={24}
          weight="duotone"
          className={cn(
            'transition-colors duration-300',
            isActive ? textColor : 'text-muted-foreground'
          )}
        />
      </div>

      {/* Title with color accent when active */}
      <h3 className={cn(
        'text-lg font-semibold mb-2 transition-colors duration-300',
        isActive ? textColor : 'text-foreground'
      )}>
        {step.title}
      </h3>

      {/* Description */}
      <p className={cn(
        'text-sm leading-relaxed transition-colors duration-300',
        isActive ? 'text-foreground' : 'text-muted-foreground'
      )}>
        {step.description}
      </p>
    </div>
  )
}
