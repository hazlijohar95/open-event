import { cn } from '@/lib/utils'

export interface TypeformProgressProps {
  current: number
  total: number
  showPercentage?: boolean
  className?: string
}

export function TypeformProgress({
  current,
  total,
  showPercentage = false,
  className,
}: TypeformProgressProps) {
  const percentage = Math.round((current / total) * 100)

  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar container */}
      <div className="h-1 bg-muted/50 w-full">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Optional percentage indicator */}
      {showPercentage && (
        <div className="flex justify-between items-center mt-3 px-1">
          <span className="text-xs text-muted-foreground font-medium">
            {current} of {total}
          </span>
          <span className="text-xs text-muted-foreground">
            {percentage}% complete
          </span>
        </div>
      )}
    </div>
  )
}
