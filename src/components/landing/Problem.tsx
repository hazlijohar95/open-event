import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'

export function Problem() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="py-24 sm:py-32 px-6 section-divider">
      <div
        ref={ref}
        className={cn(
          'max-w-4xl mx-auto space-y-8 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        {/* Title */}
        <h2 className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Event ops is broken.
        </h2>

        {/* Body - 3 audiences */}
        <div className="space-y-6 text-lg sm:text-xl text-muted-foreground leading-relaxed">
          <p>
            <span className="text-foreground font-medium">Organizers</span> waste weeks
            chasing vendors, vetting sponsors, and managing volunteers across 10+ tools.
          </p>

          <p>
            <span className="text-foreground font-medium">Sponsors</span> can't measure ROI
            or find the right events to back.
          </p>

          <p>
            <span className="text-foreground font-medium">Vendors</span> miss opportunities
            because there's no central marketplace.
          </p>
        </div>

        {/* Closing line */}
        <div className="pt-4 border-l-4 border-primary pl-6">
          <p className="text-xl sm:text-2xl font-medium">
            Open-Event fixes all of this.
          </p>
        </div>
      </div>
    </section>
  )
}
