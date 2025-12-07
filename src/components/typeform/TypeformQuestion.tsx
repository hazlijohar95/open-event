import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface TypeformQuestionProps {
  /** Main question text - displayed large and prominent */
  question: string
  /** Optional description below the question */
  description?: string
  /** Step number to display before the question */
  stepNumber?: number
  /** Additional content below the description */
  children?: ReactNode
  className?: string
}

export function TypeformQuestion({
  question,
  description,
  stepNumber,
  children,
  className,
}: TypeformQuestionProps) {
  return (
    <div className={cn('space-y-4 sm:space-y-6', className)}>
      {/* Question with optional step number */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-start gap-2.5 sm:gap-3">
          {stepNumber !== undefined && (
            <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 text-primary text-xs sm:text-sm font-semibold shrink-0 mt-0.5 sm:mt-1">
              {stepNumber}
            </span>
          )}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-foreground leading-tight">
            {question}
          </h1>
        </div>

        {description && (
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed pl-0 sm:pl-10 lg:pl-11">
            {description}
          </p>
        )}
      </div>

      {/* Content area - inputs, options, etc */}
      {children && <div className="pl-0">{children}</div>}
    </div>
  )
}
