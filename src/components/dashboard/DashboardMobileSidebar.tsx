import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  House,
  Calendar,
  Storefront,
  Handshake,
  ChartLine,
  Gear,
  Plus,
  X,
} from '@phosphor-icons/react'

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

interface DashboardMobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function DashboardMobileSidebar({ open, onClose }: DashboardMobileSidebarProps) {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link to="/" className="font-mono text-lg font-bold" onClick={onClose}>
            <span className="text-foreground">open</span>
            <span className="text-primary">-</span>
            <span className="text-foreground">event</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Create Event Button */}
        <div className="p-4">
          <Link
            to="/dashboard/events/new"
            onClick={onClose}
            className={cn(
              'flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg',
              'bg-primary text-primary-foreground font-medium text-sm',
              'hover:bg-primary/90 transition-colors cursor-pointer'
            )}
          >
            <Plus size={18} weight="bold" />
            Create Event
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon size={20} weight={active ? 'duotone' : 'regular'} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-border bg-background">
          {bottomItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon size={20} weight={active ? 'duotone' : 'regular'} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </aside>
    </>
  )
}
