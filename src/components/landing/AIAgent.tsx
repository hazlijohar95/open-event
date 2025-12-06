import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import { Sparkles, TrendingUp, CalendarCheck, FileText, Award } from 'lucide-react'

const capabilities = [
  {
    icon: Sparkles,
    title: 'Sponsor Intelligence',
    description: 'Recommends sponsors based on event type, audience, and requirements.',
  },
  {
    icon: TrendingUp,
    title: 'Vendor Insights',
    description: 'Compares vendor pricing, suitability, reviews, and availability.',
  },
  {
    icon: CalendarCheck,
    title: 'Logistics Planner',
    description: 'Generates checklists, tasks, dependencies, and timelines.',
  },
  {
    icon: FileText,
    title: 'Outcome Reports',
    description: 'Creates sponsor-ready post-event reports + analytics instantly.',
  },
  {
    icon: Award,
    title: 'Certificates Engine',
    description: 'Issues credits and participation certificates for volunteers and attendees.',
  },
]

export function AIAgent() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="py-24 sm:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          ref={ref}
          className={cn(
            'max-w-3xl space-y-6 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <h2 className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Your AI operations partner.
          </h2>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Open-Event includes an AI agent designed for the real problems event
            organizers face.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {capabilities.map((capability, index) => (
            <CapabilityCard key={capability.title} {...capability} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CapabilityCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: typeof Sparkles
  title: string
  description: string
  index: number
}) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={cn(
        'group relative p-6 rounded-lg border border-border bg-background',
        'transition-all duration-500 hover:-translate-y-1 hover:shadow-lg',
        'hover:border-primary/20 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Gradient accent */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-mono text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
