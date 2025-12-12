import { memo } from 'react'
import { Lightning, Trash } from '@phosphor-icons/react'
import { LogoIcon } from '@/components/ui/logo'
import type { AgenticHeaderProps } from './types'

export const AgenticHeader = memo(function AgenticHeader({
  hasMessages,
  isRateLimited,
  isAdmin,
  promptsRemaining,
  promptsLimit,
  timeUntilReset,
  subtitle,
  onClear,
  onNavigateToSettings,
}: AgenticHeaderProps) {
  const quotaPercentage = promptsLimit > 0 ? (promptsRemaining / promptsLimit) : 0
  const circumference = 2 * Math.PI * 6 // r=6

  return (
    <div className="agentic-header">
      <div className="flex items-center justify-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <LogoIcon size="sm" />
          <span className="font-mono text-sm font-semibold">
            <span className="text-foreground">open</span>
            <span className="text-purple-500">-</span>
            <span className="text-foreground">event</span>
          </span>
          <span className="text-purple-500 text-sm font-medium">AI</span>
        </div>

        {/* Beta badge with gradient */}
        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          Beta
        </span>

        {/* Quota with progress ring */}
        {!isAdmin && (
          <button
            onClick={onNavigateToSettings}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted transition-colors group"
            title={`${promptsRemaining} prompts remaining. Resets in ${timeUntilReset}`}
          >
            <div className="relative w-4 h-4">
              <svg className="w-4 h-4 -rotate-90" viewBox="0 0 16 16">
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted-foreground/20"
                />
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-purple-500 transition-all"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - quotaPercentage)}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-[11px] font-medium tabular-nums text-muted-foreground group-hover:text-foreground transition-colors">
              {promptsRemaining}/{promptsLimit}
            </span>
          </button>
        )}

        {isAdmin && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Lightning size={12} weight="fill" />
            Unlimited
          </span>
        )}

        {/* Clear button with hover effect */}
        {hasMessages && (
          <>
            <span className="text-border/50 mx-0.5">·</span>
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
              title="Clear conversation"
            >
              <Trash size={12} />
              <span>Clear</span>
            </button>
          </>
        )}
      </div>

      {!hasMessages && (
        <h1 className="font-medium tracking-tight text-xl sm:text-2xl mt-4 text-foreground">
          {isRateLimited ? 'Daily limit reached' : subtitle}
        </h1>
      )}

      {isRateLimited && !isAdmin && !hasMessages && (
        <p className="text-sm text-muted-foreground mt-2">
          Resets in{' '}
          <span className="font-medium text-foreground">
            {timeUntilReset || 'a few hours'}
          </span>
        </p>
      )}
    </div>
  )
})
