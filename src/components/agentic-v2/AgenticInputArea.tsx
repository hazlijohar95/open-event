import React, { memo, useCallback, forwardRef } from 'react'
import { PaperPlaneTilt, Microphone, CircleNotch } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface AgenticInputAreaProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled: boolean
  placeholder: string
  isLoading: boolean
  showKeyboardHint?: boolean
}

export const AgenticInputArea = memo(
  forwardRef<HTMLTextAreaElement, AgenticInputAreaProps>(function AgenticInputArea(
    {
      value,
      onChange,
      onSubmit,
      disabled,
      placeholder,
      isLoading,
      showKeyboardHint = false,
    },
    ref
  ) {
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          if (value.trim() && !disabled) {
            onSubmit()
          }
        }
      },
      [value, disabled, onSubmit]
    )

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value)
      },
      [onChange]
    )

    const handleSubmitClick = useCallback(() => {
      if (value.trim() && !disabled) {
        onSubmit()
      }
    }, [value, disabled, onSubmit])

    const isReady = value.trim() && !isLoading && !disabled

    return (
      <div className="agentic-input-area-fixed">
        <div className="agentic-input-v2">
          <div className="agentic-input-v2-wrapper">
            <div className="agentic-input-v2-inner">
              <textarea
                ref={ref}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="agentic-input-v2-textarea"
              />
              <div className="agentic-input-v2-footer">
                <div className="agentic-input-v2-actions">
                  <button
                    className="agentic-input-v2-btn"
                    title="Voice input (coming soon)"
                    disabled
                  >
                    <Microphone size={18} weight="duotone" />
                  </button>
                </div>
                <button
                  onClick={handleSubmitClick}
                  disabled={!value.trim() || disabled}
                  className={cn(
                    'agentic-input-v2-send',
                    isReady && 'is-ready'
                  )}
                >
                  {isLoading ? (
                    <CircleNotch size={18} weight="bold" className="animate-spin" />
                  ) : (
                    <PaperPlaneTilt size={18} weight="fill" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard hint - only when empty */}
        {showKeyboardHint && (
          <p className="text-center text-xs text-muted-foreground/40 mt-3">
            <kbd className="px-1.5 py-0.5 rounded bg-muted/30 font-mono text-[10px]">
              Enter
            </kbd>{' '}
            to send
          </p>
        )}
      </div>
    )
  })
)
