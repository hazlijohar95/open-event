import { useUser } from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { User, Buildings, Bell, Shield } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const settingsSections = [
  {
    title: 'Profile',
    description: 'Manage your personal information',
    icon: User,
  },
  {
    title: 'Organization',
    description: 'Update your organization details',
    icon: Buildings,
  },
  {
    title: 'Notifications',
    description: 'Configure email and push notifications',
    icon: Bell,
  },
  {
    title: 'Security',
    description: 'Manage password and security settings',
    icon: Shield,
  },
]

export function SettingsPage() {
  const { user } = useUser()
  const profile = useQuery(api.organizerProfiles.getMyProfile)

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-mono">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Summary */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-4">
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || 'Profile'}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={32} weight="duotone" className="text-primary" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold">{user?.fullName || 'User'}</h2>
            <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
            {profile?.organizationName && (
              <p className="text-sm text-muted-foreground mt-1">{profile.organizationName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-3">
        {settingsSections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.title}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card text-left',
                'hover:border-primary/20 hover:bg-muted/50 transition-colors cursor-pointer'
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Icon size={20} weight="duotone" className="text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{section.title}</h3>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Coming Soon Notice */}
      <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
        <p className="text-sm text-muted-foreground">
          Full settings management coming soon. For now, manage your account via{' '}
          <a href="https://accounts.clerk.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Clerk
          </a>
          .
        </p>
      </div>
    </div>
  )
}
