import { useScrollAnimation } from '@/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import { Calendar, CurrencyDollar, Users, Quotes } from '@phosphor-icons/react'

const metrics = [
  { icon: Calendar, value: '500+', label: 'Events managed' },
  { icon: CurrencyDollar, value: '$2M+', label: 'Vendor bookings' },
  { icon: Users, value: '10,000+', label: 'Volunteer hours' },
]

const testimonials = [
  {
    quote: "Finally, a platform that understands event ops isn't just about ticketing. Open-Event helped us manage 50+ vendors for our annual tech summit.",
    author: 'Sarah Chen',
    role: 'Event Director',
    company: 'TechConf Asia',
  },
  {
    quote: "The AI sponsor matching saved us weeks of outreach. We found 3 perfect-fit sponsors in our first week on the platform.",
    author: 'Marcus Lee',
    role: 'Community Lead',
    company: 'DevFest MY',
  },
  {
    quote: "As a vendor, I love getting qualified leads instead of cold emails. My catering business grew 40% since joining Open-Event.",
    author: 'Priya Sharma',
    role: 'Owner',
    company: 'Spice Route Catering',
  },
]

const logos = [
  'TechConf Asia',
  'DevFest MY',
  'StartupWeek KL',
  'CloudSummit',
  'FinTech Forum',
  'Design Week',
]

export function SocialProof() {
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
            Trusted by event teams.
          </h2>
          <p className="text-lg text-muted-foreground mt-4">
            Join organizers, sponsors, and vendors who've simplified their event operations.
          </p>
        </div>

        {/* Logo Cloud */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {logos.map((logo, index) => (
            <div
              key={logo}
              className={cn(
                'px-6 py-3 rounded-lg border border-border bg-muted/30',
                'text-sm font-mono text-muted-foreground',
                'transition-all duration-300 hover:border-primary/30 hover:text-foreground'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {logo}
            </div>
          ))}
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon
            return (
              <div
                key={metric.label}
                className={cn(
                  'text-center p-6 rounded-xl border border-border bg-card',
                  'transition-all duration-500'
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <IconComponent size={24} weight="duotone" className="text-primary" />
                </div>
                <div className="font-mono text-3xl font-bold">{metric.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{metric.label}</div>
              </div>
            )
          })}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.author} {...testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({
  quote,
  author,
  role,
  company,
  index,
}: {
  quote: string
  author: string
  role: string
  company: string
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
      <Quotes size={24} weight="duotone" className="text-primary/30 mb-4" />
      <p className="text-sm text-foreground leading-relaxed mb-6">{quote}</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">
            {author.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <div className="text-sm font-medium">{author}</div>
          <div className="text-xs text-muted-foreground">{role}, {company}</div>
        </div>
      </div>
    </div>
  )
}
