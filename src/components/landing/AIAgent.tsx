import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import { Sparkle, TrendUp, CalendarCheck, FileText, Certificate, type Icon } from '@phosphor-icons/react'

const capabilities = [
  {
    icon: Sparkle,
    title: 'Sponsor Intelligence',
    description: 'AI recommends sponsors based on your event type and audience.',
    example: '"Find fintech sponsors with $50k+ budgets for a 500-person tech conference"',
  },
  {
    icon: TrendUp,
    title: 'Vendor Comparison',
    description: 'Compare pricing, reviews, and availability across vendors.',
    example: '"Compare catering vendors for 300 pax under $15k in KL"',
  },
  {
    icon: CalendarCheck,
    title: 'Logistics Planner',
    description: 'Auto-generate task lists, dependencies, and timelines.',
    example: '"Create a 3-day conference setup checklist with deadlines"',
  },
  {
    icon: FileText,
    title: 'Sponsor Reports',
    description: 'Generate post-event reports with real engagement metrics.',
    example: '"Generate ROI report for Gold sponsors with booth traffic data"',
  },
  {
    icon: Certificate,
    title: 'Certificate Engine',
    description: 'Issue participation certificates for volunteers and speakers.',
    example: '"Generate volunteer certificates with hours logged"',
  },
]

export function AIAgent() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="py-24 sm:py-32 px-6 bg-muted/30">
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
            AI that actually helps.
          </h2>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Not just chatbot fluff. Our AI agent solves real event operations problems.
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
  icon: IconComponent,
  title,
  description,
  example,
  index,
}: {
  icon: Icon
  title: string
  description: string
  example: string
  index: number
}) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={cn(
        'group relative p-6 rounded-xl border border-border bg-background',
        'transition-all duration-500 hover:-translate-y-1 hover:shadow-lg',
        'hover:border-primary/20',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <IconComponent size={24} weight="duotone" className="text-primary" />
      </div>
      <h3 className="font-mono text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>

      {/* Example prompt */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
        <p className="text-xs font-mono text-muted-foreground italic">{example}</p>
      </div>
    </div>
  )
}
