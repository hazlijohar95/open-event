import { type ReactNode, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { TypeformProgress } from './TypeformProgress'
import { cn } from '@/lib/utils'

export interface TypeformLayoutProps {
  children: ReactNode
  /** Current step number (1-indexed) */
  currentStep: number
  /** Total number of steps */
  totalSteps: number
  /** Handler for going to previous step */
  onPrevious?: () => void
  /** Handler for going to next step */
  onNext?: () => void
  /** Whether the user can proceed to next step */
  canGoNext?: boolean
  /** Whether the user can go back (reserved for future use) */
  canGoPrevious?: boolean
  /** Logo/brand text */
  brandText?: string
  /** Link for the brand */
  brandLink?: string
  /** Additional class names */
  className?: string
  /** Whether to show the header */
  showHeader?: boolean
  /** Whether to enable Enter key to advance */
  enableKeyboardNav?: boolean
}

export function TypeformLayout({
  children,
  currentStep,
  totalSteps,
  onNext,
  canGoNext = true,
  brandText = 'open-event',
  brandLink = '/',
  className,
  showHeader = true,
  enableKeyboardNav = true,
}: TypeformLayoutProps) {
  // Handle Enter key to advance
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't capture if user is in a textarea or contenteditable
      const target = e.target as HTMLElement
      const isTextarea = target.tagName === 'TEXTAREA'
      const isContentEditable = target.isContentEditable

      if (e.key === 'Enter' && !e.shiftKey && canGoNext && onNext) {
        // For textareas, require Shift+Enter to submit
        if (isTextarea || isContentEditable) {
          return
        }
        e.preventDefault()
        onNext()
      }
    },
    [canGoNext, onNext]
  )

  useEffect(() => {
    if (!enableKeyboardNav) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enableKeyboardNav, handleKeyDown])

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col bg-background',
        'typeform-layout',
        className
      )}
    >
      {/* Fixed progress bar at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <TypeformProgress current={currentStep} total={totalSteps} />
      </div>

      {/* Header */}
      {showHeader && (
        <header className="flex items-center justify-between px-6 py-4 pt-6">
          <Link
            to={brandLink}
            className="font-mono text-lg font-semibold hover:opacity-80 transition-opacity"
          >
            {brandText}
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {currentStep} of {totalSteps}
            </span>
            <ThemeToggle />
          </div>
        </header>
      )}

      {/* Main content - centered vertically and horizontally */}
      <main className="flex-1 flex items-center justify-center px-6 py-8 sm:py-12">
        <div className="w-full max-w-2xl typeform-content">{children}</div>
      </main>

      {/* Decorative Background - subtle gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-muted/20 to-transparent" />
      </div>
    </div>
  )
}
