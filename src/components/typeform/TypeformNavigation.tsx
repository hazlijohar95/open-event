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
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Main navigation buttons */}
      <div className="flex items-center gap-3">
        {/* Back button */}
        {onPrevious && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onPrevious}
            disabled={!canGoPrevious || isLoading}
            className="shrink-0"
          >
            <ArrowLeft size={18} weight="bold" className="mr-2" />
            Back
          </Button>
        )}

        {/* Continue/Submit button */}
        <Button
          type="button"
          size="lg"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
          className={cn('flex-1 max-w-xs', !onPrevious && 'ml-auto')}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : isLastStep ? (
            <>
              Submit
              <Check size={18} weight="bold" className="ml-2" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={18} weight="bold" className="ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Keyboard hint */}
      {showKeyboardHint && canGoNext && !isLoading && (
        <p className="text-xs text-muted-foreground text-center">
          Press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono font-medium">
            Enter
          </kbd>{' '}
          to continue
        </p>
      )}
    </div>
  )
}
