import React, { useState, useCallback, useRef, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConvexAuth, useQuery } from 'convex/react'
import { useAuthToken } from '@convex-dev/auth/react'
import { api } from '../../../convex/_generated/api'
import {
  PaperPlaneTilt,
  Microphone,
  CircleNotch,
  Lightning,
  CheckCircle,
  X,
  Trash,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// V2 Components
import { AgenticAvatar, ThinkingOrb } from './AgenticAvatar'
import { AgenticMessage } from './AgenticMessage'
import { AgenticToolList, type ToolCall, type ToolResult, type ToolStatus } from './AgenticTool'
import { AgenticConfirmation } from './AgenticConfirmation'

// ============================================================================
// Types
// ============================================================================

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  toolCalls?: ToolCall[]
}

interface AgenticChatV2Props {
  title?: string
  subtitle?: string
  placeholder?: string
  suggestions?: Array<{
    label: string
    prompt: string
    icon?: ReactNode
  }>
  quickActions?: Array<{
    label: string
    icon?: ReactNode
    onClick: () => void
  }>
  onComplete?: (entityId: string) => void
  className?: string
}

// LocalStorage key for persisting messages
const STORAGE_KEY = 'open-event-agentic-chat-v2'

// Tool display config
const toolDisplayNames: Record<string, string> = {
  searchVendors: 'Searching vendors',
  searchSponsors: 'Searching sponsors',
  getRecommendedVendors: 'Finding best vendors',
  getRecommendedSponsors: 'Finding sponsors',
  createEvent: 'Creating your event',
  updateEvent: 'Updating event',
  getEventDetails: 'Loading event details',
  getUpcomingEvents: 'Loading events',
  getUserProfile: 'Loading profile',
  addVendorToEvent: 'Adding vendor',
  addSponsorToEvent: 'Adding sponsor',
}

// ============================================================================
// Main Component
// ============================================================================

