import { Check, type Icon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface OptionCardProps {
  label: string
  description?: string
  icon?: Icon
  isSelected: boolean
  onClick: () => void
  delay?: number
}

export function OptionCard({
  label,
  description,
  icon: IconComponent,
  isSelected,
  onClick,
  delay = 0,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
        'hover:scale-[1.02] hover:shadow-md active:scale-[0.98]',
        'animate-in fade-in slide-in-from-bottom-2',
        isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-card hover:border-primary/50'
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex items-center gap-3">
        {IconComponent && (
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
              isSelected ? 'bg-primary/20' : 'bg-muted'
            )}
          >
            <IconComponent
              size={20}
              weight="duotone"
              className={isSelected ? 'text-primary' : 'text-muted-foreground'}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium', isSelected && 'text-primary')}>
            {label}
          </p>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-in zoom-in duration-200">
            <Check size={14} weight="bold" className="text-primary-foreground" />
          </div>
        )}
      </div>
    </button>
  )
}
