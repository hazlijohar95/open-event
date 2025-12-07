import { ArrowLeft, ArrowRight, Check } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface TypeformNavigationProps {
  onPrevious?: () => void
  onNext?: () => void
  canGoPrevious?: boolean
  canGoNext?: boolean
  isLoading?: boolean
  isLastStep?: boolean
  /** Show keyboard hint */
  showKeyboardHint?: boolean
  className?: string
}

export function TypeformNavigation({
  onPrevious,
  onNext,
  canGoPrevious = true,
  canGoNext = true,
  isLoading = false,
  isLastStep = false,
  showKeyboardHint = true,
  className,
}: TypeformNavigationProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:gap-4 pt-4 sm:pt-6', className)}>
      {/* Main navigation buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Back button */}
        {onPrevious && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onPrevious}
            disabled={!canGoPrevious || isLoading}
            className="shrink-0 h-11 sm:h-12 px-3 sm:px-4"
          >
            <ArrowLeft size={18} weight="bold" className="mr-1.5 sm:mr-2" />
            <span className="hidden xs:inline">Back</span>
          </Button>
        )}

        {/* Continue/Submit button */}
        <Button
          type="button"
          size="lg"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className={cn(
            'flex-1 h-11 sm:h-12 text-sm sm:text-base font-medium',
            'max-w-full sm:max-w-xs',
            !onPrevious && 'sm:ml-auto'
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="hidden xs:inline">Processing...</span>
            </span>
          ) : isLastStep ? (
            <>
              <span>Complete</span>
              <Check size={18} weight="bold" className="ml-1.5 sm:ml-2" />
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight size={18} weight="bold" className="ml-1.5 sm:ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Keyboard hint - hidden on mobile */}
      {showKeyboardHint && canGoNext && !isLoading && (
        <p className="text-[11px] sm:text-xs text-muted-foreground/70 text-center hidden sm:block">
          Press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted/50 text-[10px] font-mono font-medium border border-border/50">
            Enter ↵
          </kbd>{' '}
          to continue
        </p>
      )}
    </div>
  )
}
