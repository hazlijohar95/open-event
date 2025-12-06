import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import { Code, Buildings, Bank, type Icon } from '@phosphor-icons/react'

const useCases = [
  {
    icon: Code,
    title: 'Hackathons & Developer Events',
    features: [
      'Volunteers',
      'Sponsors',
      'Outcome reports',
      'AI logistics',
      'Vendor coordination (food, equipment, venue)',
    ],
  },
  {
    icon: Buildings,
    title: 'Corporate Conferences & Summits',
    features: [
      'Vendor comparison',
      'Multi-tier sponsor applications',
      'Logistics planning',
      'Data-rich analytics',
    ],
  },
  {
    icon: Bank,
    title: 'Government & Public Events',
    features: [
      'Transparent vendor approval',
      'Volunteer management',
      'Reporting and documentation',
      'Procurement clarity',
    ],
  },
]

export function UseCases() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="py-24 sm:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          ref={ref}
          className={cn(
            'text-center mb-16 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <h2 className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Built for events of every size.
          </h2>
        </div>

        {/* Use Case Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <UseCaseCard key={useCase.title} {...useCase} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function UseCaseCard({
  icon: IconComponent,
  title,
  features,
  index,
}: {
  icon: Icon
  title: string
  features: string[]
  index: number
}) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={cn(
        'group p-6 rounded-lg border border-border bg-background',
        'transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Icon */}
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
        <IconComponent size={28} weight="duotone" className="text-primary" />
      </div>

      {/* Title */}
      <h3 className="font-mono text-lg font-semibold mb-4">{title}</h3>

      {/* Features */}
      <ul className="space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 mt-2 shrink-0" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
