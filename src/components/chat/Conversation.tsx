import { useRef, useEffect, useState, useCallback, type ReactNode } from 'react'
import { ArrowDown, Sparkle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

// ============================================================================
// Types
// ============================================================================

export interface ConversationProps {
  children: ReactNode
  className?: string
  emptyState?: ReactNode
  isEmpty?: boolean
}

// ============================================================================
// Component
// ============================================================================

export function Conversation({
  children,
  className,
  emptyState,
  isEmpty = false,
}: ConversationProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Check if scrolled to bottom
  const checkScrollPosition = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const threshold = 100 // pixels from bottom to consider "at bottom"
    const atBottom = scrollHeight - scrollTop - clientHeight < threshold

    setIsAtBottom(atBottom)
    setShowScrollButton(!atBottom)
  }, [])

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior })
  }, [])

  // Auto-scroll when at bottom and content changes
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom('smooth')
    }
  }, [children, isAtBottom, scrollToBottom])

  // Initial scroll to bottom
  useEffect(() => {
    scrollToBottom('instant')
  }, [scrollToBottom])

  // Monitor scroll position
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    container.addEventListener('scroll', checkScrollPosition)
    return () => container.removeEventListener('scroll', checkScrollPosition)
  }, [checkScrollPosition])

  // Empty state
  if (isEmpty && emptyState) {
    return (
      <div
        className={cn(
          'flex-1 overflow-y-auto p-4 sm:p-6 flex items-center justify-center',
          className
        )}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {emptyState}
      </div>
    )
  }

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      {/* Scrollable messages area */}
      <div
        ref={scrollRef}
        className={cn('flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6', className)}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {children}
        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className={cn(
            'absolute bottom-4 left-1/2 -translate-x-1/2',
            'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full',
            'bg-primary text-primary-foreground shadow-lg',
            'hover:bg-primary/90 transition-all',
            'animate-in fade-in slide-in-from-bottom-2 duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          aria-label="Scroll to bottom for new messages"
        >
          <ArrowDown size={16} weight="bold" />
          <span className="text-xs sm:text-sm font-medium">New messages</span>
        </button>
      )}
    </div>
  )
}

// ============================================================================
// Empty State Component
// ============================================================================

export interface ConversationEmptyStateProps {
  icon?: ReactNode
  title?: string
  description?: string
  children?: ReactNode
}

export function ConversationEmptyState({
  icon,
  title = 'Start a conversation',
  description = 'Send a message to get started',
  children,
}: ConversationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        {icon || <Sparkle size={32} weight="duotone" className="text-primary" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      {children}
    </div>
  )
}