export function AgenticChatV2({
  title: _title = 'Open Event AI',
  subtitle = 'What would you like to create?',
  placeholder = 'Describe your event idea...',
  suggestions: _suggestions = [
    { label: 'Tech Conference', prompt: 'I want to create a tech conference for 200 developers in San Francisco next month' },
    { label: 'Product Launch', prompt: 'Help me plan a product launch event with press coverage and demo stations' },
    { label: 'Company Retreat', prompt: 'I need to organize a company retreat for 50 people with team building activities' },
  ],
  quickActions: _quickActions,
  onComplete,
  className,
}: AgenticChatV2Props) {
  const navigate = useNavigate()
  const { isAuthenticated } = useConvexAuth()
  const authToken = useAuthToken()

  // AI Usage/Rate limit
  const aiUsage = useQuery(api.aiUsage.getMyUsage)
  const [localRemaining, setLocalRemaining] = useState<number | null>(null)

  // Use local state if available, otherwise use query result
  const promptsRemaining = localRemaining ?? aiUsage?.promptsRemaining ?? 5
  const promptsLimit = aiUsage?.dailyLimit ?? 5
  const isRateLimited = promptsRemaining <= 0
  const isAdmin = aiUsage?.isAdmin ?? false
  const timeUntilReset = aiUsage?.timeUntilReset?.formatted ?? ''

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      // Ignore
    }
    return []
  })
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentActivity, setCurrentActivity] = useState<string | null>(null)
  const [pendingConfirmation, setPendingConfirmation] = useState<ToolCall | null>(null)
  const [executingTools, setExecutingTools] = useState<Array<{ id: string; name: string; status: ToolStatus }>>([])
  const [toolResults, setToolResults] = useState<ToolResult[]>([])
  const [confirmedToolCalls, setConfirmedToolCalls] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)

  // Refs
  const conversationRef = useRef<HTMLDivElement>(null)
  const conversationAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string

  const hasMessages = messages.length > 0

  // Persist messages
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  // Smooth scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollArea = conversationAreaRef.current
    if (scrollArea) {
      // Use requestAnimationFrame for smoother scroll timing
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollArea.scrollTo({
            top: scrollArea.scrollHeight,
            behavior: 'smooth'
          })
        })
      })
    }
  }, [messages, currentActivity, executingTools, isStreaming])

  // Focus input on mount and scroll to bottom if there are persisted messages
  useEffect(() => {
    inputRef.current?.focus()
    // Scroll to bottom immediately for persisted messages
    if (conversationAreaRef.current && messages.length > 0) {
      conversationAreaRef.current.scrollTop = conversationAreaRef.current.scrollHeight
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Clear chat
  const handleClearChat = useCallback(() => {
    setMessages([])
    localStorage.removeItem(STORAGE_KEY)
    setCurrentActivity(null)
    setExecutingTools([])
    setToolResults([])
    setPendingConfirmation(null)
    setConfirmedToolCalls([])
    setIsComplete(false)
    toast.info('Chat cleared')
  }, [])

  // Send message
  const handleSend = useCallback(async (userMessage: string) => {
    if (isLoading || !isAuthenticated || !authToken || !userMessage.trim()) return

    // Check rate limit before sending
    if (isRateLimited && !isAdmin) {
      toast.error(`Daily limit reached. Resets in ${timeUntilReset || 'a few hours'}.`, {
        action: {
          label: 'View Usage',
          onClick: () => navigate('/dashboard/settings'),
        },
      })
      return
    }

    setInputValue('')
    setIsLoading(true)
    setIsStreaming(false)
    setCurrentActivity('Thinking')
    setExecutingTools([])
    setToolResults([])
    setPendingConfirmation(null)
    setIsComplete(false)

    const userMsgId = `user-${Date.now()}`
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    }

    const updatedMessages = [...messages, newUserMessage]
    setMessages(updatedMessages)

    abortControllerRef.current = new AbortController()

    try {
      const httpUrl = convexUrl.replace('.convex.cloud', '.convex.site')

      const response = await fetch(`${httpUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          userMessage,
          confirmedToolCalls,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)

        // Handle rate limit specifically
        if (response.status === 429) {
          setLocalRemaining(0)
          throw new Error(errorData?.message || 'Daily limit reached. Please try again tomorrow.')
        }

        throw new Error(errorData?.error || errorData?.message || `HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      const assistantMsgId = `assistant-${Date.now()}`
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      }])
      setIsStreaming(true)
      setCurrentActivity(null)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        let currentEvent = ''
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7)
          } else if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const parsed = JSON.parse(data)

              switch (currentEvent) {
                case 'text': {
                  const textData = parsed as { content: string }
                  fullContent += textData.content
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === assistantMsgId ? { ...m, content: fullContent } : m
                    )
                  )
                  break
                }

                case 'tool_start': {
                  const toolData = parsed as ToolCall
                  setExecutingTools(prev => [...prev, { id: toolData.id, name: toolData.name, status: 'executing' }])
                  setCurrentActivity(toolDisplayNames[toolData.name] || `Running ${toolData.name}`)
                  break
                }

                case 'tool_pending': {
                  const toolData = parsed as ToolCall
                  setPendingConfirmation(toolData)
                  setExecutingTools(prev => prev.filter(t => t.id !== toolData.id))
                  setCurrentActivity(null)
                  setIsLoading(false)
                  setIsStreaming(false)
                  break
                }

                case 'tool_result': {
                  const resultData = parsed as ToolResult & { id: string; name: string }
                  const result: ToolResult = {
                    toolCallId: resultData.id,
                    name: resultData.name,
                    success: resultData.success,
                    summary: resultData.summary,
                    data: resultData.data,
                    error: resultData.error,
                  }
                  setToolResults(prev => [...prev, result])
                  setExecutingTools(prev => prev.map(t =>
                    t.id === resultData.id
                      ? { ...t, status: result.success ? 'success' : 'error' as ToolStatus }
                      : t
                  ))
                  setCurrentActivity(null)
                  break
                }

                case 'done': {
                  const doneData = parsed as {
                    message: string
                    toolCalls: ToolCall[]
                    toolResults: ToolResult[]
                    pendingConfirmations: ToolCall[]
                    isComplete: boolean
                    entityId?: string
                    rateLimit?: { remaining: number; limit: number }
                  }

                  // Update local remaining count
                  if (doneData.rateLimit) {
                    setLocalRemaining(doneData.rateLimit.remaining)
                  }

                  if (doneData.isComplete && doneData.entityId) {
                    setIsComplete(true)
                    toast.success('Event created successfully!')
                    setTimeout(() => {
                      if (onComplete) {
                        onComplete(doneData.entityId!)
                      } else {
                        navigate(`/dashboard/events/${doneData.entityId}`)
                      }
                    }, 1500)
                  }

                  if (doneData.pendingConfirmations.length > 0) {
                    setPendingConfirmation(doneData.pendingConfirmations[0])
                    setIsLoading(false)
                    setIsStreaming(false)
                  }
                  break
                }

                case 'error': {
                  const errorData = parsed as { message: string }
                  throw new Error(errorData.message)
                }
              }
            } catch (parseError) {
              if (parseError instanceof Error && parseError.message !== 'Unexpected end of JSON input') {
                throw parseError
              }
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setMessages(prev => prev.filter(m => m.id !== userMsgId))
      } else {
        const error = err instanceof Error ? err : new Error('Unknown error')
        if (error.message.includes('rate limit')) {
          toast.error('Too many requests. Please wait a moment.')
        } else if (error.message.includes('API key') || error.message.includes('OPENAI')) {
          toast.error('AI service unavailable. Please check configuration.')
        } else if (error.message.includes('Unauthorized')) {
          toast.error('Please sign in to use the AI assistant.')
        } else {
          toast.error('Something went wrong. Please try again.')
        }
      }
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setCurrentActivity(null)
      abortControllerRef.current = null
      // Refocus input after sending
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [messages, isLoading, isAuthenticated, authToken, convexUrl, confirmedToolCalls, navigate, onComplete, isRateLimited, isAdmin, timeUntilReset])

  // Confirm tool
  const handleConfirm = useCallback(async () => {
    if (!pendingConfirmation || !authToken) return

    setIsLoading(true)
    setExecutingTools([{ id: pendingConfirmation.id, name: pendingConfirmation.name, status: 'executing' }])
    setCurrentActivity(toolDisplayNames[pendingConfirmation.name] || 'Executing')

    try {
      const httpUrl = convexUrl.replace('.convex.cloud', '.convex.site')

      const response = await fetch(`${httpUrl}/api/chat/execute-tool`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          toolName: pendingConfirmation.name,
          toolArguments: pendingConfirmation.arguments,
        }),
      })

      const result = await response.json() as ToolResult & { data?: { eventId?: string } }

      setExecutingTools(prev => prev.map(t => ({
        ...t,
        status: result.success ? 'success' : 'error' as ToolStatus,
      })))

      setToolResults([{
        toolCallId: result.toolCallId || pendingConfirmation.id,
        name: result.name || pendingConfirmation.name,
        success: result.success,
        summary: result.summary,
        data: result.data,
        error: result.error,
      }])

      if (result.success) {
        toast.success(result.summary)

        if (pendingConfirmation.name === 'createEvent' && result.data?.eventId) {
          setIsComplete(true)

          const confirmationMsgId = `assistant-confirm-${Date.now()}`
          setMessages(prev => [...prev, {
            id: confirmationMsgId,
            role: 'assistant',
            content: `I've successfully created your event. ${result.summary}`,
            timestamp: Date.now(),
          }])

          setTimeout(() => {
            if (onComplete) {
              onComplete(result.data!.eventId!)
            } else {
              navigate(`/dashboard/events/${result.data!.eventId}`)
            }
          }, 1500)
        }
      } else {
        toast.error(result.error || 'Action failed')
      }

      setPendingConfirmation(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to confirm action'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
      setCurrentActivity(null)
    }
  }, [pendingConfirmation, authToken, convexUrl, navigate, onComplete])

  // Cancel tool
  const handleCancel = useCallback(() => {
    setPendingConfirmation(null)
    toast.info('Action cancelled')
  }, [])

  // Handle input submit
  const handleSubmit = useCallback(() => {
    if (inputValue.trim()) {
      handleSend(inputValue.trim())
    }
  }, [inputValue, handleSend])

  // Handle key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  // Get confirmation quick replies
  const getQuickReplies = (msg: ChatMessage, isLastMessage: boolean) => {
    if (!isLastMessage || msg.role === 'user' || isStreaming || isLoading) return undefined

    const confirmationPatterns = [
      /shall i proceed/i,
      /would you like me to (create|proceed|continue)/i,
      /ready to create/i,
      /do you want me to/i,
      /should i (create|proceed|go ahead)/i,
      /can i (create|proceed)/i,
      /let me know if you('d| would) like/i,
    ]

    const messageAsksForConfirmation = confirmationPatterns.some(pattern => pattern.test(msg.content))

    if (pendingConfirmation || messageAsksForConfirmation) {
      return [
        { label: 'Yes, create it', value: 'yes', variant: 'primary' as const },
        { label: 'Make changes', value: 'changes', variant: 'secondary' as const },
        { label: 'Cancel', value: 'cancel', variant: 'secondary' as const },
      ]
    }

    return undefined
  }

  // Handle quick reply
  const handleQuickReply = (value: string) => {
    if (value === 'yes') {
      if (pendingConfirmation) {
        handleConfirm()
      } else {
        handleSend('Yes, please create the event.')
      }
    } else if (value === 'cancel') {
      if (pendingConfirmation) {
        handleCancel()
      } else {
        handleSend("Cancel, I don't want to create this event.")
      }
    } else if (value === 'changes') {
      handleSend("I'd like to make some changes to the event details.")
    }
  }

  return (
    <div className={cn('agentic-chat-container', className)}>
      {/* Main Layout */}
      <div className={cn(
        'agentic-chat-layout',
        hasMessages ? 'has-messages' : 'is-empty'
      )}>
        {/* Header - Clean, minimal */}
        <div className="agentic-header">
          <div className="flex items-center justify-center gap-2">
            {/* Logo */}
            <div className="flex items-center gap-1">
              <span className="font-mono text-sm font-semibold">
                <span className="text-foreground">open</span>
                <span className="text-muted-foreground">-</span>
                <span className="text-foreground">event</span>
              </span>
              <span className="text-muted-foreground text-sm font-medium ml-1">AI</span>
            </div>
            {/* Beta badge */}
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium text-muted-foreground bg-muted">
              Beta
            </span>
            {/* Quota indicator - subtle */}
            {isAuthenticated && !isAdmin && (
              <button
                onClick={() => navigate('/dashboard/settings')}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                title={`${promptsRemaining} prompts remaining. Resets in ${timeUntilReset}`}
              >
                <span className="tabular-nums">
                  {promptsRemaining}/{promptsLimit}
                </span>
              </button>
            )}
            {isAuthenticated && isAdmin && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] text-muted-foreground">
                <Lightning size={10} weight="fill" />
                Unlimited
              </span>
            )}
            {/* Clear button - in header when there are messages */}
            {hasMessages && (
              <>
                <span className="text-border mx-1">·</span>
                <button
                  onClick={handleClearChat}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
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
              Resets in <span className="font-medium text-foreground">{timeUntilReset || 'a few hours'}</span>
            </p>
          )}
        </div>

        {/* Conversation Area - Only shown when there are messages */}
        {hasMessages && (
          <div className="agentic-conversation-area" ref={conversationAreaRef}>
            <div className="agentic-conversation" ref={conversationRef}>
              {/* Messages */}
              <div className="agentic-conversation-messages">
                {messages.map((msg, i) => {
                  const isLastMessage = i === messages.length - 1
                  return (
                    <AgenticMessage
                      key={msg.id}
                      role={msg.role}
                      content={msg.content}
                      isStreaming={isStreaming}
                      isLatest={isLastMessage}
                      timestamp={msg.timestamp}
                      quickReplies={getQuickReplies(msg, isLastMessage)}
                      onQuickReply={handleQuickReply}
                    />
                  )
                })}

                {/* Tool Results - subtle */}
                {toolResults.length > 0 && (
                  <div className="ml-12 space-y-2">
                    {toolResults.map((result, i) => (
                      <div
                        key={`${result.toolCallId}-${i}`}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                          result.success
                            ? 'bg-muted text-foreground'
                            : 'bg-red-500/5 text-red-600 dark:text-red-400'
                        )}
                      >
                        {result.success ? <CheckCircle size={14} className="text-muted-foreground" /> : <X size={14} />}
                        <span className="text-muted-foreground">{result.summary}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pending Confirmation */}
                {pendingConfirmation && (
                  <div className="flex gap-3">
                    <AgenticAvatar isStreaming={false} />
                    <div className="flex-1 max-w-[85%]">
                      <AgenticConfirmation
                        toolCall={pendingConfirmation}
                        onConfirm={handleConfirm}
                        onCancel={handleCancel}
                        isLoading={isLoading}
                      />
                    </div>
                  </div>
                )}

                {/* Thinking Indicator */}
                {(currentActivity || executingTools.length > 0) && !pendingConfirmation && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 flex items-center justify-center">
                      <ThinkingOrb />
                    </div>
                    <div className="agentic-thinking-v2 flex-1">
                      <div className="agentic-thinking-v2-content">
                        <div className="agentic-thinking-v2-label">
                          <span>{currentActivity || 'Processing'}</span>
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
                )}

                {/* Success State - calm */}
                {isComplete && (
                  <div className="flex gap-3 items-center agentic-message">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted">
                      <CheckCircle size={16} className="text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Event created. Redirecting...
                    </span>
                  </div>
                )}

                {/* Scroll anchor - always at the end */}
                <div ref={messagesEndRef} className="h-px w-full flex-shrink-0" aria-hidden="true" />
              </div>
            </div>
          </div>
        )}

        {/* Input Area - Always visible at bottom */}
        <div className="agentic-input-area-fixed">
          <div className="agentic-input-v2">
            <div className="agentic-input-v2-wrapper">
              <div className="agentic-input-v2-inner">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isRateLimited && !isAdmin
                      ? `Daily limit reached. Resets in ${timeUntilReset || 'a few hours'}`
                      : placeholder
                  }
                  disabled={isLoading || !!pendingConfirmation || (isRateLimited && !isAdmin)}
                  className="agentic-input-v2-textarea"
                />
                <div className="agentic-input-v2-footer">
                  <div className="agentic-input-v2-actions">
                    <button className="agentic-input-v2-btn" title="Voice input (coming soon)" disabled>
                      <Microphone size={18} weight="duotone" />
                    </button>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!inputValue.trim() || isLoading || !!pendingConfirmation || (isRateLimited && !isAdmin)}
                    className={cn(
                      'agentic-input-v2-send',
                      inputValue.trim() && !isLoading && (!isRateLimited || isAdmin) && 'is-ready'
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
          {!hasMessages && (
            <p className="text-center text-xs text-muted-foreground/40 mt-3">
              <kbd className="px-1.5 py-0.5 rounded bg-muted/30 font-mono text-[10px]">Enter</kbd>
              {' '}to send
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AgenticChatV2
