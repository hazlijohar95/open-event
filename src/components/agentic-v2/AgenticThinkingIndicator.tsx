import { memo } from 'react'
import { ThinkingOrb } from './AgenticAvatar'
import { AgenticToolList } from './AgenticTool'
import type { AgenticThinkingIndicatorProps } from './types'

export const AgenticThinkingIndicator = memo(function AgenticThinkingIndicator({
  activity,
  executingTools,
}: AgenticThinkingIndicatorProps) {
  if (!activity && executingTools.length === 0) return null

  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 flex items-center justify-center">
        <ThinkingOrb />
      </div>
      <div className="agentic-thinking-v2 flex-1">
        <div className="agentic-thinking-v2-content">
          <div className="agentic-thinking-v2-label">
            <span>{activity || 'Processing'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse ml-2" />
          </div>
          {executingTools.length > 0 && (
            <div className="mt-3">
              <AgenticToolList tools={executingTools} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
