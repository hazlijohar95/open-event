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
} from '@phosphor-icons/react'

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
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Suspended',
      value: suspendedCount || 0,
      icon: Warning,
      href: '/admin/users?status=suspended',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Pending Vendors',
      value: pendingVendors ?? 0,
      icon: Storefront,
      href: '/admin/vendors',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'Pending Sponsors',
      value: pendingSponsors ?? 0,
      icon: Handshake,
      href: '/admin/sponsors',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ]

  const getActionIcon = (action: string) => {
    if (action.includes('approved')) return CheckCircle
    if (action.includes('rejected') || action.includes('suspended') || action.includes('removed')) return XCircle
    return Clock
  }

  const getActionColor = (action: string) => {
    if (action.includes('approved') || action.includes('unsuspended')) return 'text-green-500'
    if (action.includes('rejected') || action.includes('suspended') || action.includes('removed')) return 'text-red-500'
    return 'text-amber-500'
  }

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name?.split(' ')[0] || 'Admin'}. Here's what's happening on the platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              to={stat.href}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border border-border bg-card',
                'hover:bg-muted/50 transition-colors group'
              )}
            >
              <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                <Icon size={24} weight="duotone" className={stat.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <ArrowRight
                size={20}
                weight="bold"
                className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </Link>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold">Recent Users</h2>
            <Link
              to="/admin/users"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {users?.slice(0, 5).map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users size={16} weight="duotone" className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{u.name || 'Unnamed'}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      u.role === 'admin'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-blue-500/10 text-blue-600'
                    )}
                  >
                    {u.role || 'organizer'}
                  </span>
                  {u.status === 'suspended' && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-500 rounded-full">
                      Suspended
                    </span>
                  )}
                </div>
              </div>
            )) || (
              <div className="p-8 text-center text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold">Recent Activity</h2>
            <Link
              to="/admin/moderation"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {moderationLogs && moderationLogs.length > 0 ? (
              moderationLogs.map((log) => {
                const Icon = getActionIcon(log.action)
                return (
                  <div key={log._id} className="flex items-start gap-3 p-4">
                    <Icon
                      size={20}
                      weight="duotone"
                      className={cn('mt-0.5 flex-shrink-0', getActionColor(log.action))}
                    />
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
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <ShieldCheck size={32} weight="duotone" className="mx-auto mb-2 text-muted-foreground/50" />
                <p>No recent moderation activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/admin/users"
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border border-border',
              'hover:bg-muted/50 transition-colors'
            )}
          >
            <Users size={20} weight="duotone" className="text-blue-500" />
            <span className="text-sm font-medium">Manage Users</span>
          </Link>
          <Link
            to="/admin/vendors"
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border border-border',
              'hover:bg-muted/50 transition-colors'
            )}
          >
            <Storefront size={20} weight="duotone" className="text-orange-500" />
            <span className="text-sm font-medium">Review Vendors</span>
          </Link>
          <Link
            to="/admin/sponsors"
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border border-border',
              'hover:bg-muted/50 transition-colors'
            )}
          >
            <Handshake size={20} weight="duotone" className="text-purple-500" />
            <span className="text-sm font-medium">Review Sponsors</span>
          </Link>
          <Link
            to="/admin/moderation"
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border border-border',
              'hover:bg-muted/50 transition-colors'
            )}
          >
            <ShieldCheck size={20} weight="duotone" className="text-amber-500" />
            <span className="text-sm font-medium">Moderation Logs</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
