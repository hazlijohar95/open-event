import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import { SquaresFour, Storefront, GitPullRequest, CheckSquare, Certificate, type Icon } from '@phosphor-icons/react'

const previews = [
  {
    icon: SquaresFour,
    title: 'Organizer Dashboard',
    description: 'A clean, minimal command-center for events. Wide spacing. Light borders. Monospace headings.',
  },
  {
    icon: Storefront,
    title: 'Vendor Marketplace',
    description: 'A clean grid of vendor cards with pricing and categories. "Compare" and "Select" built in.',
  },
  {
    icon: GitPullRequest,
    title: 'Sponsor Pipeline',
    description: 'Table or kanban view. AI summary panel on the right.',
  },
  {
    icon: CheckSquare,
    title: 'Logistics Checklist',
    description: 'AI-generated tasks with dependencies and status toggles.',
  },
  {
    icon: Certificate,
    title: 'Certificates Manager',
    description: 'Simple interface. Issue, download, send — one click.',
  },
]

export function ScreenPreviews() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="relative py-24 sm:py-32 px-6 bg-muted/30 section-divider overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern-subtle" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div
          ref={ref}
          className={cn(
            'text-center mb-16 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <h2 className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            A glimpse of the interface.
          </h2>
          <p className="text-lg text-muted-foreground mt-4">
            Screenshots coming soon — here's what to expect.
          </p>
        </div>

        {/* Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {previews.map((preview, index) => (
            <PreviewCard key={preview.title} {...preview} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PreviewCard({
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
        'group rounded-lg border border-dashed border-border bg-background overflow-hidden',
        'transition-all duration-500 hover:border-primary/30',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Placeholder Image Area */}
      <div className="aspect-video bg-muted/50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern-subtle" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <IconComponent size={48} weight="duotone" className="text-muted-foreground/30 relative z-10" />

        {/* Decorative elements */}
        <div className="absolute top-4 left-4 right-4 h-2 bg-muted-foreground/10 rounded" />
        <div className="absolute top-8 left-4 w-1/3 h-1.5 bg-muted-foreground/10 rounded" />
        <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
          <div className="h-8 bg-muted-foreground/10 rounded" />
          <div className="h-8 bg-muted-foreground/10 rounded" />
          <div className="h-8 bg-muted-foreground/10 rounded" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-mono text-sm font-semibold mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
