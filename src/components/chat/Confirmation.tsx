import {
  Warning,
  CheckCircle,
  XCircle,
  CalendarPlus,
  Storefront,
  HandCoins,
  Wrench,
  CircleNotch
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

// ============================================================================
// Types
// ============================================================================

export interface ConfirmationProps {
  id: string
  title: string
  description?: string
  toolName: string
  arguments?: Record<string, unknown>
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  className?: string
}

// ============================================================================
// Tool Icon Map
// ============================================================================

const toolIcons: Record<string, typeof Wrench> = {
  createEvent: CalendarPlus,
  updateEvent: CalendarPlus,
  addVendor: Storefront,
  addSponsor: HandCoins,
}

function getToolIcon(name: string) {
  return toolIcons[name] || Wrench
}

// ============================================================================
// Component
// ============================================================================

export function Confirmation({
  title,
  description,
  toolName,
  arguments: args,
  onConfirm,
  onCancel,
  isLoading = false,
  className,
}: ConfirmationProps) {
  const Icon = getToolIcon(toolName)

  return (
    <div
      className={cn(
        'rounded-xl border-2 border-amber-500/50 bg-amber-500/5 p-4',
        'animate-in fade-in slide-in-from-bottom-2 duration-300',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <Warning size={20} weight="fill" className="text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {/* Action details */}
      {args && Object.keys(args).length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Icon size={16} weight="duotone" className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {toolName.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </div>
          <div className="space-y-1.5">
            {Object.entries(args).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground min-w-[80px]">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="text-foreground font-medium">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
            'bg-primary text-primary-foreground font-medium',
            'hover:bg-primary/90 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <>
              <CircleNotch size={16} weight="bold" className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CheckCircle size={16} weight="bold" />
              <span>Confirm</span>
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
            'border border-border bg-background text-foreground font-medium',
            'hover:bg-muted transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <XCircle size={16} weight="bold" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// Inline Confirmation (smaller variant)
// ============================================================================

export interface InlineConfirmationProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  className?: string
}

export function InlineConfirmation({
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  className,
}: InlineConfirmationProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-lg',
        'border border-amber-500/50 bg-amber-500/5',
        className
      )}
    >
      <Warning size={14} weight="fill" className="text-amber-500 flex-shrink-0" />
      <span className="text-sm">{message}</span>
      <div className="flex items-center gap-1 ml-2">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            'p-1.5 rounded-md bg-primary text-primary-foreground',
            'hover:bg-primary/90 transition-colors',
            'disabled:opacity-50'
          )}
          title="Confirm"
        >
          {isLoading ? (
            <CircleNotch size={14} weight="bold" className="animate-spin" />
          ) : (
            <CheckCircle size={14} weight="bold" />
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className={cn(
            'p-1.5 rounded-md border border-border',
            'hover:bg-muted transition-colors',
            'disabled:opacity-50'
          )}
          title="Cancel"
        >
          <XCircle size={14} weight="bold" />
        </button>
      </div>
    </div>
  )
}
