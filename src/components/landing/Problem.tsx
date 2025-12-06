import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'

export function Problem() {
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
          Event management is messy.
        </h2>

        {/* Body */}
        <div className="space-y-6 text-lg sm:text-xl text-muted-foreground leading-relaxed">
          <p>
            Organizers juggle vendors, sponsors, logistics, volunteers, schedules,
            materials, certificates, and reporting — usually across dozens of
            spreadsheets, DMs, emails, and tools that don't talk to each other.
          </p>

          <p className="font-medium text-foreground">
            Ticketing solves ticketing.
            <br />
            But nobody solves event operations.
          </p>
        </div>

        {/* Closing line */}
        <div className="pt-4 border-l-4 border-primary pl-6">
          <p className="text-xl sm:text-2xl font-medium">
            Open-Event fixes this with one unified, open-source operations system.
          </p>
        </div>
      </div>
    </section>
  )
}
