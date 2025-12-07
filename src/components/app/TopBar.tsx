import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthActions } from '@convex-dev/auth/react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  Bell,
  SidebarSimple,
  SignOut,
  User,
  CaretDown,
  ShieldCheck,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

interface TopBarProps {
  onMenuClick?: () => void
  sidebarCollapsed?: boolean
}

const mainNavItems = [
  { label: 'Events', path: '/dashboard/events' },
  { label: 'Vendors', path: '/dashboard/vendors' },
  { label: 'Sponsors', path: '/dashboard/sponsors' },
  { label: 'Analytics', path: '/dashboard/analytics' },
]

export function TopBar({ onMenuClick, sidebarCollapsed }: TopBarProps) {
  const { signOut } = useAuthActions()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useQuery(api.queries.auth.getCurrentUser)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/sign-in')
  }

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-top">
      <div className="flex items-center h-full px-2 sm:px-4">
        {/* Left: Menu toggle + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onMenuClick}
            className="p-2.5 sm:p-2 -ml-1 sm:-ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle sidebar"
          >
            <SidebarSimple size={20} weight="duotone" />
          </button>

          {/* Logo - always visible on mobile, visible when collapsed on desktop */}
          <Link
            to="/dashboard"
            className={cn(
              'font-mono text-sm sm:text-base font-bold transition-opacity',
              'lg:transition-all lg:duration-200',
              sidebarCollapsed ? 'lg:opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'
            )}
          >
            <span className="text-foreground">open</span>
            <span className="text-primary">-</span>
            <span className="text-foreground">event</span>
          </Link>
        </div>

        {/* Center: Main Navigation - Desktop only */}
        <nav className="hidden lg:flex items-center gap-1 ml-6">
          {mainNavItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-0.5 sm:gap-2 ml-auto">
          {/* Notifications */}
          <button
            className={cn(
              'relative p-2.5 sm:p-2 rounded-lg text-muted-foreground',
              'hover:text-foreground hover:bg-muted transition-colors cursor-pointer touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center'
            )}
            title="Notifications"
          >
            <Bell size={18} weight="duotone" />
            <span className="absolute top-2 sm:top-1.5 right-2 sm:right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
          </button>

          <ThemeToggle />

          {/* User menu dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-1 rounded-lg transition-colors touch-manipulation',
                'hover:bg-muted cursor-pointer',
                menuOpen && 'bg-muted'
              )}
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="w-7 h-7 sm:w-7 sm:h-7 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="w-7 h-7 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-border">
                  <span className="text-xs font-medium text-primary">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <CaretDown
                size={12}
                weight="bold"
                className={cn(
                  'text-muted-foreground transition-transform hidden sm:block',
                  menuOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-xl shadow-lg py-1 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
                {/* User info */}
                <div className="px-3 py-2 border-b border-border">
                  <p className="font-medium text-sm truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>

                {/* Menu items */}
                <Link
                  to="/dashboard/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  <User size={16} weight="duotone" />
                  Profile Settings
                </Link>

                {/* Admin Panel Link */}
                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-amber-600 dark:text-amber-400"
                  >
                    <ShieldCheck size={16} weight="duotone" />
                    Admin Panel
                  </Link>
                )}

                <div className="h-px bg-border my-1" />

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <SignOut size={16} weight="duotone" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
