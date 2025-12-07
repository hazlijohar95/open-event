import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { Plus, Calendar, MapPin, Clock, DotsThree, PencilSimple, Trash, Copy, Eye, CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { eventStatusColors, eventStatusFilters, formatDate } from '@/lib/constants'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export function EventsPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteEventId, setDeleteEventId] = useState<Id<'events'> | null>(null)
  const [deleteEventTitle, setDeleteEventTitle] = useState('')

  const events = useQuery(api.events.getMyEvents, { status: statusFilter === 'all' ? undefined : statusFilter })
  const deleteEvent = useMutation(api.events.remove)
  const updateEvent = useMutation(api.events.update)

  const handleDelete = async () => {
    if (!deleteEventId) return
    try {
      await deleteEvent({ id: deleteEventId })
      toast.success('Event deleted successfully')
      setDeleteEventId(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete event')
    }
  }

  const handleStatusChange = async (eventId: Id<'events'>, newStatus: string) => {
    try {
      await updateEvent({ id: eventId, status: newStatus })
      toast.success(`Event marked as ${newStatus}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  const handleDuplicate = () => {
    // Navigate to create page with pre-filled data
    toast.info('Duplicate feature coming soon')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono">Events</h1>
          <p className="text-muted-foreground mt-1">Manage all your events in one place</p>
        </div>
        <Link
          to="/dashboard/events/new"
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg',
            'bg-primary text-primary-foreground font-medium text-sm',
            'hover:bg-primary/90 transition-colors'
          )}
        >
          <Plus size={18} weight="bold" />
          Create Event
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {eventStatusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
              statusFilter === filter.value
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Events List or Empty State */}
      {events === undefined ? (
        // Loading state
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
              <div className="h-6 bg-muted rounded w-1/3 mb-3" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        // Empty State
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Calendar size={64} weight="duotone" className="mx-auto text-muted-foreground/30 mb-6" />
          <h3 className="text-lg font-semibold mb-2">
            {statusFilter === 'all' ? 'No events yet' : `No ${statusFilter} events`}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {statusFilter === 'all'
              ? 'Create your first event and our AI assistant will help you plan everything'
              : `You don't have any events with "${statusFilter}" status`}
          </p>
          {statusFilter === 'all' && (
            <Link
              to="/dashboard/events/new"
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg',
                'bg-primary text-primary-foreground font-medium',
                'hover:bg-primary/90 transition-colors'
              )}
            >
              <Plus size={18} weight="bold" />
              Create Your First Event
            </Link>
          )}
        </div>
      ) : (
        // Events List
        <div className="space-y-3">
          {events.map((event) => {
            const colors = eventStatusColors[event.status] || eventStatusColors.draft
            return (
              <div
                key={event._id}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/20 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <Link
                    to={`/dashboard/events/${event._id}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold truncate">{event.title}</h3>
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium capitalize',
                        colors.bg,
                        colors.text
                      )}>
                        {event.status}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                        {event.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={14} weight="bold" />
                        {formatDate(event.startDate)}
                      </span>
                      {event.venueName && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} weight="bold" />
                          {event.venueName}
                        </span>
                      )}
                      {event.eventType && (
                        <span className="inline-flex items-center gap-1.5 capitalize">
                          {event.eventType}
                        </span>
                      )}
                    </div>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                      >
                        <DotsThree size={20} weight="bold" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate(`/dashboard/events/${event._id}`)}>
                        <Eye size={16} weight="duotone" className="mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/dashboard/events/${event._id}/edit`)}>
                        <PencilSimple size={16} weight="duotone" className="mr-2" />
                        Edit Event
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate()}>
                        <Copy size={16} weight="duotone" className="mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {event.status === 'draft' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(event._id, 'planning')}>
                          <CheckCircle size={16} weight="duotone" className="mr-2 text-blue-500" />
                          Start Planning
                        </DropdownMenuItem>
                      )}
                      {event.status === 'planning' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(event._id, 'active')}>
                          <CheckCircle size={16} weight="duotone" className="mr-2 text-green-500" />
                          Mark as Active
                        </DropdownMenuItem>
                      )}
                      {event.status === 'active' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(event._id, 'completed')}>
                          <CheckCircle size={16} weight="duotone" className="mr-2 text-purple-500" />
                          Mark as Completed
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setDeleteEventId(event._id)
                          setDeleteEventTitle(event.title)
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash size={16} weight="duotone" className="mr-2" />
                        Delete Event
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteEventId} onOpenChange={(open: boolean) => !open && setDeleteEventId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteEventTitle}"? This action cannot be undone.
              All associated vendors and sponsors will also be removed from this event.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteEventId(null)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
