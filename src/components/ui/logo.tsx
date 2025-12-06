import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showTagline?: boolean
}

export function Logo({ size = 'md', className, showTagline = false }: LogoProps) {
  const sizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div className={cn('font-mono font-bold tracking-tight', sizes[size])}>
        <span className="text-foreground">open</span>
        <span className="text-primary">-</span>
        <span className="text-foreground">event</span>
      </div>
      {showTagline && (
        <span className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">
          Event Operations Platform
        </span>
      )}
    </div>
  )
}

/**
 * Animated logo variant with hover effect
 */
export function LogoAnimated({ size = 'md', className }: LogoProps) {
  const sizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  return (
    <div
      className={cn(
        'font-mono font-bold tracking-tight group cursor-pointer',
        sizes[size],
        className
      )}
    >
      <span className="text-foreground transition-colors group-hover:text-primary">open</span>
      <span className="text-primary transition-transform inline-block group-hover:scale-125">-</span>
      <span className="text-foreground transition-colors group-hover:text-primary">event</span>
    </div>
  )
}

/**
 * Minimal logo for tight spaces
 */
export function LogoMini({ className }: { className?: string }) {
  return (
    <div className={cn('font-mono font-bold text-sm tracking-tight', className)}>
      <span className="text-foreground">o</span>
      <span className="text-primary">-</span>
      <span className="text-foreground">e</span>
    </div>
  )
}
