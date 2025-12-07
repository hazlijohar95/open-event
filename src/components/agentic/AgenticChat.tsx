import React, { useState, useCallback, useRef, useEffect, type ReactNode, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConvexAuth } from 'convex/react'
import { useAuthToken } from '@convex-dev/auth/react'
import {
  Sparkle,
  PaperPlaneTilt,
  Microphone,
  CircleNotch,
  ArrowRight,
  Check,
  X,
  Copy,
  CheckCircle,
  CaretUp,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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

interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

interface ToolResult {
  toolCallId: string
  name: string
  success: boolean
  data?: unknown
  error?: string
  summary: string
}

interface AgenticChatProps {
  title?: string
  subtitle?: string
  placeholder?: string
  suggestions?: Array<{
    label: string
    prompt: string
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
const STORAGE_KEY = 'open-event-agentic-chat'

// Tool display names
const toolDisplayNames: Record<string, string> = {
  searchVendors: 'Searching vendors...',
  searchSponsors: 'Searching sponsors...',
  getRecommendedVendors: 'Finding best vendors...',
  getRecommendedSponsors: 'Finding sponsors...',
  createEvent: 'Creating your event...',
  updateEvent: 'Updating event...',
  getEventDetails: 'Loading event details...',
  getUpcomingEvents: 'Loading events...',
  getUserProfile: 'Loading profile...',
  addVendorToEvent: 'Adding vendor...',
  addSponsorToEvent: 'Adding sponsor...',
}

// ============================================================================
// Rich Content Renderer - Handles markdown-like formatting
// ============================================================================

function RichContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  // Parse content for rich elements
  const renderContent = () => {
    if (!content) return <span className="text-muted-foreground">...</span>

    // Split by code blocks first
    const parts = content.split(/(```[\s\S]*?```)/g)

    return parts.map((part, i) => {
      // Code block
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).split('\n')
        const language = lines[0] || 'text'
        const code = lines.slice(1).join('\n')

        return (
          <div key={i} className="my-3 rounded-xl overflow-hidden border border-border/50 bg-zinc-950">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-border/50">
              <span className="text-xs text-zinc-400 font-mono">{language}</span>
              <button
                onClick={() => handleCopy(code)}
                className="p-1 rounded hover:bg-zinc-800 transition-colors"
              >
                {copied ? (
                  <CheckCircle size={14} className="text-green-400" />
                ) : (
                  <Copy size={14} className="text-zinc-400" />
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm">
              <code className="text-zinc-100 font-mono">{code}</code>
            </pre>
          </div>
        )
      }

      // Regular text with inline formatting
      return (
        <span key={i}>
          {part.split('\n').map((line, j, arr) => (
            <span key={j}>
              {renderInlineFormatting(line)}
              {j < arr.length - 1 && <br />}
            </span>
          ))}
        </span>
      )
    })
  }

  const renderInlineFormatting = (text: string) => {
    // Bold **text**
    let result: (string | React.ReactElement)[] = [text]

    // Process bold
    result = result.flatMap((part, i) => {
      if (typeof part !== 'string') return part
      const boldParts = part.split(/\*\*(.*?)\*\*/g)
      return boldParts.map((p, j) =>
        j % 2 === 1 ? <strong key={`bold-${i}-${j}`} className="font-semibold">{p}</strong> : p
      )
    })

    // Process inline code
    result = result.flatMap((part, i) => {
      if (typeof part !== 'string') return part
      const codeParts = part.split(/`([^`]+)`/g)
      return codeParts.map((p, j) =>
        j % 2 === 1 ? (
          <code key={`code-${i}-${j}`} className="px-1.5 py-0.5 rounded bg-muted font-mono text-[0.9em]">
            {p}
          </code>
        ) : p
      )
    })

    // Process bullet points
    result = result.flatMap((part, i) => {
      if (typeof part !== 'string') return part
      if (part.startsWith('- ') || part.startsWith('• ')) {
        return (
          <span key={`bullet-${i}`} className="flex items-start gap-2">
            <span className="text-primary mt-1.5">•</span>
            <span>{part.slice(2)}</span>
          </span>
        )
      }
      return part
    })

    return result
  }

  return (
    <div className="text-sm leading-relaxed">
      {renderContent()}
      {isStreaming && <span className="streaming-cursor" />}
    </div>
  )
}

// ============================================================================
// Message Component with smooth animations
// ============================================================================

interface MessageBubbleProps {
  message: ChatMessage
  isLatest: boolean
  isStreaming: boolean
  index: number
  quickReplies?: Array<{
    label: string
    value: string
    variant?: 'primary' | 'secondary'
  }>
  onQuickReply?: (value: string) => void
}

function MessageBubble({ message, isLatest, isStreaming, index, quickReplies, onQuickReply }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const showStreaming = isStreaming && isLatest && !isUser
  const showQuickReplies = isLatest && !isUser && !isStreaming && quickReplies && quickReplies.length > 0

  return (
    <div
      className={cn(
        'flex gap-3 agentic-message',
        isUser && 'flex-row-reverse'
      )}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          'transition-all duration-300',
          isUser
            ? 'bg-foreground text-background'
            : 'bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary border border-primary/20',
          showStreaming && 'avatar-streaming'
        )}
      >
        {isUser ? (
          <span className="text-[10px] font-bold tracking-tight">YOU</span>
        ) : (
          <Sparkle size={14} weight="duotone" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex flex-col gap-2 max-w-[85%]">
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            'transition-all duration-300',
            isUser
              ? 'bg-foreground text-background rounded-tr-sm'
              : 'bg-card border border-border/50 rounded-tl-sm shadow-sm'
          )}
        >
          {isUser ? (
            <p className="text-sm">{message.content}</p>
          ) : (
            <RichContent content={message.content} isStreaming={showStreaming} />
          )}
        </div>

        {/* Quick Reply Buttons */}
        {showQuickReplies && (
          <div className="flex flex-wrap gap-2 quick-replies">
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => onQuickReply?.(reply.value)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium',
                  'transition-all duration-200 hover:-translate-y-0.5',
                  'quick-reply-btn',
                  reply.variant === 'primary'
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                    : 'bg-card border border-border/50 hover:border-primary/30 hover:bg-muted/50'
                )}
                style={{ animationDelay: `${i * 75}ms` }}
              >
                {reply.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Inline Confirmation Card - Beautiful event preview
// ============================================================================

interface ConfirmationCardProps {
  toolCall: ToolCall
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

function ConfirmationCard({ toolCall, onConfirm, onCancel, isLoading }: ConfirmationCardProps) {
  const args = toolCall.arguments as Record<string, unknown>

  // Format the tool name nicely
  const getActionTitle = () => {
    switch (toolCall.name) {
      case 'createEvent':
        return 'Create Event'
      case 'updateEvent':
        return 'Update Event'
      case 'addVendorToEvent':
        return 'Add Vendor'
      case 'addSponsorToEvent':
        return 'Add Sponsor'
      default:
        return toolCall.name.replace(/([A-Z])/g, ' $1').trim()
    }
  }

  // Render event preview for createEvent
  const renderEventPreview = () => {
    const title = args.title as string
    const eventType = args.eventType as string
    const startDate = args.startDate as string
    const startTime = args.startTime as string
    const locationType = args.locationType as string
    const venueName = args.venueName as string
    const expectedAttendees = args.expectedAttendees as number
    const budget = args.budget as number

    return (
      <div className="space-y-3">
        {/* Event Title */}
        <div>
          <h4 className="font-semibold text-base">{title}</h4>
          {eventType && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary capitalize">
              {eventType}
            </span>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {startDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{startDate}{startTime ? ` at ${startTime}` : ''}</span>
            </div>
          )}
          {locationType && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="capitalize">{venueName || locationType}</span>
            </div>
          )}
          {expectedAttendees && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{expectedAttendees.toLocaleString()} attendees</span>
            </div>
          )}
          {budget && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>${budget.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render generic preview for other tools
  const renderGenericPreview = () => {
    const entries = Object.entries(args).filter(([, v]) => v !== undefined && v !== null)
    if (entries.length === 0) return null

    return (
      <div className="space-y-1.5 text-sm">
        {entries.slice(0, 4).map(([key, value]) => (
          <div key={key} className="flex items-start gap-2">
            <span className="text-muted-foreground min-w-[80px] capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}:
            </span>
            <span className="font-medium truncate">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
        {entries.length > 4 && (
          <div className="text-xs text-muted-foreground">
            +{entries.length - 4} more fields
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex gap-3 agentic-message agentic-confirmation-inline">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary border border-primary/20">
        <Sparkle size={14} weight="duotone" />
      </div>

      {/* Confirmation Content */}
      <div className="flex-1 max-w-[85%]">
        {/* Card */}
        <div className="rounded-2xl rounded-tl-sm overflow-hidden border border-border/50 bg-card shadow-sm">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Check size={12} weight="bold" className="text-primary" />
              </div>
              <span className="text-sm font-medium">Ready to {getActionTitle()}</span>
            </div>
          </div>

          {/* Preview Content */}
          <div className="px-4 py-3">
            {toolCall.name === 'createEvent' ? renderEventPreview() : renderGenericPreview()}
          </div>

          {/* Actions */}
          <div className="px-4 py-3 border-t border-border/50 bg-muted/30 flex items-center gap-2">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90 active:scale-[0.98]',
                'transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <CircleNotch size={14} weight="bold" className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check size={14} weight="bold" />
                  Confirm & Create
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className={cn(
                'px-4 py-2.5 rounded-xl text-sm font-medium',
                'bg-muted/50 hover:bg-muted text-muted-foreground',
                'transition-all duration-200 disabled:opacity-50'
              )}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function AgenticChat({
  title = 'Open Event AI',
  subtitle = 'What would you like to create?',
  placeholder = 'Type or paste your event details...',
  suggestions = [
    { label: 'Tech Conference', prompt: 'I want to create a tech conference for 200 developers in San Francisco next month' },
    { label: 'Product Launch', prompt: 'Help me plan a product launch event with press coverage and demo stations' },
    { label: 'Company Retreat', prompt: 'I need to organize a company retreat for 50 people with team building activities' },
  ],
  quickActions,
  onComplete,
  className,
}: AgenticChatProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useConvexAuth()
  const authToken = useAuthToken()

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
  const [executingTools, setExecutingTools] = useState<ToolCall[]>([])
  const [toolResults, setToolResults] = useState<ToolResult[]>([])
  const [confirmedToolCalls, setConfirmedToolCalls] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)

  // Animation state for smooth layout transitions
  const [conversationHeight, setConversationHeight] = useState(0)
  const [isExpanded, setIsExpanded] = useState(true)
  const conversationRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string

  const hasMessages = messages.length > 0

  // Persist messages
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  // Measure conversation height for smooth animation
  useLayoutEffect(() => {
    if (conversationRef.current && hasMessages) {
      const height = conversationRef.current.scrollHeight
      setConversationHeight(Math.min(height, 400)) // Max 400px
    }
  }, [messages, hasMessages])

  // Smooth scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, currentActivity])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Clear chat
  const handleClearChat = useCallback(() => {
    setMessages([])
    setConversationHeight(0)
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

    setInputValue('')
    setIsLoading(true)
    setIsStreaming(false)
    setCurrentActivity('Thinking...')
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
        const errorText = await response.text()
        throw new Error(errorText || `HTTP error! status: ${response.status}`)
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
                  setExecutingTools(prev => [...prev, toolData])
                  setCurrentActivity(toolDisplayNames[toolData.name] || `Running ${toolData.name}...`)
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
                  setExecutingTools(prev => prev.filter(t => t.id !== resultData.id))
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
    }
  }, [messages, isLoading, isAuthenticated, authToken, convexUrl, confirmedToolCalls, navigate, onComplete])

  // Confirm tool - execute directly via dedicated endpoint
  const handleConfirm = useCallback(async () => {
    if (!pendingConfirmation || !authToken) return

    setIsLoading(true)
    setExecutingTools([pendingConfirmation])
    setCurrentActivity(toolDisplayNames[pendingConfirmation.name] || 'Executing...')

    try {
      const httpUrl = convexUrl.replace('.convex.cloud', '.convex.site')

      // Execute the tool directly via the execute-tool endpoint
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

      // Update tool results
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

        // Check if event was created
        if (pendingConfirmation.name === 'createEvent' && result.data?.eventId) {
          setIsComplete(true)

          // Add a confirmation message to the chat
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
      setExecutingTools([])
      setCurrentActivity(null)
    }
  }, [pendingConfirmation, authToken, convexUrl, navigate, onComplete, setMessages])

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

  return (
    <div className={cn('agentic-chat-container', className)}>
      {/* Main Content - Uses CSS Grid for stable layout */}
      <div className="agentic-chat-layout">
        {/* Header */}
        <div className="agentic-header">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <h1 className={cn(
            'font-semibold tracking-tight transition-all duration-500',
            hasMessages ? 'text-xl' : 'text-2xl sm:text-3xl'
          )}>
            {hasMessages ? 'Continue your conversation' : subtitle}
          </h1>
        </div>

        {/* Conversation Area - Animated height */}
        <div
          className="agentic-conversation-wrapper"
          style={{
            height: hasMessages ? (isExpanded ? `${conversationHeight + 100}px` : '48px') : '0px',
            opacity: hasMessages ? 1 : 0,
          }}
        >
          <div className="agentic-conversation" ref={conversationRef}>
            {/* Collapsible Header */}
            {hasMessages && (
              <button
                className="agentic-message-counter"
                data-expanded={isExpanded}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <span>{messages.length} message{messages.length !== 1 ? 's' : ''} in conversation</span>
                <CaretUp
                  size={16}
                  weight="bold"
                  className={cn(
                    'transition-transform duration-200',
                    !isExpanded && 'rotate-180'
                  )}
                />
              </button>
            )}

            {/* Messages - Collapsible */}
            <div
              className="space-y-4 p-4 transition-all duration-300"
              style={{
                maxHeight: isExpanded ? '50vh' : '0px',
                opacity: isExpanded ? 1 : 0,
                overflow: isExpanded ? 'auto' : 'hidden',
                padding: isExpanded ? '1rem' : '0 1rem',
              }}
            >
              {messages.map((msg, i) => {
                const isLastMessage = i === messages.length - 1
                const isAIMessage = msg.role === 'assistant'

                // Check if AI is asking for confirmation (either via pendingConfirmation or text patterns)
                const confirmationPatterns = [
                  /shall i proceed/i,
                  /would you like me to (create|proceed|continue)/i,
                  /ready to create/i,
                  /do you want me to/i,
                  /should i (create|proceed|go ahead)/i,
                  /can i (create|proceed)/i,
                  /let me know if you('d| would) like/i,
                ]
                const messageAsksForConfirmation = isLastMessage && isAIMessage && !isStreaming && !isLoading &&
                  confirmationPatterns.some(pattern => pattern.test(msg.content))

                const showQuickReplies = (isLastMessage && isAIMessage && pendingConfirmation && !isStreaming) || messageAsksForConfirmation

                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isLatest={isLastMessage}
                    isStreaming={isStreaming}
                    index={i}
                    quickReplies={showQuickReplies ? [
                      { label: 'Yes, create it', value: 'yes', variant: 'primary' as const },
                      { label: 'Make changes', value: 'changes', variant: 'secondary' as const },
                      { label: 'Cancel', value: 'cancel', variant: 'secondary' as const },
                    ] : undefined}
                    onQuickReply={(value) => {
                      if (value === 'yes') {
                        // If we have a pending confirmation (tool ready), execute it directly
                        if (pendingConfirmation) {
                          handleConfirm()
                        } else {
                          // Otherwise, send "yes" to trigger the AI to call the tool
                          handleSend('Yes, please create the event.')
                        }
                      } else if (value === 'cancel') {
                        if (pendingConfirmation) {
                          handleCancel()
                        } else {
                          handleSend('Cancel, I don\'t want to create this event.')
                        }
                      } else if (value === 'changes') {
                        handleSend('I\'d like to make some changes to the event details.')
                      }
                    }}
                  />
                )
              })}

              {/* Tool Results */}
              {toolResults.length > 0 && (
                <div className="space-y-2 agentic-message" style={{ animationDelay: '100ms' }}>
                  {toolResults.map((result, i) => (
                    <div
                      key={`${result.toolCallId}-${i}`}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm',
                        'border transition-all duration-300',
                        result.success
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                      )}
                    >
                      {result.success ? (
                        <CheckCircle size={16} weight="fill" />
                      ) : (
                        <X size={16} weight="bold" />
                      )}
                      <span>{result.summary}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Confirmation Card */}
              {pendingConfirmation && (
                <ConfirmationCard
                  toolCall={pendingConfirmation}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                  isLoading={isLoading}
                />
              )}

              {/* Inline Activity Indicator */}
              {(currentActivity || executingTools.length > 0) && !pendingConfirmation && (
                <div className="flex gap-3 agentic-message">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary border border-primary/20 avatar-streaming">
                    <Sparkle size={14} weight="duotone" />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl rounded-tl-sm bg-card border border-border/50 shadow-sm">
                    <CircleNotch size={14} weight="bold" className="text-primary animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      {currentActivity || 'Processing...'}
                    </span>
                  </div>
                </div>
              )}

              {/* Inline Success State */}
              {isComplete && (
                <div className="flex gap-3 agentic-message">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <CheckCircle size={14} weight="fill" />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl rounded-tl-sm bg-emerald-500/5 border border-emerald-500/20">
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">
                      Event created successfully! Redirecting...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Clear button */}
            {hasMessages && isExpanded && (
              <div className="px-4 py-2 border-t border-border/50 flex justify-end">
                <button
                  onClick={handleClearChat}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear conversation
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="agentic-input-area">
          <div className="agentic-input-glow">
            <div className="agentic-input-inner">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading || !!pendingConfirmation}
                rows={2}
                className="agentic-textarea"
              />

              {/* Bottom Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
                <button
                  className="p-2 rounded-lg text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-not-allowed"
                  title="Voice input (coming soon)"
                  disabled
                >
                  <Microphone size={18} weight="duotone" />
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() || isLoading || !!pendingConfirmation}
                  className={cn(
                    'p-2.5 rounded-xl transition-all duration-200',
                    inputValue.trim() && !isLoading
                      ? 'bg-foreground text-background hover:scale-105 shadow-lg'
                      : 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
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

        {/* Suggestions - Only when no messages */}
        {!hasMessages && suggestions.length > 0 && (
          <div className="agentic-suggestions">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent w-24 mx-auto mb-6" />
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(suggestion.prompt)}
                  disabled={isLoading}
                  className="suggestion-chip px-4 py-2 rounded-full text-sm font-medium bg-card hover:bg-muted border border-border/50 hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                  style={{ animationDelay: `${i * 75}ms` }}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {quickActions && quickActions.length > 0 && !hasMessages && (
          <div className="flex justify-center gap-3 mt-4">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-card border border-border hover:border-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {action.icon}
                {action.label}
                <ArrowRight size={14} weight="bold" className="text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="text-center py-4 mt-auto">
        <p className="text-xs text-muted-foreground/50">
          <kbd className="px-1.5 py-0.5 rounded bg-muted/30 font-mono text-[10px]">Enter</kbd>
          {' '}to send · {' '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted/30 font-mono text-[10px]">Shift + Enter</kbd>
          {' '}for new line
        </p>
      </div>
    </div>
  )
}

export default AgenticChat
