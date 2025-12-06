import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import { Package, Handshake, Users, Clipboard, type Icon } from '@phosphor-icons/react'

const features = [
  {
    icon: Package,
    title: 'Suppliers',
    description: 'Vendors submit packages → superadmin approves → organizers compare & select.',
  },
  {
    icon: Handshake,
    title: 'Sponsors',
    description: 'Sponsors apply → AI evaluates fit → organizers approve and track deliverables.',
  },
  {
    icon: Users,
    title: 'Volunteers',
    description: 'Volunteers join → organizers assign roles → certificates issued automatically.',
  },
  {
    icon: Clipboard,
    title: 'Logistics',
    description: 'Tasks, materials, timelines, operations — everything structured and manageable.',
  },
]

export function CoreConcept() {
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
            An event operations OS.
          </h2>

          <div className="text-lg sm:text-xl text-muted-foreground leading-relaxed space-y-1">
            <p>One dashboard.</p>
            <p>One operational flow.</p>
            <p>Superadmins approve data.</p>
            <p>Organizers run the event.</p>
            <p>Vendors, sponsors, and volunteers submit through simple forms.</p>
            <p className="font-medium text-foreground">AI handles the heavy lifting.</p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon: IconComponent,
  title,
  description,
  index,
}: {
  icon: Icon
  title: string
  description: string
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
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <IconComponent size={24} weight="duotone" className="text-primary" />
      </div>
      <h3 className="font-mono text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
