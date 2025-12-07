import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  ListBullets,
  SquaresFour,
  Storefront,
  Handshake,
  Sparkle,
  Plus,
  Lightning,
} from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/constants'
import { useState } from 'react'

type ViewMode = 'list' | 'grid'

export function DashboardOverview() {
  const profile = useQuery(api.organizerProfiles.getMyProfile)
  const stats = useQuery(api.events.getMyStats)
  const upcomingEvents = useQuery(api.events.getUpcoming, { limit: 6 })

  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const orgName = profile?.organizationName || 'My workspace'

  // Check if user has any events for onboarding state
  const hasEvents = upcomingEvents && upcomingEvents.length > 0
  const isNewUser = stats?.totalEvents === 0

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Workspace Header - Typeform style */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground truncate">
            {orgName}
          </h1>
          <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0 hidden sm:block">
            <span className="sr-only">More options</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="3" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="13" cy="8" r="1.5" fill="currentColor"/>
            </svg>
          </button>
        </div>

        {/* View Toggle - refined */}
        <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-muted/50 rounded-lg shrink-0">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 sm:p-2 rounded-md transition-all duration-200 cursor-pointer touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center',
              viewMode === 'list'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ListBullets size={16} weight="bold" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 sm:p-2 rounded-md transition-all duration-200 cursor-pointer touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center',
              viewMode === 'grid'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <SquaresFour size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* AI Suggestions Banner - Typeform cream/yellow style */}
      {hasEvents && (
        <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/30">
          <div className="px-3 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="flex-shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Sparkle size={18} className="sm:hidden text-white" weight="fill" />
                  <Sparkle size={20} className="hidden sm:block text-white" weight="fill" />
                </div>
              </div>
              <div className="flex-1 min-w-0 sm:hidden">
                <p className="text-xs text-foreground">
                  <span className="font-medium">Tip:</span>{' '}
                  <span className="text-muted-foreground">
                    Add vendors and sponsors to unlock analytics.
                  </span>
                </p>
              </div>
            </div>
            <div className="hidden sm:block flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">Tip:</span>{' '}
                <span className="text-muted-foreground">
                  Add vendors and sponsors to your events to unlock analytics and collaboration features.
                </span>
              </p>
            </div>
            <button className="w-full sm:w-auto sm:flex-shrink-0 px-4 py-2 text-xs sm:text-sm font-medium text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/50 hover:bg-violet-200 dark:hover:bg-violet-900/70 rounded-lg transition-colors touch-manipulation">
              Learn more
            </button>
          </div>
        </div>
      )}

      {/* Stats Row - Minimal Typeform style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Events', value: stats?.totalEvents, icon: Calendar, accent: 'violet' },
          { label: 'Vendors', value: stats?.confirmedVendors, icon: Storefront, accent: 'emerald' },
          { label: 'Sponsors', value: stats?.confirmedSponsors, icon: Handshake, accent: 'amber' },
          { label: 'Attendees', value: stats?.activeEvents, icon: Users, accent: 'blue' },
        ].map((stat) => {
          const Icon = stat.icon
          const displayValue = stat.value === undefined ? '—' : stat.value === 0 ? '—' : stat.value
          return (
            <div
              key={stat.label}
              className={cn(
                'group p-3 sm:p-5 rounded-lg sm:rounded-xl bg-card border border-border/50',
                'hover:border-border hover:shadow-sm transition-all duration-200'
              )}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <Icon
                  size={18}
                  className={cn(
                    'sm:hidden',
                    stat.accent === 'violet' && 'text-violet-500',
                    stat.accent === 'emerald' && 'text-emerald-500',
                    stat.accent === 'amber' && 'text-amber-500',
                    stat.accent === 'blue' && 'text-blue-500',
                  )}
                  weight="duotone"
                />
                <Icon
                  size={20}
                  className={cn(
                    'hidden sm:block',
                    stat.accent === 'violet' && 'text-violet-500',
                    stat.accent === 'emerald' && 'text-emerald-500',
                    stat.accent === 'amber' && 'text-amber-500',
                    stat.accent === 'blue' && 'text-blue-500',
                  )}
                  weight="duotone"
                />
              </div>
              <p className={cn(
                "text-2xl sm:text-3xl font-semibold tracking-tight",
                displayValue === '—' && "text-muted-foreground/50"
              )}>{displayValue}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-foreground">Recent events</h2>
          {hasEvents && (
            <Link
              to="/dashboard/events"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Loading State */}
        {upcomingEvents === undefined ? (
          <div className={cn(
            viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'
          )}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-card p-5 animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-2/3 mb-3" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : isNewUser ? (
          /* Empty State - Typeform style with witty messaging */
          <div className="grid md:grid-cols-2 gap-4">
            {/* AI Suggestion Card 1 */}
            <div className="group relative rounded-xl border border-border/50 bg-card p-6 hover:border-violet-200 dark:hover:border-violet-800/50 hover:shadow-md transition-all duration-200">
              <button className="absolute top-4 right-4 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all text-muted-foreground">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
                  <Sparkle size={18} weight="fill" className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">ai suggestion</p>
                  <h3 className="font-medium text-foreground leading-snug">
                    a tech conference. networking, talks, the whole thing.
                  </h3>
                </div>
              </div>

              <button className="mt-4 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                use this
              </button>
            </div>

            {/* AI Suggestion Card 2 */}
            <div className="group relative rounded-xl border border-border/50 bg-card p-6 hover:border-violet-200 dark:hover:border-violet-800/50 hover:shadow-md transition-all duration-200">
              <button className="absolute top-4 right-4 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all text-muted-foreground">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
                  <Sparkle size={18} weight="fill" className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">ai suggestion</p>
                  <h3 className="font-medium text-foreground leading-snug">
                    a hands-on workshop. people learn stuff. you look smart.
                  </h3>
                </div>
              </div>

              <button className="mt-4 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                use this
              </button>
            </div>

            {/* Create New Card */}
            <div className="md:col-span-2">
              <Link
                to="/dashboard/events/create"
                className="flex items-center gap-4 rounded-xl border-2 border-dashed border-border/70 hover:border-violet-300 dark:hover:border-violet-700 bg-muted/30 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 p-6 transition-all duration-200 group"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-900/70 transition-colors">
                  <Plus size={24} weight="bold" className="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">start from scratch</p>
                  <p className="text-sm text-muted-foreground">you know what you're doing. probably.</p>
                </div>
              </Link>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          /* List View - Clean Typeform style */
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            {upcomingEvents.map((event, index) => (
              <Link
                key={event._id}
                to={`/dashboard/events/${event._id}`}
                className={cn(
                  'flex items-center gap-4 px-5 py-4',
                  'hover:bg-muted/50 transition-colors',
                  index !== upcomingEvents.length - 1 && 'border-b border-border/50'
                )}
              >
                {/* Event Icon with gradient */}
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  event.status === 'active'
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20'
                    : event.status === 'planning'
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20'
                      : 'bg-gradient-to-br from-zinc-400 to-zinc-500 shadow-lg shadow-zinc-500/20'
                )}>
                  <Calendar size={18} weight="fill" className="text-white" />
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{event.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {event.venueName && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin size={12} weight="bold" />
                        {event.venueName}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} weight="bold" />
                      {formatDate(event.startDate)}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0 flex items-center gap-3">
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                      event.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                        : event.status === 'planning'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    )}
                  >
                    {event.status}
                  </span>
                  <ArrowRight size={16} className="text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Grid View - Card style like Typeform */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <Link
                key={event._id}
                to={`/dashboard/events/${event._id}`}
                className={cn(
                  'group relative rounded-xl border border-border/50 bg-card p-5',
                  'hover:border-violet-200 dark:hover:border-violet-800/50 hover:shadow-md',
                  'transition-all duration-200'
                )}
              >
                {/* Status indicator dot */}
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    event.status === 'active'
                      ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20'
                      : event.status === 'planning'
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20'
                        : 'bg-gradient-to-br from-zinc-400 to-zinc-500'
                  )}>
                    <Calendar size={18} weight="fill" className="text-white" />
                  </div>
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                      event.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                        : event.status === 'planning'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    )}
                  >
                    {event.status}
                  </span>
                </div>

                <h3 className="font-semibold text-foreground mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
                  {event.title}
                </h3>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock size={14} weight="duotone" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  {event.venueName && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} weight="duotone" />
                      <span className="truncate">{event.venueName}</span>
                    </div>
                  )}
                  {event.expectedAttendees && (
                    <div className="flex items-center gap-2">
                      <Users size={14} weight="duotone" />
                      <span>{event.expectedAttendees} expected</span>
                    </div>
                  )}
                </div>

                {/* Quick Actions on Hover */}
                <div className="mt-4 pt-4 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/dashboard/events/${event._id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-900/50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Lightning size={14} weight="fill" />
                    quick edit
                  </Link>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
