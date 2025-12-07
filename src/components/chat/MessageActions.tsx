import { useState, useCallback } from 'react'
import { Copy, Check, ArrowClockwise, ThumbsUp, ThumbsDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

// ============================================================================
// Types
// ============================================================================

export interface MessageActionsProps {
  content: string
  onRetry?: () => void
  onFeedback?: (type: 'positive' | 'negative') => void
  showRetry?: boolean
  showCopy?: boolean
  showFeedback?: boolean
  className?: string
}

// ============================================================================
// Component
// ============================================================================

export function MessageActions({
  content,
  onRetry,
  onFeedback,
  showRetry = false,
  showCopy = true,
  showFeedback = false,
  className,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = content
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [content])

  // Handle feedback
  const handleFeedback = useCallback(
    (type: 'positive' | 'negative') => {
      setFeedback(type)
      onFeedback?.(type)
    },
    [onFeedback]
  )

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Copy button */}
      {showCopy && (
        <ActionButton
          onClick={handleCopy}
          icon={copied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="duotone" />}
          label={copied ? 'Copied!' : 'Copy'}
          isActive={copied}
        />
      )}

      {/* Retry button */}
      {showRetry && onRetry && (
        <ActionButton
          onClick={onRetry}
          icon={<ArrowClockwise size={14} weight="duotone" />}
          label="Retry"
        />
      )}

      {/* Feedback buttons */}
      {showFeedback && (
        <>
          <ActionButton
            onClick={() => handleFeedback('positive')}
            icon={<ThumbsUp size={14} weight={feedback === 'positive' ? 'fill' : 'duotone'} />}
            label="Good response"
            isActive={feedback === 'positive'}
          />
          <ActionButton
            onClick={() => handleFeedback('negative')}
            icon={<ThumbsDown size={14} weight={feedback === 'negative' ? 'fill' : 'duotone'} />}
            label="Bad response"
            isActive={feedback === 'negative'}
          />
        </>
      )}
    </div>
  )
}

// ============================================================================
// Action Button
// ============================================================================

interface ActionButtonProps {
  onClick: () => void
  icon: React.ReactNode
  label: string
  isActive?: boolean
}

function ActionButton({ onClick, icon, label, isActive = false }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-1.5 rounded-md transition-colors',
        isActive
          ? 'text-primary bg-primary/10'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  )
}
