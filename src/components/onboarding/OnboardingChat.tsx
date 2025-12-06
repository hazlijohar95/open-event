import { Robot } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface OnboardingChatProps {
  message: string
  subMessage?: string
  className?: string
}

export function OnboardingChat({ message, subMessage, className }: OnboardingChatProps) {
  return (
    <div className={cn('animate-in fade-in slide-in-from-left-4 duration-500', className)}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Robot size={24} weight="duotone" className="text-primary" />
        </div>
        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-md">
          <p className="text-foreground">{message}</p>
          {subMessage && (
            <p className="text-sm text-muted-foreground mt-1">{subMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}
