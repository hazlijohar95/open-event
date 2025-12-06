import { cn } from '@/lib/utils'

interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Step indicators */}
      <div className="flex justify-between mt-3">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              index + 1 < currentStep
                ? 'bg-primary'
                : index + 1 === currentStep
                ? 'bg-primary scale-125'
                : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  )
}
