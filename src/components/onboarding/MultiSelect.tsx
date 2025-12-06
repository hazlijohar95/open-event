import { Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  columns?: 2 | 3
}

export function MultiSelect({
  options,
  selected,
  onChange,
  columns = 2,
}: MultiSelectProps) {
  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div
      className={cn(
        'grid gap-3',
        columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
      )}
    >
      {options.map((option, index) => {
        const isSelected = selected.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleOption(option.value)}
            className={cn(
              'relative px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer',
              'hover:scale-[1.02] active:scale-[0.98]',
              'animate-in fade-in slide-in-from-bottom-2',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50'
            )}
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'backwards',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={cn('font-medium', isSelected && 'text-primary')}>
                {option.label}
              </span>
              <div
                className={cn(
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30'
                )}
              >
                {isSelected && (
                  <Check
                    size={12}
                    weight="bold"
                    className="text-primary-foreground animate-in zoom-in duration-150"
                  />
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
