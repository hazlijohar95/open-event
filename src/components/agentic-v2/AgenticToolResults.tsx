import { memo } from 'react'
import { CheckCircle, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { AgenticToolResultsProps } from './types'

export const AgenticToolResults = memo(function AgenticToolResults({
  results,
}: AgenticToolResultsProps) {
  if (results.length === 0) return null

  return (
    <div className="ml-12 space-y-2">
      {results.map((result, i) => (
        <div
          key={`${result.toolCallId}-${i}`}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
            result.success
              ? 'bg-muted text-foreground'
              : 'bg-red-500/5 text-red-600 dark:text-red-400'
          )}
        >
          {result.success ? (
            <CheckCircle size={14} className="text-muted-foreground" />
          ) : (
            <X size={14} />
          )}
          <span className="text-muted-foreground">{result.summary}</span>
        </div>
      ))}
    </div>
  )
})
