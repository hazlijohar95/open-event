import { useState } from 'react'
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
  type Icon,
} from '@phosphor-icons/react'

type AudienceType = 'organizers' | 'sponsors' | 'vendors'

interface Step {
  number: number
  title: string
  description: string
  icon: Icon
}

const audienceSteps: Record<AudienceType, { label: string; steps: Step[] }> = {
  organizers: {
    label: 'Organizers',
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
        description: 'Real engagement metrics — booth visits, lead captures, brand impressions, not vanity numbers.',
        icon: ChartLineUp,
      },
    ],
  },
  vendors: {
    label: 'Vendors',
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

  const currentSteps = audienceSteps[activeAudience].steps

  return (
    <section className="relative py-24 sm:py-32 px-6 bg-muted/30 section-divider overflow-hidden">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-50" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div
          ref={ref}
          className={cn(
            'text-center space-y-6 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <h2 className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            How it works
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple workflows for every stakeholder. Pick your role.
          </p>
        </div>

        {/* Audience Tabs */}
        <div className="flex justify-center mt-12">
          <div className="inline-flex rounded-lg border border-border bg-background p-1">
            {(Object.keys(audienceSteps) as AudienceType[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveAudience(key)}
                className={cn(
                  'px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all cursor-pointer',
                  activeAudience === key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {audienceSteps[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Steps Grid with connecting line */}
        <div className="relative mt-16">
          {/* Connecting line - visible on md and up */}
          <div className="hidden md:block absolute top-[60px] left-[16.67%] right-[16.67%] h-px bg-border" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {currentSteps.map((step, index) => (
              <StepCard key={`${activeAudience}-${step.number}`} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function StepCard({ step, index }: { step: Step; index: number }) {
  const { ref, isVisible } = useScrollAnimation()
  const IconComponent = step.icon

  return (
    <div
      ref={ref}
      className={cn(
        'relative p-6 rounded-xl border border-border bg-background',
        'transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Step number */}
      <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-mono font-bold text-sm">
        {step.number}
      </div>

      {/* Icon */}
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mt-2">
        <IconComponent size={24} weight="duotone" className="text-primary" />
      </div>

      {/* Content */}
      <h3 className="font-mono text-lg font-semibold mb-2">{step.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
    </div>
  )
}
