import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import { ShieldCheck, SquaresFour, Globe, type Icon } from '@phosphor-icons/react'

const userTypes = [
  {
    icon: ShieldCheck,
    title: 'Superadmin',
    features: [
      'Approve vendors',
      'Approve sponsors',
      'Approve volunteers (optional)',
      'Manage categories + platform-level configuration',
      'Maintain ecosystem cleanliness',
      'Oversee data across all events',
    ],
  },
  {
    icon: SquaresFour,
    title: 'Organizer Dashboard',
    features: [
      'Create and manage events',
      'View and compare approved vendors',
      'Manage sponsor applications',
      'Assign and approve volunteers',
      'Plan logistics',
      'Generate AI reports',
      'Issue certificates & credits',
    ],
  },
  {
    icon: Globe,
    title: 'Public Submission Portals',
    features: [
      'Vendor application',
      'Sponsor application',
      'Volunteer application',
    ],
    note: 'No accounts or logins required for external parties — one-click and done.',
  },
]

export function FeaturesByUser() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="py-24 sm:py-32 px-6 bg-muted/30">
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
            Features by user type.
          </h2>
        </div>

        {/* User Type Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {userTypes.map((userType, index) => (
            <UserTypeCard key={userType.title} {...userType} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function UserTypeCard({
  icon: IconComponent,
  title,
  features,
  note,
  index,
}: {
  icon: Icon
  title: string
  features: string[]
  note?: string
  index: number
}) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={cn(
        'p-6 rounded-lg border border-border bg-background',
        'transition-all duration-500',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <IconComponent size={20} weight="duotone" className="text-primary" />
        </div>
        <h3 className="font-mono text-xl font-semibold">{title}</h3>
      </div>

      {/* Features List */}
      <ul className="space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Note */}
      {note && (
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground italic">{note}</p>
        </div>
      )}
    </div>
  )
}
