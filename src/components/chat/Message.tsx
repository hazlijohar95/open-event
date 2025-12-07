import { type ReactNode } from 'react'
import { User, Robot } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

// ============================================================================
// Types
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system'

export interface MessageProps {
  role: MessageRole
  children: ReactNode
  avatar?: ReactNode
  isStreaming?: boolean
  isNew?: boolean
  className?: string
  actions?: ReactNode
}

// ============================================================================
// Component
// ============================================================================

export function Message({
  role,
  children,
  avatar,
  isStreaming = false,
  isNew: _isNew = false,
  className,
  actions,
}: MessageProps) {
  const isUser = role === 'user'
  const isAssistant = role === 'assistant'

  // Default avatars
  const defaultAvatar = isUser ? (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shadow-sm">
      <User size={16} weight="fill" className="text-muted-foreground" />
    </div>
  ) : isAssistant ? (
    <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center shadow-sm">
      <Robot size={16} weight="fill" className="text-background" />
    </div>
  ) : null

  return (
    <div
      className={cn(
        'group flex gap-3',
        isUser && 'flex-row-reverse',
        // Smooth entrance animation
        'animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out',
        className
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">{avatar || defaultAvatar}</div>

      {/* Content wrapper */}
      <div
        className={cn(
          'flex-1 flex flex-col gap-1 min-w-0',
          isUser && 'items-end'
        )}
      >
        {/* Message bubble */}
        <div
          className={cn(
            'relative max-w-[85%] px-4 py-2.5 rounded-2xl',
            'transition-all duration-200',
            isUser
              ? 'bg-foreground text-background rounded-br-sm'
              : 'bg-muted text-foreground rounded-bl-sm',
            // Subtle shadow for depth
            'shadow-sm'
          )}
        >
          {children}

          {/* Streaming cursor */}
          {isStreaming && (
            <span
              className="inline-block ml-0.5 w-0.5 h-4 bg-current animate-pulse rounded-full align-middle"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Actions (copy, retry, etc.) */}
        {actions && (
          <div
            className={cn(
              'flex items-center gap-1 mt-1',
              'opacity-0 group-hover:opacity-100',
              'transition-opacity duration-200',
              isUser && 'flex-row-reverse'
            )}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Message Group Component
// ============================================================================

export interface MessageGroupProps {
  children: ReactNode
  className?: string
}

export function MessageGroup({ children, className }: MessageGroupProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  )
}

// ============================================================================
// Thinking Indicator
// ============================================================================

export interface ThinkingIndicatorProps {
  className?: string
  text?: string
}

export function ThinkingIndicator({ className, text }: ThinkingIndicatorProps) {
  return (
    <div
      className={cn(
        'flex gap-3',
        'animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        className
      )}
    >
      <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center shadow-sm">
        <Robot size={16} weight="fill" className="text-background" />
      </div>
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" />
          </div>
          {text && (
            <span className="text-sm text-muted-foreground ml-2">{text}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Typing Indicator (alternative style)
// ============================================================================

export interface TypingIndicatorProps {
  className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        'flex gap-3',
        'animate-in fade-in-0 duration-200',
        className
      )}
    >
      <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center shadow-sm">
        <Robot size={16} weight="fill" className="text-background animate-pulse" />
      </div>
      <div className="flex items-center">
        <span className="text-sm text-muted-foreground">Thinking</span>
        <span className="inline-flex ml-1">
          <span className="animate-[bounce_1.4s_infinite_0s] text-muted-foreground">.</span>
          <span className="animate-[bounce_1.4s_infinite_0.2s] text-muted-foreground">.</span>
          <span className="animate-[bounce_1.4s_infinite_0.4s] text-muted-foreground">.</span>
        </span>
      </div>
    </div>
  )
}
