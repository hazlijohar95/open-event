import { Link } from 'react-router-dom'
import { useUser, useClerk, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CalendarPlus,
  MagnifyingGlass,
  ChartLine,
  Gear,
  Bell,
  User,
  SignOut,
  UserCircle,
} from '@phosphor-icons/react'

export function Dashboard() {
  return (
    <>
      <SignedIn>
        <DashboardContent />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

function DashboardContent() {
  const { user } = useUser()
  const { signOut } = useClerk()

  const handleSignOut = () => {
    signOut({ redirectUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link
            to="/"
            className="font-mono text-lg font-semibold hover:opacity-80 transition-opacity"
          >
            open-event
          </Link>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell size={20} weight="duotone" className="text-muted-foreground" />
            </button>
            <ThemeToggle />

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || 'Profile'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="p-1">
                      <User size={20} weight="duotone" className="text-muted-foreground" />
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <UserCircle size={16} weight="duotone" className="mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Gear size={16} weight="duotone" className="mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <SignOut size={16} weight="duotone" className="mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-mono text-2xl sm:text-3xl font-bold">
            Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personalized dashboard is being prepared.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <QuickActionCard
            icon={CalendarPlus}
            title="Create Event"
            description="Start planning your next event"
          />
          <QuickActionCard
            icon={MagnifyingGlass}
            title="Find Partners"
            description="Browse sponsors and vendors"
          />
          <QuickActionCard
            icon={ChartLine}
            title="Analytics"
            description="View your event metrics"
          />
          <QuickActionCard
            icon={Gear}
            title="Settings"
            description="Customize your experience"
          />
        </div>

        {/* Placeholder Content */}
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CalendarPlus size={32} weight="duotone" className="text-primary" />
            </div>
            <h2 className="font-mono text-xl font-semibold">
              Dashboard Coming Soon
            </h2>
            <p className="text-muted-foreground">
              We're building your personalized dashboard experience.
              Check back soon for event management, partner discovery, and analytics.
            </p>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof CalendarPlus
  title: string
  description: string
}) {
  return (
    <button className="p-6 bg-card border border-border rounded-xl text-left hover:border-primary/50 hover:shadow-md transition-all group">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon size={20} weight="duotone" className="text-primary" />
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  )
}
