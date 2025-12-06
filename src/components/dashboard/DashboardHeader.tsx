import { Link } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Bell, List } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  onMenuClick?: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user } = useUser()

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
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
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

          {/* User menu */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}
