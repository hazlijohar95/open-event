import { cn } from '@/lib/utils'
import { getToolConfig } from '@/lib/agent-tools'
import { Check, X } from '@phosphor-icons/react'

interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

interface ToolConfirmationDialogProps {
  toolCall: ToolCall
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ToolConfirmationDialog({
  toolCall,
  onConfirm,
  onCancel,
  isLoading,
}: ToolConfirmationDialogProps) {
  const config = getToolConfig(toolCall.name)
  const Icon = config.icon
  const title = config.confirmLabel
  const description = config.confirmDescription

  // Format arguments for display
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'Not specified'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    return String(value)
  }

  const displayArgs = Object.entries(toolCall.arguments).filter(
    ([key]) => !key.startsWith('_') && key !== 'organizerId'
  )

  return (
    <div className="rounded-xl border border-primary/20 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-primary/5 border-b border-primary/10">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon size={20} weight="duotone" className="text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Arguments */}
      <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
        {displayArgs.map(([key, value]) => (
          <div key={key} className="flex justify-between items-start gap-4">
            <span className="text-sm text-muted-foreground capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className="text-sm font-medium text-right max-w-[200px] truncate">
              {formatValue(value)}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 border-t border-border">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className={cn(
            'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
            'border border-border text-sm font-medium',
            'hover:bg-muted transition-colors cursor-pointer',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <X size={16} weight="bold" />
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
            'bg-primary text-primary-foreground text-sm font-medium',
            'hover:bg-primary/90 transition-colors cursor-pointer',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Check size={16} weight="bold" />
          {isLoading ? 'Confirming...' : 'Confirm'}
        </button>
      </div>
    </div>
  )
}
