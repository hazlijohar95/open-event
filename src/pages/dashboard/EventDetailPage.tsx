import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  CurrencyDollar,
  Clock,
  Globe,
  PencilSimple,
  Trash,
  CaretRight,
  Buildings,
  Handshake,
  CheckCircle,
  Warning,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useState } from 'react'

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-zinc-500/10', text: 'text-zinc-500', label: 'Draft' },
  planning: { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Planning' },
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'Active' },
  completed: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Completed' },
  cancelled: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Cancelled' },
}

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)

  const event = useQuery(
    api.events.get,
    eventId ? { id: eventId as Id<'events'> } : 'skip'
  )

  const deleteEvent = useMutation(api.events.remove)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const handleDelete = async () => {
    if (!eventId) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this event? This action cannot be undone.'
    )

    if (!confirmed) return

    setIsDeleting(true)
    try {
      await deleteEvent({ id: eventId as Id<'events'> })
      toast.success('Event deleted successfully')
      navigate('/dashboard/events')
    } catch {
      toast.error('Failed to delete event')
    } finally {
      setIsDeleting(false)
    }
  }

  // Loading state
  if (event === undefined) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-muted rounded-lg" />
          <div className="h-8 bg-muted rounded w-1/3" />
        </div>
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="h-6 bg-muted rounded w-1/4 mb-4" />
          <div className="h-4 bg-muted rounded w-2/3 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    )
  }

  // Not found state
  if (event === null) {
    return (
      <div className="text-center py-16">
        <Warning size={64} weight="duotone" className="mx-auto text-muted-foreground/30 mb-6" />
        <h2 className="text-xl font-semibold mb-2">Event not found</h2>
        <p className="text-muted-foreground mb-6">
          The event you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          to="/dashboard/events"
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg',
            'bg-primary text-primary-foreground font-medium text-sm',
            'hover:bg-primary/90 transition-colors'
          )}
        >
          <ArrowLeft size={18} weight="bold" />
          Back to Events
        </Link>
      </div>
    )
  }

  const colors = statusColors[event.status] || statusColors.draft

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            to="/dashboard/events"
            className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mt-1"
          >
            <ArrowLeft size={20} weight="bold" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold font-mono">{event.title}</h1>
              <span
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium capitalize',
                  colors.bg,
                  colors.text
                )}
              >
                {colors.label}
              </span>
            </div>
            {event.description && (
              <p className="text-muted-foreground max-w-2xl">{event.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <button
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
              'border border-border text-sm font-medium',
              'hover:bg-muted transition-colors cursor-pointer'
            )}
          >
            <PencilSimple size={16} weight="bold" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
              'border border-destructive/20 text-destructive text-sm font-medium',
              'hover:bg-destructive/10 transition-colors cursor-pointer',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Trash size={16} weight="bold" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Event Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date & Time Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar size={18} weight="duotone" className="text-primary" />
              Date & Time
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-muted-foreground" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-muted-foreground" />
                <span>
                  {formatTime(event.startDate)}
                  {event.endDate && ` - ${formatTime(event.endDate)}`}
                </span>
              </div>
              {event.timezone && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Globe size={16} />
                  <span>{event.timezone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin size={18} weight="duotone" className="text-primary" />
              Location
            </h2>
            <div className="space-y-3">
              {event.locationType && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm capitalize">
                  {event.locationType === 'in-person' && '📍 In-Person'}
                  {event.locationType === 'virtual' && '💻 Virtual'}
                  {event.locationType === 'hybrid' && '🔄 Hybrid'}
                </div>
              )}
              {event.venueName && (
                <div>
                  <p className="font-medium">{event.venueName}</p>
                  {event.venueAddress && (
                    <p className="text-sm text-muted-foreground mt-1">{event.venueAddress}</p>
                  )}
                </div>
              )}
              {event.virtualPlatform && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe size={14} className="text-muted-foreground" />
                  <span>Platform: {event.virtualPlatform}</span>
                </div>
              )}
              {!event.venueName && !event.virtualPlatform && (
                <p className="text-muted-foreground text-sm">No location specified</p>
              )}
            </div>
          </div>

          {/* Requirements Card */}
          {event.requirements && Object.values(event.requirements).some(Boolean) && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle size={18} weight="duotone" className="text-primary" />
                Requirements
              </h2>
              <div className="flex flex-wrap gap-2">
                {event.requirements.catering && (
                  <span className="px-3 py-1.5 rounded-lg bg-muted text-sm">🍽️ Catering</span>
                )}
                {event.requirements.av && (
                  <span className="px-3 py-1.5 rounded-lg bg-muted text-sm">🎤 AV Equipment</span>
                )}
                {event.requirements.photography && (
                  <span className="px-3 py-1.5 rounded-lg bg-muted text-sm">📸 Photography</span>
                )}
                {event.requirements.security && (
                  <span className="px-3 py-1.5 rounded-lg bg-muted text-sm">🔒 Security</span>
                )}
                {event.requirements.transportation && (
                  <span className="px-3 py-1.5 rounded-lg bg-muted text-sm">🚗 Transportation</span>
                )}
                {event.requirements.decoration && (
                  <span className="px-3 py-1.5 rounded-lg bg-muted text-sm">🎨 Decoration</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Event Stats */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold mb-4">Event Details</h2>
            <div className="space-y-4">
              {event.eventType && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="text-sm font-medium capitalize">{event.eventType}</span>
                </div>
              )}
              {event.expectedAttendees && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Users size={14} />
                    Attendees
                  </span>
                  <span className="text-sm font-medium">
                    {event.expectedAttendees.toLocaleString()}
                  </span>
                </div>
              )}
              {event.budget && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <CurrencyDollar size={14} />
                    Budget
                  </span>
                  <span className="text-sm font-medium">
                    ${event.budget.toLocaleString()} {event.budgetCurrency || 'USD'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Vendors Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Buildings size={18} weight="duotone" className="text-primary" />
                Vendors
              </h2>
              <Link
                to="/dashboard/vendors"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Manage
                <CaretRight size={12} />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              No vendors added yet. Use the AI assistant to find and add vendors.
            </p>
          </div>

          {/* Sponsors Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Handshake size={18} weight="duotone" className="text-primary" />
                Sponsors
              </h2>
              <Link
                to="/dashboard/sponsors"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Manage
                <CaretRight size={12} />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              No sponsors added yet. Use the AI assistant to find sponsors.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
