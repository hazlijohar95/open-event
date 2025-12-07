import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/formatters'
import {
  Users,
  Storefront,
  Handshake,
  ShieldCheck,
  Warning,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  ChartLine,
  CaretRight,
} from '@phosphor-icons/react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function AdminDashboard() {
  const user = useQuery(api.queries.auth.getCurrentUser)
  const users = useQuery(api.admin.listAllUsers, { limit: 10 })
  const moderationLogs = useQuery(api.moderation.getModerationLogs, { limit: 5 })
  const suspendedCount = useQuery(api.moderation.getSuspendedUsersCount)
  const pendingVendors = useQuery(api.vendors.getPendingCount)
  const pendingSponsors = useQuery(api.sponsors.getPendingCount)

  const stats = [
    {
      label: 'Total Users',
      value: users?.length || 0,
      icon: Users,
      href: '/admin/users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      description: 'All registered platform users',
    },
    {
      label: 'Suspended',
      value: suspendedCount || 0,
      icon: Warning,
      href: '/admin/users?status=suspended',
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
      description: 'Users with restricted access',
      alert: (suspendedCount || 0) > 0,
    },
    {
      label: 'Pending Vendors',
      value: pendingVendors ?? 0,
      icon: Storefront,
      href: '/admin/vendors',
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
      description: 'Awaiting review and approval',
      alert: (pendingVendors ?? 0) > 0,
    },
    {
      label: 'Pending Sponsors',
      value: pendingSponsors ?? 0,
      icon: Handshake,
      href: '/admin/sponsors',
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
      description: 'Awaiting review and approval',
      alert: (pendingSponsors ?? 0) > 0,
    },
  ]

  const getActionIcon = (action: string) => {
    if (action.includes('approved')) return CheckCircle
    if (action.includes('rejected') || action.includes('suspended') || action.includes('removed')) return XCircle
    return Clock
  }

  const getActionColor = (action: string) => {
    if (action.includes('approved') || action.includes('unsuspended')) return 'text-green-600 bg-green-500/10'
    if (action.includes('rejected') || action.includes('suspended') || action.includes('removed')) return 'text-red-600 bg-red-500/10'
    return 'text-amber-600 bg-amber-500/10'
  }

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const quickActions = [
    { label: 'Manage Users', icon: Users, href: '/admin/users', color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
    { label: 'Review Vendors', icon: Storefront, href: '/admin/vendors', color: 'text-orange-600', bgColor: 'bg-orange-500/10' },
    { label: 'Review Sponsors', icon: Handshake, href: '/admin/sponsors', color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
    { label: 'Applications', icon: FileText, href: '/admin/applications', color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
    { label: 'Moderation Logs', icon: ShieldCheck, href: '/admin/moderation', color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
    { label: 'Settings', icon: ChartLine, href: '/admin/settings', color: 'text-zinc-600', bgColor: 'bg-zinc-500/10' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-mono">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.name?.split(' ')[0] || 'Admin'}. Here's what's happening on the platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <TooltipProvider key={stat.label} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={stat.href}
                    className={cn(
                      'relative flex items-center gap-4 p-4 rounded-xl border border-border bg-card',
                      'hover:border-primary/20 hover:bg-muted/30 transition-all group'
                    )}
                  >
                    {stat.alert && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                    <div className={cn('p-3 rounded-xl', stat.bgColor)}>
                      <Icon size={24} weight="duotone" className={stat.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                    <CaretRight
                      size={18}
                      weight="bold"
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{stat.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users size={18} weight="duotone" className="text-blue-600" />
              <h2 className="font-semibold">Recent Users</h2>
            </div>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {users?.slice(0, 5).map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary">
                      {(u.name || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{u.name || 'Unnamed'}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full capitalize',
                      u.role === 'superadmin'
                        ? 'bg-purple-500/10 text-purple-600'
                        : u.role === 'admin'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-blue-500/10 text-blue-600'
                    )}
                  >
                    {u.role || 'organizer'}
                  </span>
                  {u.status === 'suspended' && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-600 rounded-full">
                      Suspended
                    </span>
                  )}
                </div>
              </div>
            )) || (
              <div className="px-5 py-8 text-center text-muted-foreground">
                <Users size={32} weight="duotone" className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No users found</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} weight="duotone" className="text-amber-600" />
              <h2 className="font-semibold">Recent Activity</h2>
            </div>
            <Link
              to="/admin/moderation"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {moderationLogs && moderationLogs.length > 0 ? (
              moderationLogs.map((log) => {
                const Icon = getActionIcon(log.action)
                const colorClasses = getActionColor(log.action)
                return (
                  <div key={log._id} className="flex items-start gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                    <div className={cn('p-1.5 rounded-lg mt-0.5', colorClasses.split(' ')[1])}>
                      <Icon
                        size={16}
                        weight="duotone"
                        className={colorClasses.split(' ')[0]}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{log.adminName}</span>
                        {' '}
                        <span className="text-muted-foreground">
                          {formatAction(log.action).toLowerCase()}
                        </span>
                      </p>
                      {log.reason && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {log.reason}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatRelativeTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="px-5 py-8 text-center text-muted-foreground">
                <ShieldCheck size={32} weight="duotone" className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent moderation activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Quick Actions</h2>
        </div>
        <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                to={action.href}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border border-border',
                  'hover:border-primary/20 hover:bg-muted/30 transition-all group'
                )}
              >
                <div className={cn('p-2 rounded-lg', action.bgColor)}>
                  <Icon size={18} weight="duotone" className={action.color} />
                </div>
                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                  {action.label}
                </span>
                <CaretRight
                  size={14}
                  weight="bold"
                  className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
