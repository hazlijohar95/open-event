import { useRef, useEffect, useState, useCallback, type ReactNode } from 'react'
import { ArrowDown, Sparkle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { SuggestionChips } from './SuggestionChips'

// ============================================================================
// Types
// ============================================================================

export interface ConversationProps {
  children: ReactNode
  className?: string
  emptyState?: ReactNode
  isEmpty?: boolean
  /** Handler for suggestion chip selection (only shown in empty state) */
  onSuggestionSelect?: (prompt: string) => void
}

// ============================================================================
// Component
// ============================================================================

export function Conversation({
  children,
  className,
  emptyState,
  isEmpty = false,
  onSuggestionSelect: _onSuggestionSelect,
}: ConversationProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showTopShadow, setShowTopShadow] = useState(false)

  // Check scroll position for shadows and auto-scroll
  const checkScrollPosition = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const threshold = 100 // pixels from bottom to consider "at bottom"
    const atBottom = scrollHeight - scrollTop - clientHeight < threshold

    setIsAtBottom(atBottom)
    setShowScrollButton(!atBottom)
    setShowTopShadow(scrollTop > 20) // Show top shadow when scrolled down
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
      {/* Top scroll shadow */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-8 z-10',
          'bg-gradient-to-b from-background via-background/80 to-transparent',
          'pointer-events-none transition-opacity duration-[var(--duration-normal)]',
          showTopShadow ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      />

      {/* Scrollable messages area */}
      <div
        ref={scrollRef}
        className={cn(
          'flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6',
          // Premium scrolling behavior
          'scroll-smooth overscroll-contain',
          // Custom scrollbar styling
          'conversation-scroll custom-scrollbar',
          className
        )}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {children}
        <div ref={bottomRef} className="h-1" aria-hidden="true" />
      </div>

      {/* Bottom scroll shadow (when not at bottom) */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 h-12 z-10',
          'bg-gradient-to-t from-background via-background/80 to-transparent',
          'pointer-events-none transition-opacity duration-[var(--duration-normal)]',
          showScrollButton ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      />

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className={cn(
            'absolute bottom-6 left-1/2 -translate-x-1/2 z-20',
            'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full',
            'bg-foreground text-background shadow-lg',
            'hover:bg-foreground/90 transition-all duration-[var(--duration-fast)]',
            'spring-press',
            'message-entrance',
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
  /** Handler for suggestion chip selection */
  onSuggestionSelect?: (prompt: string) => void
  /** Whether to show suggestion chips */
  showSuggestions?: boolean
}

export function ConversationEmptyState({
  icon,
  title = 'Start a conversation',
  description = 'Send a message to get started',
  children,
  onSuggestionSelect,
  showSuggestions = true,
}: ConversationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto px-4 message-entrance">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 avatar-streaming">
        {icon || <Sparkle size={32} weight="duotone" className="text-primary" />}
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>

      {/* Suggestion Chips */}
      {showSuggestions && onSuggestionSelect && (
        <div className="w-full mb-6">
          <SuggestionChips onSelect={onSuggestionSelect} />
        </div>
      )}

      {/* Custom children */}
      {children}
    </div>
  )
}
