import { useQuery, useMutation } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../convex/_generated/api'
import {
  User,
  Buildings,
  Bell,
  Shield,
  CheckCircle,
  Envelope,
  Calendar,
  Users,
  Target,
  Briefcase,
  SignOut,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

const organizationTypes = [
  { value: 'company', label: 'Company' },
  { value: 'nonprofit', label: 'Non-Profit' },
  { value: 'government', label: 'Government' },
  { value: 'community', label: 'Community Group' },
  { value: 'educational', label: 'Educational Institution' },
  { value: 'individual', label: 'Individual' },
]

const eventTypeOptions = [
  'Conferences',
  'Workshops',
  'Meetups',
  'Hackathons',
  'Seminars',
  'Networking Events',
  'Product Launches',
  'Celebrations',
  'Corporate Events',
  'Virtual Events',
]

const eventScales = [
  { value: 'small', label: 'Small (< 50 attendees)' },
  { value: 'medium', label: 'Medium (50-200 attendees)' },
  { value: 'large', label: 'Large (200-1000 attendees)' },
  { value: 'enterprise', label: 'Enterprise (1000+ attendees)' },
]

const experienceLevels = [
  { value: 'first-time', label: 'First-time organizer' },
  { value: '1-5', label: '1-5 events organized' },
  { value: '5-20', label: '5-20 events organized' },
  { value: '20+', label: '20+ events organized' },
]

export function SettingsPage() {
  const { signOut } = useAuthActions()
  const navigate = useNavigate()
  const user = useQuery(api.queries.auth.getCurrentUser)
  const profile = useQuery(api.organizerProfiles.getMyProfile)
  const saveProfile = useMutation(api.organizerProfiles.saveProfile)

  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // Profile form state
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    eventTypes: [] as string[],
    eventScale: '',
    experienceLevel: '',
  })

  // Notification settings (local state for now)
  const [notifications, setNotifications] = useState({
    emailEventUpdates: true,
    emailVendorMessages: true,
    emailSponsorMessages: true,
    emailWeeklyDigest: false,
    pushEventReminders: true,
    pushNewMessages: true,
  })

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        organizationName: profile.organizationName || '',
        organizationType: profile.organizationType || '',
        eventTypes: profile.eventTypes || [],
        eventScale: profile.eventScale || '',
        experienceLevel: profile.experienceLevel || '',
      })
    }
  }, [profile])

  const handleChange = (field: string, value: string | string[]) => {
    setHasChanges(true)
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const toggleEventType = (eventType: string) => {
    setHasChanges(true)
    setFormData((prev) => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(eventType)
        ? prev.eventTypes.filter((t) => t !== eventType)
        : [...prev.eventTypes, eventType],
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveProfile({
        organizationName: formData.organizationName || undefined,
        organizationType: formData.organizationType || undefined,
        eventTypes: formData.eventTypes.length > 0 ? formData.eventTypes : undefined,
        eventScale: formData.eventScale || undefined,
        experienceLevel: formData.experienceLevel || undefined,
      })
      toast.success('Settings saved successfully')
      setHasChanges(false)
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/sign-in')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-primary text-primary-foreground text-sm font-medium',
              'hover:bg-primary/90 transition-colors cursor-pointer',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <CheckCircle size={16} weight="bold" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || 'Profile'}
                className="w-20 h-20 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
                <User size={40} weight="duotone" className="text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{user?.name || 'User'}</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Envelope size={14} />
              {user?.email}
            </p>
            {formData.organizationName && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Buildings size={14} />
                {formData.organizationName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} weight="duotone" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Buildings size={16} weight="duotone" />
            <span className="hidden sm:inline">Organization</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} weight="duotone" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Briefcase size={18} weight="duotone" className="text-primary" />
              Experience & Preferences
            </h3>

            <div className="space-y-6">
              <div>
                <Label>Experience Level</Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) => handleChange('experienceLevel', value)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Typical Event Scale</Label>
                <Select
                  value={formData.eventScale}
                  onValueChange={(value) => handleChange('eventScale', value)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select typical event size" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventScales.map((scale) => (
                      <SelectItem key={scale.value} value={scale.value}>
                        {scale.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-3 block">Event Types You Organize</Label>
                <div className="flex flex-wrap gap-2">
                  {eventTypeOptions.map((type) => {
                    const isSelected = formData.eventTypes.includes(type)
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleEventType(type)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        )}
                      >
                        {type}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Shield size={18} weight="duotone" className="text-primary" />
              Account
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Envelope size={20} weight="duotone" className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Email Address</p>
                    <p className="text-xs text-muted-foreground">{user?.email || 'Not set'}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className={cn(
                  'w-full flex items-center justify-between p-4 rounded-lg border border-destructive/20',
                  'hover:bg-destructive/5 transition-colors cursor-pointer text-left'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <SignOut size={20} weight="duotone" className="text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-destructive">Sign Out</p>
                    <p className="text-xs text-muted-foreground">Sign out of your account</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Buildings size={18} weight="duotone" className="text-primary" />
              Organization Details
            </h3>

            <div className="space-y-6">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={formData.organizationName}
                  onChange={(e) => handleChange('organizationName', e.target.value)}
                  placeholder="e.g., Acme Corp"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Organization Type</Label>
                <Select
                  value={formData.organizationType}
                  onValueChange={(value) => handleChange('organizationType', value)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Target size={18} weight="duotone" className="text-primary" />
              Organization Stats
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={Calendar} label="Total Events" value="0" />
              <StatCard icon={Users} label="Total Attendees" value="0" />
              <StatCard icon={Buildings} label="Vendors Used" value="0" />
              <StatCard icon={Target} label="Sponsors" value="0" />
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Stats will update as you create and manage events
            </p>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Envelope size={18} weight="duotone" className="text-primary" />
              Email Notifications
            </h3>

            <div className="space-y-4">
              <NotificationToggle
                label="Event Updates"
                description="Get notified when events are updated or status changes"
                checked={notifications.emailEventUpdates}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, emailEventUpdates: checked }))
                }
              />
              <NotificationToggle
                label="Vendor Messages"
                description="Receive emails when vendors respond to inquiries"
                checked={notifications.emailVendorMessages}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, emailVendorMessages: checked }))
                }
              />
              <NotificationToggle
                label="Sponsor Messages"
                description="Receive emails when sponsors respond to proposals"
                checked={notifications.emailSponsorMessages}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, emailSponsorMessages: checked }))
                }
              />
              <NotificationToggle
                label="Weekly Digest"
                description="Get a summary of your events and activities each week"
                checked={notifications.emailWeeklyDigest}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, emailWeeklyDigest: checked }))
                }
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Bell size={18} weight="duotone" className="text-primary" />
              Push Notifications
            </h3>

            <div className="space-y-4">
              <NotificationToggle
                label="Event Reminders"
                description="Get reminded about upcoming events"
                checked={notifications.pushEventReminders}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, pushEventReminders: checked }))
                }
              />
              <NotificationToggle
                label="New Messages"
                description="Get notified when you receive new messages"
                checked={notifications.pushNewMessages}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, pushNewMessages: checked }))
                }
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
            <p className="text-sm text-muted-foreground">
              Notification preferences are saved locally for now. Full notification system coming soon.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Spacer for Mobile Save Button */}
      {hasChanges && <div className="h-20 sm:hidden" />}

      {/* Mobile Save Button */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border sm:hidden">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              'w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
              'bg-primary text-primary-foreground text-sm font-medium',
              'hover:bg-primary/90 transition-colors cursor-pointer',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <CheckCircle size={16} weight="bold" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'; className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="p-4 rounded-lg bg-muted/50 text-center">
      <Icon size={24} weight="duotone" className="text-primary mx-auto mb-2" />
      <p className="text-2xl font-bold font-mono">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

// Notification Toggle Component
function NotificationToggle({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
