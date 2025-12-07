import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  Calendar,
  MapPin,
  Clock,
  DotsThree,
  PencilSimple,
  Trash,
  Copy,
  Eye,
  NotePencil,
  ListChecks,
  Broadcast,
  CheckCircle,
  XCircle,
  CaretRight,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import {
  eventStatusConfig,
  eventStatusFilters,
  statusWorkflowOrder,
  formatDate,
} from '@/lib/constants'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'

// Status icon component
function StatusIcon({ status, size = 16, className }: { status: string; size?: number; className?: string }) {
  const iconProps = { size, weight: 'duotone' as const, className }
  switch (status) {
    case 'draft':
      return <NotePencil {...iconProps} />
    case 'planning':
      return <ListChecks {...iconProps} />
    case 'active':
      return <Broadcast {...iconProps} />
    case 'completed':
      return <CheckCircle {...iconProps} />
    case 'cancelled':
      return <XCircle {...iconProps} />
    default:
      return <Calendar {...iconProps} />
  }
}

// Progress indicator showing where event is in lifecycle
function StatusProgress({ currentStatus }: { currentStatus: string }) {
  const currentIndex = statusWorkflowOrder.indexOf(currentStatus as typeof statusWorkflowOrder[number])

  if (currentStatus === 'cancelled') {
    return (
      <div className="flex items-center gap-1 text-xs text-red-500">
        <XCircle size={12} weight="bold" />
        <span>Cancelled</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {statusWorkflowOrder.map((status, index) => {
        const config = eventStatusConfig[status]
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        const isUpcoming = index > currentIndex

        return (
          <div key={status} className="flex items-center">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      isCompleted && 'bg-emerald-500',
                      isCurrent && config.bg.replace('/10', '').replace('bg-', 'bg-') + ' ring-2 ring-offset-1 ring-offset-background ' + config.bg.replace('/10', '/30'),
                      isUpcoming && 'bg-muted-foreground/20'
                    )}
                    style={isCurrent ? {
                      backgroundColor: status === 'draft' ? 'rgb(113 113 122)' :
                        status === 'planning' ? 'rgb(217 119 6)' :
                        status === 'active' ? 'rgb(5 150 105)' :
                        'rgb(37 99 235)'
                    } : undefined}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-medium">{config.label}</p>
                  <p className="text-muted-foreground">{config.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {index < statusWorkflowOrder.length - 1 && (
              <div
                className={cn(
                  'w-4 h-0.5 mx-0.5',
                  isCompleted ? 'bg-emerald-500' : 'bg-muted-foreground/20'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function EventsPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteEventId, setDeleteEventId] = useState<Id<'events'> | null>(null)
  const [deleteEventTitle, setDeleteEventTitle] = useState('')

  // Get all events to calculate counts
  const allEvents = useQuery(api.events.getMyEvents, {})
  const events = useQuery(api.events.getMyEvents, {
    status: statusFilter === 'all' ? undefined : statusFilter,
  })
  const deleteEvent = useMutation(api.events.remove)
  const updateEvent = useMutation(api.events.update)
  const duplicateEvent = useMutation(api.events.duplicate)

  // Calculate counts per status
  const statusCounts = useMemo(() => {
    if (!allEvents) return {}
    return allEvents.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [allEvents])

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
      const config = eventStatusConfig[newStatus]
      toast.success(`Event moved to ${config?.label || newStatus}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    }
  }

  const handleDuplicate = async (eventId: Id<'events'>) => {
    try {
      const newEventId = await duplicateEvent({ id: eventId })
      toast.success('Event duplicated successfully')
      navigate(`/dashboard/events/${newEventId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to duplicate event')
    }
  }

  const totalCount = allEvents?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-mono">Events</h1>
        <p className="text-muted-foreground mt-1">
          Manage all your events in one place
        </p>
      </div>

      {/* Status Filter Tabs with Counts */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-border">
        {eventStatusFilters.map((filter) => {
          const count = filter.value === 'all'
            ? totalCount
            : (statusCounts[filter.value] || 0)
          const config = filter.value !== 'all' ? eventStatusConfig[filter.value] : null
          const isActive = statusFilter === filter.value

          return (
            <TooltipProvider key={filter.value} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setStatusFilter(filter.value)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {config && (
                      <StatusIcon
                        status={filter.value}
                        size={16}
                        className={isActive ? '' : config.text}
                      />
                    )}
                    <span>{filter.label}</span>
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-xs font-semibold min-w-[1.25rem] text-center',
                        isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {count}
                    </span>
                  </button>
                </TooltipTrigger>
                {config && (
                  <TooltipContent side="bottom">
                    <p>{config.description}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>

      {/* Events List or Empty State */}
      {events === undefined ? (
        // Loading state
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5 animate-pulse"
            >
              <div className="h-6 bg-muted rounded w-1/3 mb-3" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        // Empty State
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Calendar
            size={64}
            weight="duotone"
            className="mx-auto text-muted-foreground/30 mb-6"
          />
          <h3 className="text-lg font-semibold mb-2">
            {statusFilter === 'all'
              ? 'No events yet'
              : `No ${eventStatusConfig[statusFilter]?.label.toLowerCase() || statusFilter} events`}
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {statusFilter === 'all'
              ? 'Use the sidebar to create your first event'
              : `You don't have any events in the "${eventStatusConfig[statusFilter]?.label || statusFilter}" stage`}
          </p>
        </div>
      ) : (
        // Events List
        <div className="space-y-3">
          {events.map((event) => {
            const config = eventStatusConfig[event.status] || eventStatusConfig.draft
            const hasNextAction = config.nextStatus && config.nextAction

            return (
              <div
                key={event._id}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/20 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <Link
                    to={`/dashboard/events/${event._id}`}
                    className="flex-1 min-w-0"
                  >
                    {/* Title and Status Badge */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                          config.bg,
                          config.text
                        )}
                      >
                        <StatusIcon status={event.status} size={12} />
                        {config.label}
                      </span>
                    </div>

                    {/* Description */}
                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                        {event.description}
                      </p>
                    )}

                    {/* Event Details */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
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

                    {/* Progress Indicator */}
                    <StatusProgress currentStatus={event.status} />
                  </Link>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Quick Action Button */}
                    {hasNextAction && (
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                handleStatusChange(event._id, config.nextStatus!)
                              }}
                              className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground',
                                'opacity-0 group-hover:opacity-100 cursor-pointer'
                              )}
                            >
                              {config.nextAction}
                              <CaretRight size={12} weight="bold" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Move to {eventStatusConfig[config.nextStatus!]?.label}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* More Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer">
                          <DotsThree size={20} weight="bold" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/dashboard/events/${event._id}`)
                          }
                        >
                          <Eye size={16} weight="duotone" className="mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/dashboard/events/${event._id}/edit`)
                          }
                        >
                          <PencilSimple
                            size={16}
                            weight="duotone"
                            className="mr-2"
                          />
                          Edit Event
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(event._id)}
                        >
                          <Copy size={16} weight="duotone" className="mr-2" />
                          Duplicate
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Status Transitions */}
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                          Move to
                        </div>
                        {statusWorkflowOrder
                          .filter((s) => s !== event.status)
                          .map((status) => {
                            const statusConfig = eventStatusConfig[status]
                            return (
                              <DropdownMenuItem
                                key={status}
                                onClick={() =>
                                  handleStatusChange(event._id, status)
                                }
                              >
                                <StatusIcon
                                  status={status}
                                  size={16}
                                  className={cn('mr-2', statusConfig.text)}
                                />
                                {statusConfig.label}
                              </DropdownMenuItem>
                            )
                          })}

                        {event.status !== 'cancelled' && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(event._id, 'cancelled')
                            }
                            className="text-red-500 focus:text-red-500"
                          >
                            <XCircle
                              size={16}
                              weight="duotone"
                              className="mr-2"
                            />
                            Cancel Event
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
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteEventId}
        onOpenChange={(open: boolean) => !open && setDeleteEventId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteEventTitle}"? This action
              cannot be undone. All associated vendors and sponsors will also be
              removed from this event.
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
