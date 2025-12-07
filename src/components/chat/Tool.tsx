import { useState, useCallback, type ReactNode } from 'react'
import {
  CaretDown,
  CaretRight,
  CircleNotch,
  CheckCircle,
  XCircle,
  Wrench,
  MagnifyingGlass,
  CalendarPlus,
  User,
  Storefront,
  HandCoins
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

// ============================================================================
// Types
// ============================================================================

export type ToolStatus = 'pending' | 'executing' | 'success' | 'error'

export interface ToolProps {
  id: string
  name: string
  arguments?: Record<string, unknown>
  status: ToolStatus
  result?: {
    success: boolean
    summary: string
    data?: unknown
    error?: string
  }
  defaultExpanded?: boolean
  className?: string
}

// ============================================================================
// Tool Icon Map
// ============================================================================

const toolIcons: Record<string, typeof Wrench> = {
  searchVendors: MagnifyingGlass,
  searchSponsors: MagnifyingGlass,
  createEvent: CalendarPlus,
  updateEvent: CalendarPlus,
  getEvent: CalendarPlus,
  getUserProfile: User,
  getVendorDetails: Storefront,
  getSponsorDetails: HandCoins,
}

function getToolIcon(name: string) {
  const Icon = toolIcons[name] || Wrench
  return Icon
}

// ============================================================================
// Tool Display Names
// ============================================================================

const toolDisplayNames: Record<string, string> = {
  searchVendors: 'Search Vendors',
  searchSponsors: 'Search Sponsors',
  createEvent: 'Create Event',
  updateEvent: 'Update Event',
  getEvent: 'Get Event Details',
  getUserProfile: 'Get User Profile',
  getVendorDetails: 'Get Vendor Details',
  getSponsorDetails: 'Get Sponsor Details',
}

function getToolDisplayName(name: string): string {
  return toolDisplayNames[name] || name.replace(/([A-Z])/g, ' $1').trim()
}

// ============================================================================
// Component
// ============================================================================

export function Tool({
  name,
  arguments: args,
  status,
  result,
  defaultExpanded = false,
  className,
}: ToolProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const Icon = getToolIcon(name)
  const displayName = getToolDisplayName(name)

  // Status indicator
  const StatusIndicator = () => {
    switch (status) {
      case 'executing':
        return <CircleNotch size={16} weight="bold" className="animate-spin text-primary" />
      case 'success':
        return <CheckCircle size={16} weight="fill" className="text-green-500" />
      case 'error':
        return <XCircle size={16} weight="fill" className="text-destructive" />
      default:
        return <CircleNotch size={16} weight="duotone" className="text-muted-foreground" />
    }
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card/50 overflow-hidden',
        status === 'executing' && 'border-primary/50',
        status === 'error' && 'border-destructive/50',
        className
      )}
    >
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 text-left',
          'hover:bg-muted/50 transition-colors'
        )}
      >
        {/* Expand/collapse icon */}
        <span className="text-muted-foreground">
          {isExpanded ? (
            <CaretDown size={14} weight="bold" />
          ) : (
            <CaretRight size={14} weight="bold" />
          )}
        </span>

        {/* Tool icon */}
        <span className="text-muted-foreground">
          <Icon size={16} weight="duotone" />
        </span>

        {/* Tool name */}
        <span className="flex-1 text-sm font-medium">{displayName}</span>

        {/* Status */}
        <StatusIndicator />
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 space-y-3 border-t border-border/50">
          {/* Arguments */}
          {args && Object.keys(args).length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Arguments</h4>
              <pre className="text-xs bg-muted/50 p-2 rounded-md overflow-x-auto">
                {JSON.stringify(args, null, 2)}
              </pre>
            </div>
          )}

          {/* Result */}
          {result && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Result</h4>
              <div
                className={cn(
                  'text-sm p-2 rounded-md',
                  result.success ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-destructive/10 text-destructive'
                )}
              >
                {result.summary}
              </div>
              {result.error && (
                <pre className="text-xs text-destructive bg-destructive/5 p-2 rounded-md mt-2 overflow-x-auto">
                  {result.error}
                </pre>
              )}
              {result.data !== undefined && result.data !== null && (
                <pre className="text-xs bg-muted/50 p-2 rounded-md mt-2 overflow-x-auto">
                  {JSON.stringify(result.data, null, 2) as string}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Tool List Component
// ============================================================================

export interface ToolListProps {
  children: ReactNode
  className?: string
}

export function ToolList({ children, className }: ToolListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  )
}
