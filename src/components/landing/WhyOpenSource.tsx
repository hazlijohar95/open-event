import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'

export function WhyOpenSource() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="py-24 sm:py-32 px-6">
      <div
        ref={ref}
        className={cn(
          'max-w-4xl mx-auto space-y-8 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        {/* Title */}
        <h2 className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Open by design. Controlled by the community.
        </h2>

        {/* Body */}
        <div className="space-y-6 text-lg sm:text-xl text-muted-foreground leading-relaxed">
          <p>
            Events should not be trapped inside closed ecosystems.
            <br />
            Vendors shouldn't fight for visibility.
            <br />
            Sponsors deserve transparent reporting.
            <br />
            Organizers need full control with zero lock-in.
          </p>

          <p>
            Open-Event is fully open-source, with an open API and a public roadmap.
          </p>
        </div>

        {/* Action items */}
        <div className="flex flex-wrap gap-4 pt-4">
          {['Audit it', 'Fork it', 'Extend it'].map((action, index) => (
            <span
              key={action}
              className={cn(
                'font-mono text-lg sm:text-xl font-medium px-4 py-2 rounded-lg',
                'bg-muted border border-border',
                'transition-all duration-300 hover:border-primary/50 hover:bg-primary/5'
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {action}.
            </span>
          ))}
        </div>

        {/* Closing */}
        <p className="text-xl sm:text-2xl font-medium pt-4">
          Build the event workflow you want.
        </p>
      </div>
    </section>
  )
}
