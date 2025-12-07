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
    <div className={cn('space-y-6', className)}>
      {/* Question with optional step number */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          {stepNumber !== undefined && (
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-semibold shrink-0 mt-1">
              {stepNumber}
            </span>
          )}
          <h1 className="typeform-question">{question}</h1>
        </div>

        {description && (
          <p className="typeform-description pl-0 md:pl-11">{description}</p>
        )}
      </div>

      {/* Content area - inputs, options, etc */}
      {children && <div className="pl-0 md:pl-11">{children}</div>}
    </div>
  )
}
