import { Code, Calendar } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Audience } from '@/hooks/use-audience-toggle'

interface AudienceToggleProps {
  value: Audience
  onChange: (value: Audience) => void
}

export function AudienceToggle({ value, onChange }: AudienceToggleProps) {
  const isDeveloper = value === 'developer'

  return (
    <div
      className="inline-flex rounded-full border border-border p-1 bg-muted/50"
      role="tablist"
      aria-label="Select audience type"
    >
      <button
        role="tab"
        aria-selected={isDeveloper}
        onClick={() => onChange('developer')}
        className={cn(
          'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer',
          isDeveloper
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Code size={14} weight="duotone" />
        Developers
      </button>
      <button
        role="tab"
        aria-selected={!isDeveloper}
        onClick={() => onChange('organizer')}
        className={cn(
          'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer',
          !isDeveloper
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Calendar size={14} weight="duotone" />
        Organizers
      </button>
    </div>
  )
}
