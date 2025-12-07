import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Link } from 'react-router-dom'
import {
  ChartLine,
  Calendar,
  Storefront,
  Handshake,
  Users,
  CurrencyDollar,
  Lightning,
  CheckCircle,
  Clock,
  TrendUp,
  ArrowRight,
  Plus,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/constants'

export function AnalyticsPage() {
  const stats = useQuery(api.events.getMyStats)
  const upcomingEvents = useQuery(api.events.getUpcoming, { limit: 5 })

  // Calculate additional metrics
  const avgAttendees = stats && stats.totalEvents > 0
    ? Math.round(stats.totalAttendees / stats.totalEvents)
    : 0

  const primaryMetrics = [
    {
      label: 'Total Events',
      value: stats?.totalEvents ?? 0,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      subtitle: `${stats?.upcomingEvents ?? 0} upcoming`,
    },
    {
      label: 'Active Events',
      value: stats?.activeEvents ?? 0,
      icon: Lightning,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      subtitle: `${stats?.planningEvents ?? 0} in planning`,
    },
    {
      label: 'Confirmed Vendors',
      value: stats?.confirmedVendors ?? 0,
      icon: Storefront,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      subtitle: 'Across all events',
    },
    {
      label: 'Confirmed Sponsors',
      value: stats?.confirmedSponsors ?? 0,
      icon: Handshake,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      subtitle: 'Across all events',
    },
  ]

  const secondaryMetrics = [
    {
      label: 'Total Expected Attendees',
      value: stats?.totalAttendees?.toLocaleString() ?? '0',
      icon: Users,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      label: 'Total Budget',
      value: `$${(stats?.totalBudget ?? 0).toLocaleString()}`,
      icon: CurrencyDollar,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      label: 'Avg. Attendees/Event',
      value: avgAttendees.toLocaleString(),
      icon: TrendUp,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      label: 'Completed Events',
      value: stats?.completedEvents ?? 0,
      icon: CheckCircle,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
    },
  ]

  if (stats === undefined) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-mono">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your event performance and metrics</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-xl border border-border bg-card animate-pulse">
              <div className="h-10 w-10 bg-muted rounded-lg mb-3" />
              <div className="h-8 bg-muted rounded w-16 mb-2" />
              <div className="h-4 bg-muted rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show empty state if no events
  if (!stats || stats.totalEvents === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-mono">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your event performance and metrics</p>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <ChartLine size={64} weight="duotone" className="mx-auto text-muted-foreground/30 mb-6" />
          <h3 className="text-lg font-semibold mb-2">No data yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6">
            Create your first event to start tracking metrics and analytics.
          </p>
          <Link
            to="/dashboard/events/new"
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-primary text-primary-foreground text-sm font-medium',
              'hover:bg-primary/90 transition-colors'
            )}
          >
            <Plus size={16} weight="bold" />
            Create Event
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-mono">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your event performance and metrics</p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className="p-5 rounded-xl border border-border bg-card"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', metric.bgColor)}>
                  <Icon size={20} weight="duotone" className={metric.color} />
                </div>
              </div>
              <p className="text-3xl font-bold font-mono">{metric.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
              {metric.subtitle && (
                <p className="text-xs text-muted-foreground/70 mt-0.5">{metric.subtitle}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className="p-4 rounded-xl border border-border bg-card"
            >
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', metric.bgColor)}>
                  <Icon size={16} weight="duotone" className={metric.color} />
                </div>
                <div>
                  <p className="text-xl font-bold font-mono">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Events Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock size={18} weight="duotone" className="text-blue-500" />
              Upcoming Events
            </h2>
            <Link
              to="/dashboard/events"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {upcomingEvents && upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/dashboard/events/${event._id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(event.startDate)}</p>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded capitalize flex-shrink-0 ml-2',
                    event.status === 'active' ? 'bg-green-500/10 text-green-600' :
                    event.status === 'planning' ? 'bg-blue-500/10 text-blue-600' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {event.status}
                  </span>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Calendar size={32} weight="duotone" className="mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm">No upcoming events</p>
              </div>
            )}
          </div>
        </div>

        {/* Event Status Breakdown */}
        <div className="rounded-xl border border-border bg-card">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <ChartLine size={18} weight="duotone" className="text-purple-500" />
              Event Status Breakdown
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <StatusBar
              label="Draft"
              count={stats.draftEvents}
              total={stats.totalEvents}
              color="bg-gray-500"
            />
            <StatusBar
              label="Planning"
              count={stats.planningEvents}
              total={stats.totalEvents}
              color="bg-blue-500"
            />
            <StatusBar
              label="Active"
              count={stats.activeEvents}
              total={stats.totalEvents}
              color="bg-green-500"
            />
            <StatusBar
              label="Completed"
              count={stats.completedEvents}
              total={stats.totalEvents}
              color="bg-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Insights Section */}
      {(stats.confirmedVendors === 0 || stats.confirmedSponsors === 0) && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <h3 className="font-semibold text-amber-700 mb-2">Insights & Suggestions</h3>
          <ul className="space-y-2 text-sm text-amber-700/80">
            {stats.confirmedVendors === 0 && (
              <li className="flex items-start gap-2">
                <Storefront size={16} weight="duotone" className="flex-shrink-0 mt-0.5" />
                <span>You haven't confirmed any vendors yet. Browse the <Link to="/dashboard/vendors" className="underline">vendor marketplace</Link> to find trusted partners.</span>
              </li>
            )}
            {stats.confirmedSponsors === 0 && (
              <li className="flex items-start gap-2">
                <Handshake size={16} weight="duotone" className="flex-shrink-0 mt-0.5" />
                <span>No sponsors confirmed. Explore potential <Link to="/dashboard/sponsors" className="underline">sponsors</Link> to fund your events.</span>
              </li>
            )}
            {stats.totalBudget === 0 && stats.totalEvents > 0 && (
              <li className="flex items-start gap-2">
                <CurrencyDollar size={16} weight="duotone" className="flex-shrink-0 mt-0.5" />
                <span>Set budgets for your events to track spending and plan better.</span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

// Status Bar Component
function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
