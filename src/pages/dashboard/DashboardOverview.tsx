import { useUser } from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import {
  Calendar,
  Storefront,
  Handshake,
  TrendUp,
  Plus,
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const quickActions = [
  {
    title: 'Create Event',
    description: 'Start planning your next event',
    icon: Calendar,
    href: '/dashboard/events/new',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
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

export function DashboardOverview() {
  const { user } = useUser()
  const profile = useQuery(api.organizerProfiles.getMyProfile)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold font-mono">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1">
          {profile?.organizationName
            ? `Managing events for ${profile.organizationName}`
            : 'Here\'s what\'s happening with your events'}
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.title}
                to={action.href}
                className={cn(
                  'group p-5 rounded-xl border border-border bg-card',
                  'hover:border-primary/20 hover:shadow-md transition-all cursor-pointer'
                )}
              >
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-4', action.bgColor)}>
                  <Icon size={20} weight="duotone" className={action.color} />
                </div>
                <h3 className="font-medium text-sm">{action.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Upcoming Events Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upcoming Events</h2>
          <Link
            to="/dashboard/events"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Calendar size={48} weight="duotone" className="mx-auto text-muted-foreground/50 mb-4" />
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
      </div>
    </div>
  )
}
