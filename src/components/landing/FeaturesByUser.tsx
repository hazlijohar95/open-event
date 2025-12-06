import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import {
  Handshake,
  Storefront,
  Calendar,
  ChartLineUp,
  Target,
  UsersThree,
  CurrencyDollar,
  Star,
  ShieldCheck,
  Sparkle,
  Certificate,
  ClipboardText,
  type Icon,
} from '@phosphor-icons/react'

interface Benefit {
  icon: Icon
  text: string
}

const stakeholders = [
  {
    title: 'Sponsors Get',
    subtitle: 'Measurable ROI, not just logo placement',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    benefits: [
      { icon: ChartLineUp, text: 'Real engagement metrics (booth visits, QR scans, leads)' },
      { icon: Target, text: 'Audience match scoring before you commit' },
      { icon: UsersThree, text: 'Lead capture & attribution tracking' },
      { icon: ClipboardText, text: 'Post-event ROI reports generated automatically' },
      { icon: CurrencyDollar, text: 'Multi-event discount tracking' },
    ],
  },
  {
    title: 'Vendors Get',
    subtitle: 'Inbound opportunities, not cold outreach',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    benefits: [
      { icon: Calendar, text: 'Inbound event opportunities in your category' },
      { icon: CurrencyDollar, text: 'Transparent pricing (no bidding wars)' },
      { icon: Star, text: 'Reviews & ratings that build reputation' },
      { icon: UsersThree, text: 'Repeat client management' },
      { icon: ShieldCheck, text: 'Payment protection and contracts' },
    ],
  },
  {
    title: 'Organizers Get',
    subtitle: 'One dashboard to rule them all',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    benefits: [
      { icon: Storefront, text: 'Pre-vetted sponsor & vendor marketplace' },
      { icon: Sparkle, text: 'AI-powered matching & recommendations' },
      { icon: Handshake, text: 'Centralized logistics dashboard' },
      { icon: Certificate, text: 'Automated certificates & reports' },
      { icon: ClipboardText, text: 'Zero spreadsheet chaos' },
    ],
  },
]

export function FeaturesByUser() {
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
            Everyone wins.
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Practical benefits for every stakeholder — not just features.
          </p>
        </div>

        {/* Stakeholder Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {stakeholders.map((stakeholder, index) => (
            <StakeholderCard key={stakeholder.title} {...stakeholder} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StakeholderCard({
  title,
  subtitle,
  color,
  bgColor,
  benefits,
  index,
}: {
  title: string
  subtitle: string
  color: string
  bgColor: string
  benefits: Benefit[]
  index: number
}) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={cn(
        'p-6 rounded-xl border border-border bg-card',
        'transition-all duration-500 hover:shadow-lg',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className={cn('font-mono text-xl font-bold', color)}>{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>

      {/* Benefits List */}
      <ul className="space-y-4">
        {benefits.map((benefit, i) => {
          const IconComponent = benefit.icon
          return (
            <li key={i} className="flex items-start gap-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', bgColor)}>
                <IconComponent size={16} weight="duotone" className={color} />
              </div>
              <span className="text-sm text-foreground leading-relaxed pt-1">{benefit.text}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
