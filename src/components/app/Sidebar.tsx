import { Link, useLocation } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { cn } from '@/lib/utils'
import {
  House,
  Calendar,
  Storefront,
  Handshake,
  ChartLine,
  Gear,
  Plus,
  ShieldCheck,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navigationItems = [
  { label: 'Overview', icon: House, path: '/dashboard' },
  { label: 'Events', icon: Calendar, path: '/dashboard/events' },
  { label: 'Vendors', icon: Storefront, path: '/dashboard/vendors' },
  { label: 'Sponsors', icon: Handshake, path: '/dashboard/sponsors' },
  { label: 'Analytics', icon: ChartLine, path: '/dashboard/analytics' },
]

const bottomItems = [
  { label: 'Settings', icon: Gear, path: '/dashboard/settings' },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const currentUser = useQuery(api.queries.auth.getCurrentUser)
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin'

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside
      className={cn(
        'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:top-14',
        'border-r border-border bg-sidebar transition-all duration-200 ease-out z-30',
        collapsed ? 'lg:w-16' : 'lg:w-60'
      )}
    >
      {/* Logo / Brand - Only when expanded */}
      <div
        className={cn(
          'flex items-center h-12 px-4 border-b border-border transition-all duration-200',
          collapsed ? 'justify-center' : 'justify-start'
        )}
      >
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">O</span>
          </div>
        ) : (
          <Link to="/dashboard" className="font-mono text-sm font-bold">
            <span className="text-foreground">open</span>
            <span className="text-primary">-</span>
            <span className="text-foreground">event</span>
          </Link>
        )}
      </div>

      {/* Create Event Button */}
      <div className="p-3">
        <Link
          to="/dashboard/events/new"
          className={cn(
            'flex items-center justify-center gap-2 w-full py-2.5 rounded-lg',
            'bg-primary text-primary-foreground font-medium text-sm',
            'hover:bg-primary/90 transition-all duration-200 cursor-pointer',
            'shadow-sm hover:shadow-md hover:-translate-y-0.5',
            collapsed ? 'px-2' : 'px-4'
          )}
          title={collapsed ? 'Create Event' : undefined}
        >
          <Plus size={18} weight="bold" />
          {!collapsed && <span>Create Event</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                collapsed ? 'px-2 justify-center' : 'px-3',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon size={20} weight={active ? 'duotone' : 'regular'} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-2 py-3 border-t border-border space-y-1">
        {/* Admin Panel Link */}
        {isAdmin && (
          <Link
            to="/admin"
            title={collapsed ? 'Admin Panel' : undefined}
            className={cn(
              'flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              collapsed ? 'px-2 justify-center' : 'px-3',
              'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
            )}
          >
            <ShieldCheck size={20} weight="duotone" />
            {!collapsed && <span>Admin Panel</span>}
          </Link>
        )}
        {bottomItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                collapsed ? 'px-2 justify-center' : 'px-3',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon size={20} weight={active ? 'duotone' : 'regular'} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center gap-3 py-2 rounded-lg text-sm w-full',
            'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer',
            collapsed ? 'px-2 justify-center' : 'px-3'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <CaretRight size={18} weight="bold" />
          ) : (
            <>
              <CaretLeft size={18} weight="bold" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
