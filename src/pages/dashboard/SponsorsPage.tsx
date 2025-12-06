import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { MagnifyingGlass, FunnelSimple, Handshake, CheckCircle, CurrencyDollar, Globe } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const defaultIndustries = [
  'All',
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Media',
  'Retail',
]

export function SponsorsPage() {
  const [industry, setIndustry] = useState('All')
  const [search, setSearch] = useState('')

  const sponsors = useQuery(api.sponsors.list, {
    industry: industry === 'All' ? undefined : industry.toLowerCase(),
    search: search || undefined,
  })

  const industries = useQuery(api.sponsors.getIndustries)
  const displayIndustries = industries?.length ? ['All', ...industries] : defaultIndustries

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return null
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 0,
    })
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`
    if (min) return `From ${formatter.format(min)}`
    if (max) return `Up to ${formatter.format(max)}`
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-mono">Sponsor Discovery</h1>
        <p className="text-muted-foreground mt-1">Find sponsors that align with your event</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sponsors..."
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'text-sm placeholder:text-muted-foreground'
            )}
          />
        </div>
        <button className={cn(
          'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg',
          'border border-border text-sm font-medium',
          'hover:bg-muted transition-colors cursor-pointer'
        )}>
          <FunnelSimple size={18} weight="bold" />
          Filters
        </button>
      </div>

      {/* Industries */}
      <div className="flex flex-wrap gap-2">
        {displayIndustries.map((ind) => (
          <button
            key={ind}
            onClick={() => setIndustry(ind)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer capitalize',
              industry === ind
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {ind}
          </button>
        ))}
      </div>

      {/* Sponsors List or Empty State */}
      {sponsors === undefined ? (
        // Loading state
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
              <div className="h-12 w-12 bg-muted rounded-lg mb-4" />
              <div className="h-5 bg-muted rounded w-2/3 mb-2" />
              <div className="h-4 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      ) : sponsors.length === 0 ? (
        // Empty State
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Handshake size={64} weight="duotone" className="mx-auto text-muted-foreground/30 mb-6" />
          <h3 className="text-lg font-semibold mb-2">
            {search ? 'No sponsors found' : 'Sponsor discovery coming soon'}
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {search
              ? `No sponsors matching "${search}". Try a different search term.`
              : 'AI-powered sponsor matching will help you find the perfect partners for your events.'}
          </p>
        </div>
      ) : (
        // Sponsors Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor._id}
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                {sponsor.logoUrl ? (
                  <img
                    src={sponsor.logoUrl}
                    alt={sponsor.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Handshake size={24} weight="duotone" className="text-amber-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{sponsor.name}</h3>
                    {sponsor.verified && (
                      <CheckCircle size={16} weight="fill" className="text-blue-500 shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{sponsor.industry}</span>
                </div>
              </div>

              {/* Description */}
              {sponsor.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {sponsor.description}
                </p>
              )}

              {/* Sponsorship Tiers */}
              {sponsor.sponsorshipTiers && sponsor.sponsorshipTiers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {sponsor.sponsorshipTiers.map((tier) => (
                    <span
                      key={tier}
                      className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground capitalize"
                    >
                      {tier}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-sm">
                {formatBudget(sponsor.budgetMin, sponsor.budgetMax) && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CurrencyDollar size={14} weight="bold" />
                    <span className="text-xs">{formatBudget(sponsor.budgetMin, sponsor.budgetMax)}</span>
                  </div>
                )}
                {sponsor.website && (
                  <a
                    href={sponsor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe size={14} weight="bold" />
                    <span className="text-xs">Website</span>
                  </a>
                )}
              </div>

              {/* Target Events */}
              {sponsor.targetEventTypes && sponsor.targetEventTypes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Looking for: {sponsor.targetEventTypes.join(', ')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
