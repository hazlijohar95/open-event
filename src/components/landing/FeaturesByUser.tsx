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
  ArrowRight,
  type Icon,
} from '@phosphor-icons/react'

interface Benefit {
  icon: Icon
  text: string
}

const stakeholders = [
  {
    title: 'For Sponsors',
    subtitle: 'Measurable ROI, not just logo placement',
    accent: 'amber',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
    icon: Handshake,
    benefits: [
      { icon: ChartLineUp, text: 'Real engagement metrics and booth analytics' },
      { icon: Target, text: 'Audience match scoring before commitment' },
      { icon: UsersThree, text: 'Lead capture with attribution tracking' },
      { icon: ClipboardText, text: 'Auto-generated post-event ROI reports' },
      { icon: CurrencyDollar, text: 'Multi-event discount management' },
    ],
  },
  {
    title: 'For Vendors',
    subtitle: 'Inbound opportunities, not cold outreach',
    accent: 'emerald',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-green-600',
    icon: Storefront,
    benefits: [
      { icon: Calendar, text: 'Inbound opportunities in your category' },
      { icon: CurrencyDollar, text: 'Transparent pricing — no bidding wars' },
      { icon: Star, text: 'Reviews and ratings that build reputation' },
      { icon: UsersThree, text: 'Repeat client relationship management' },
      { icon: ShieldCheck, text: 'Payment protection and contracts' },
    ],
  },
  {
    title: 'For Organizers',
    subtitle: 'One dashboard to rule them all',
    accent: 'indigo',
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-violet-600',
    icon: Calendar,
    benefits: [
      { icon: Storefront, text: 'Pre-vetted sponsor & vendor marketplace' },
      { icon: Sparkle, text: 'AI-powered matching and recommendations' },
      { icon: Handshake, text: 'Centralized logistics dashboard' },
      { icon: Certificate, text: 'Automated certificates and reports' },
      { icon: ClipboardText, text: 'Zero spreadsheet chaos' },
    ],
  },
]

export function FeaturesByUser() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section className="relative py-24 sm:py-32 px-6 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div
          ref={ref}
          className={cn(
            'text-center mb-16 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border/50 mb-6">
            <UsersThree size={16} weight="duotone" className="text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Built for everyone</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
            Everyone wins.
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Practical benefits for every stakeholder — not just features.
          </p>
        </div>

        {/* Stakeholder Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
  accent,
  gradientFrom,
  gradientTo,
  icon: HeaderIcon,
  benefits,
  index,
}: {
  title: string
  subtitle: string
  accent: string
  gradientFrom: string
  gradientTo: string
  icon: Icon
  benefits: Benefit[]
  index: number
}) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={cn(
        'group relative p-6 rounded-2xl border border-border/50 bg-card',
        'transition-all duration-500 hover:shadow-xl hover:border-border',
        'hover:-translate-y-1',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Header with gradient icon */}
      <div className="flex items-start gap-4 mb-6">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center shadow-lg',
          `bg-gradient-to-br ${gradientFrom} ${gradientTo}`,
          accent === 'amber' && 'shadow-amber-500/25',
          accent === 'emerald' && 'shadow-emerald-500/25',
          accent === 'indigo' && 'shadow-indigo-500/25',
        )}>
          <HeaderIcon size={24} weight="fill" className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Benefits List */}
      <ul className="space-y-4">
        {benefits.map((benefit, i) => {
          const IconComponent = benefit.icon
          return (
            <li key={i} className="flex items-start gap-3 group/item">
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                accent === 'amber' && 'bg-amber-500/10 group-hover/item:bg-amber-500/20',
                accent === 'emerald' && 'bg-emerald-500/10 group-hover/item:bg-emerald-500/20',
                accent === 'indigo' && 'bg-indigo-500/10 group-hover/item:bg-indigo-500/20',
              )}>
                <IconComponent
                  size={16}
                  weight="duotone"
                  className={cn(
                    accent === 'amber' && 'text-amber-600 dark:text-amber-400',
                    accent === 'emerald' && 'text-emerald-600 dark:text-emerald-400',
                    accent === 'indigo' && 'text-indigo-600 dark:text-indigo-400',
                  )}
                />
              </div>
              <span className="text-sm text-muted-foreground leading-relaxed pt-1.5 group-hover/item:text-foreground transition-colors">
                {benefit.text}
              </span>
            </li>
          )
        })}
      </ul>

      {/* CTA Link */}
      <div className="mt-6 pt-6 border-t border-border/50">
        <button className={cn(
          'flex items-center gap-2 text-sm font-medium transition-colors group/btn',
          accent === 'amber' && 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300',
          accent === 'emerald' && 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300',
          accent === 'indigo' && 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300',
        )}>
          Learn more
          <ArrowRight size={14} weight="bold" className="transition-transform group-hover/btn:translate-x-1" />
        </button>
      </div>
    </div>
  )
}
