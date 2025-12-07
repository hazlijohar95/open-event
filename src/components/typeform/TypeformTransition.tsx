import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface TypeformTransitionProps {
  children: ReactNode
  /** Unique key for animation - change this to trigger transition */
  transitionKey: string | number
  /** Direction of transition: 'forward' slides up, 'backward' slides down */
  direction?: 'forward' | 'backward'
  className?: string
}

export function TypeformTransition({
  children,
  transitionKey,
  direction = 'forward',
  className,
}: TypeformTransitionProps) {
  // Use key prop to trigger remount and CSS animation on each step change
  return (
    <div
      key={transitionKey}
      className={cn(
        'typeform-transition-container typeform-entering',
        direction === 'backward' && 'typeform-reverse',
        className
      )}
    >
      {children}
    </div>
  )
}
