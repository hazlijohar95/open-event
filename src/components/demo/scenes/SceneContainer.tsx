import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

interface SceneContainerProps {
  isActive: boolean
  children: ReactNode
}

export function SceneContainer({ isActive, children }: SceneContainerProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center p-8 transition-all duration-500',
        isActive
          ? 'opacity-100 translate-y-0 z-10'
          : 'opacity-0 translate-y-4 z-0 pointer-events-none'
      )}
    >
      {children}
    </div>
  )
}
