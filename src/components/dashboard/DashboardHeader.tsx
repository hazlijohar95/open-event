import { Link, useNavigate } from 'react-router-dom'
import { useAuthActions } from '@convex-dev/auth/react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Bell, List, SignOut, User, CaretDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

interface DashboardHeaderProps {
  onMenuClick?: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { signOut } = useAuthActions()
  const navigate = useNavigate()
  const user = useQuery(api.queries.auth.getCurrentUser)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
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
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Mobile menu button + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <List size={24} weight="bold" />
          </button>
          <Link to="/" className="lg:hidden font-mono text-lg font-bold">
            <span className="text-foreground">open</span>
            <span className="text-primary">-</span>
            <span className="text-foreground">event</span>
          </Link>
        </div>

        {/* Welcome message - desktop only */}
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <button
            className={cn(
              'relative p-2 rounded-lg text-muted-foreground',
              'hover:text-foreground hover:bg-muted transition-colors cursor-pointer'
            )}
          >
            <Bell size={20} weight="duotone" />
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>

          <ThemeToggle />

          {/* User menu dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(
                'flex items-center gap-2 p-1.5 rounded-lg transition-colors',
                'hover:bg-muted cursor-pointer',
                menuOpen && 'bg-muted'
              )}
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={16} weight="duotone" className="text-primary" />
                </div>
              )}
              <CaretDown
                size={14}
                weight="bold"
                className={cn(
                  'text-muted-foreground transition-transform hidden sm:block',
                  menuOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
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

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
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
