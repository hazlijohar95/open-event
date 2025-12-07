import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import {
  Calendar,
  Storefront,
  Handshake,
  TrendUp,
  Plus,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  Lightning,
  Notebook,
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/constants'

export function DashboardOverview() {
  const user = useQuery(api.queries.auth.getCurrentUser)
  const profile = useQuery(api.organizerProfiles.getMyProfile)
  const stats = useQuery(api.events.getMyStats)
  const upcomingEvents = useQuery(api.events.getUpcoming, { limit: 3 })

  const statCards = [
    {
      label: 'Total Events',
      value: stats?.totalEvents ?? 0,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: '/dashboard/events',
    },
    {
      label: 'Active',
      value: stats?.activeEvents ?? 0,
      icon: Lightning,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      href: '/dashboard/events?status=active',
    },
    {
      label: 'Vendors',
      value: stats?.confirmedVendors ?? 0,
      icon: Storefront,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      href: '/dashboard/vendors',
    },
    {
      label: 'Sponsors',
      value: stats?.confirmedSponsors ?? 0,
      icon: Handshake,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      href: '/dashboard/sponsors',
    },
  ]

  const quickActions = [
    {
      title: 'Create Event',
      description: 'Start planning your next event',
      icon: Plus,
      href: '/dashboard/events/new',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      primary: true,
    },
    {
      title: 'Find Vendors',
      description: 'Browse the vendor marketplace',
      icon: Storefront,
      href: '/dashboard/vendors',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Find Sponsors',
      description: 'Discover potential sponsors',
      icon: Handshake,
      href: '/dashboard/sponsors',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'View Analytics',
      description: 'Track your event metrics',
      icon: TrendUp,
      href: '/dashboard/analytics',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold font-mono">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1">
          {profile?.organizationName
            ? `Managing events for ${profile.organizationName}`
            : 'Here\'s what\'s happening with your events'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              to={stat.href}
              className={cn(
                'group p-4 rounded-xl border border-border bg-card',
                'hover:border-primary/20 hover:shadow-sm transition-all'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                  <Icon size={18} weight="duotone" className={stat.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Events - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <Link
              to="/dashboard/events"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>

          {upcomingEvents === undefined ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse">
                  <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <Calendar size={48} weight="duotone" className="mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-medium mb-2">No upcoming events</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first event to get started
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
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/dashboard/events/${event._id}`}
                  className="block rounded-xl border border-border bg-card p-4 hover:border-primary/20 hover:bg-muted/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{event.title}</h3>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium capitalize',
                          event.status === 'active' ? 'bg-green-500/10 text-green-600' :
                          event.status === 'planning' ? 'bg-blue-500/10 text-blue-600' :
                          'bg-muted text-muted-foreground'
                        )}>
                          {event.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={14} weight="bold" />
                          {formatDate(event.startDate)}
                        </span>
                        {event.venueName && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={14} weight="bold" />
                            {event.venueName}
                          </span>
                        )}
                        {event.expectedAttendees && (
                          <span className="inline-flex items-center gap-1">
                            <Users size={14} weight="bold" />
                            {event.expectedAttendees} attendees
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions - Right sidebar */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.title}
                  to={action.href}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border transition-all',
                    action.primary
                      ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                      : 'bg-card border-border hover:border-primary/20 hover:bg-muted/30'
                  )}
                >
                  <div className={cn(
                    'p-2 rounded-lg',
                    action.primary ? 'bg-primary-foreground/20' : action.bgColor
                  )}>
                    <Icon size={18} weight="duotone" className={action.primary ? 'text-primary-foreground' : action.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">{action.title}</h3>
                    <p className={cn(
                      'text-xs truncate',
                      action.primary ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>{action.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Tips Section */}
          {stats && stats.totalEvents === 0 && (
            <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-start gap-3">
                <Notebook size={20} weight="duotone" className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm mb-1">Getting Started</h4>
                  <p className="text-xs text-muted-foreground">
                    Create your first event using our AI assistant. It'll help you plan everything from venue to vendors.
                  </p>
                </div>
              </div>
            </div>
          )}

          {stats && stats.totalEvents > 0 && stats.confirmedVendors === 0 && (
            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <Storefront size={20} weight="duotone" className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm mb-1">Find Vendors</h4>
                  <p className="text-xs text-muted-foreground">
                    Browse our marketplace to find trusted vendors for your events.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
