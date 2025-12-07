import { useState, useCallback, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useConvexAuth } from 'convex/react'
import { useAuthToken } from '@convex-dev/auth/react'
import {
  ArrowLeft,
  CalendarPlus,
  Storefront,
  Handshake,
  Sparkle,
  Check,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import {
  ChatContainer,
  Conversation,
  ConversationEmptyState,
  PromptInput,
  Message,
  MessageContent,
  MessageActions,
  ThinkingIndicator,
  Tool,
  ToolList,
  Confirmation,
} from '@/components/chat'
import type { ToolStatus } from '@/components/chat'
import { toast } from 'sonner'

// ============================================================================
// Types
// ============================================================================

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
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

// LocalStorage key for persisting messages
const STORAGE_KEY = 'open-event-agent-chat'

// ============================================================================
// Component
// ============================================================================

export function EventCreatePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useConvexAuth()
  const authToken = useAuthToken()
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Initialize from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // Ignore parse errors
    }
    return []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<ToolCall | null>(null)
  const [executingTools, setExecutingTools] = useState<ToolCall[]>([])
  const [toolResults, setToolResults] = useState<ToolResult[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [confirmedToolCalls, setConfirmedToolCalls] = useState<string[]>([])

  const abortControllerRef = useRef<AbortController | null>(null)
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  // Clear chat history
  const handleClearHistory = useCallback(() => {
    setMessages([])
    localStorage.removeItem(STORAGE_KEY)
    toast.info('Chat history cleared')
  }, [])

  // Send a message with streaming
  const handleSend = useCallback(async (userMessage: string) => {
    if (isLoading || !isAuthenticated || !authToken) return

    setError(null)
    setIsLoading(true)
    setIsStreaming(false)
    setExecutingTools([])
    setToolResults([])
    setPendingConfirmation(null)
    setIsComplete(false)

    // Add user message to local state
    const userMsgId = `user-${Date.now()}`
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: userMessage,
    }

    const updatedMessages = [...messages, newUserMessage]
    setMessages(updatedMessages)

    // Create abort controller
    abortControllerRef.current = new AbortController()

    try {
      // Get the HTTP URL from Convex URL
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
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      // Add assistant message placeholder
      const assistantMsgId = `assistant-${Date.now()}`
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
      }])
      setIsStreaming(true)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Parse SSE events
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

              // Handle different event types
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
                  break
                }

                case 'tool_pending': {
                  const toolData = parsed as ToolCall
                  setPendingConfirmation(toolData)
                  setExecutingTools(prev => prev.filter(t => t.id !== toolData.id))
                  // Stop loading so confirmation UI can appear
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
                      navigate(`/dashboard/events/${doneData.entityId}`)
                    }, 1500)
                  }

                  if (doneData.pendingConfirmations.length > 0) {
                    setPendingConfirmation(doneData.pendingConfirmations[0])
                    // Stop loading so confirmation UI can appear
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
              // Ignore parse errors for incomplete chunks
              if (parseError instanceof Error && parseError.message !== 'Unexpected end of JSON input') {
                throw parseError
              }
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User aborted - remove the pending messages
        setMessages(prev => prev.filter(m => m.id !== userMsgId))
      } else {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)

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
      abortControllerRef.current = null
    }
  }, [messages, isLoading, isAuthenticated, authToken, convexUrl, confirmedToolCalls, navigate])

  // Confirm pending tool
  const handleConfirm = useCallback(async () => {
    if (!pendingConfirmation || !authToken) return

    // Add this tool call to confirmed list
    setConfirmedToolCalls(prev => [...prev, pendingConfirmation.id])
    setIsLoading(true)
    setExecutingTools([pendingConfirmation])

    try {
      // Get the HTTP URL from Convex URL
      const httpUrl = convexUrl.replace('.convex.cloud', '.convex.site')

      // Re-send the last user message with the confirmed tool call
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
      if (!lastUserMessage) {
        throw new Error('No user message found')
      }

      const response = await fetch(`${httpUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          userMessage: lastUserMessage.content,
          confirmedToolCalls: [...confirmedToolCalls, pendingConfirmation.id],
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Parse SSE events
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

              if (currentEvent === 'tool_result') {
                const resultData = parsed as ToolResult & { id: string; name: string }
                const result: ToolResult = {
                  toolCallId: resultData.id,
                  name: resultData.name,
                  success: resultData.success,
                  summary: resultData.summary,
                  data: resultData.data,
                  error: resultData.error,
                }
                setToolResults([result])

                if (result.success) {
                  toast.success(result.summary)
                } else {
                  toast.error(result.error || 'Action failed')
                }
              }

              if (currentEvent === 'done') {
                const doneData = parsed as {
                  isComplete: boolean
                  entityId?: string
                }

                if (doneData.isComplete && doneData.entityId) {
                  setIsComplete(true)
                  setTimeout(() => {
                    navigate(`/dashboard/events/${doneData.entityId}`)
                  }, 1500)
                }
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      setPendingConfirmation(null)
    } catch {
      toast.error('Failed to confirm action')
    } finally {
      setIsLoading(false)
      setExecutingTools([])
    }
  }, [pendingConfirmation, authToken, messages, confirmedToolCalls, convexUrl, navigate])

  // Cancel pending tool
  const handleCancel = useCallback(() => {
    setPendingConfirmation(null)
    toast.info('Action cancelled')
  }, [])

  // Retry after error
  const handleRetry = useCallback(() => {
    setError(null)
  }, [])

  // Abort the current request
  const handleAbort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
    setIsStreaming(false)
  }, [])

  // Determine tool status
  const getToolStatus = (toolName: string): ToolStatus => {
    if (executingTools.some((t) => t.name === toolName)) return 'executing'
    const result = toolResults.find((r) => r.name === toolName)
    if (result) return result.success ? 'success' : 'error'
    return 'pending'
  }

  const isEmpty = messages.length === 0

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/dashboard/events"
          className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft size={20} weight="bold" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-mono">Create Event</h1>
          <p className="text-muted-foreground mt-1">
            Describe your event and I'll help you set it up
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear history
          </button>
        )}
      </div>

      {/* Chat Container */}
      <ChatContainer
        title="Your Assistant"
        subtitle="Event planning made simple"
      >
        {/* Conversation */}
        <Conversation
          isEmpty={isEmpty}
          emptyState={
            <ConversationEmptyState
              icon={<Sparkle size={32} weight="duotone" className="text-primary" />}
              title="Let's plan your event"
              description="Tell me about the event you want to create, or ask me to find vendors and sponsors."
            >
              <div className="flex flex-wrap gap-2 justify-center">
                <SuggestionChip onClick={() => handleSend("I want to create a tech conference for 200 people")}>
                  Tech Conference
                </SuggestionChip>
                <SuggestionChip onClick={() => handleSend("Help me find catering vendors")}>
                  Find Vendors
                </SuggestionChip>
                <SuggestionChip onClick={() => handleSend("Show me potential sponsors for my event")}>
                  Find Sponsors
                </SuggestionChip>
              </div>
            </ConversationEmptyState>
          }
        >
          {/* Welcome message (only when empty) */}
          {isEmpty && !isLoading && (
            <Message role="assistant">
              <MessageContent
                content={`Hey! I'm here to help you plan events. I can:

- **Create events** – Just describe what you're planning
- **Find vendors** – Search for catering, AV, photography, and more
- **Discover sponsors** – Connect with companies interested in your event

What would you like to do?`}
              />
            </Message>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              <Message
                role={msg.role}
                actions={
                  msg.role === 'assistant' ? (
                    <MessageActions
                      content={msg.content}
                      showCopy
                      onRetry={handleRetry}
                    />
                  ) : undefined
                }
              >
                <MessageContent
                  content={msg.content || (isStreaming && msg.id.startsWith('assistant-') ? '...' : '')}
                  isUser={msg.role === 'user'}
                />
              </Message>

              {/* Tool results for this message */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="ml-11">
                  <ToolList>
                    {msg.toolCalls.map((tool, i) => {
                      const result = toolResults.find((r) => r.name === tool.name)
                      return (
                        <Tool
                          key={`${msg.id}-${tool.name}-${i}`}
                          id={`${msg.id}-${tool.name}-${i}`}
                          name={tool.name}
                          status={getToolStatus(tool.name)}
                          result={result ? {
                            success: result.success,
                            summary: result.summary,
                            data: result.data,
                            error: result.error,
                          } : undefined}
                        />
                      )
                    })}
                  </ToolList>
                </div>
              )}
            </div>
          ))}

          {/* Executing tools */}
          {executingTools.length > 0 && (
            <div className="ml-11">
              <ToolList>
                {executingTools.map((tool) => (
                  <Tool
                    key={tool.id}
                    id={tool.id}
                    name={tool.name}
                    arguments={tool.arguments}
                    status="executing"
                  />
                ))}
              </ToolList>
            </div>
          )}

          {/* Pending confirmation */}
          {pendingConfirmation && !isLoading && (
            <div className="ml-11">
              <Confirmation
                id={pendingConfirmation.id}
                toolName={pendingConfirmation.name}
                arguments={pendingConfirmation.arguments}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && executingTools.length === 0 && !pendingConfirmation && (
            <ThinkingIndicator />
          )}

          {/* Error display */}
          {error && (
            <Message role="assistant">
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive font-medium mb-1">Something went wrong</p>
                <p className="text-xs text-destructive/80 mb-2">{error.message}</p>
                <button
                  onClick={handleRetry}
                  className="text-xs font-medium text-destructive hover:underline"
                >
                  Try again
                </button>
              </div>
            </Message>
          )}

          {/* Success indicator */}
          {isComplete && (
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600">
                <Check size={18} weight="bold" />
                <span className="text-sm font-medium">Event created! Redirecting...</span>
              </div>
            </div>
          )}
        </Conversation>

        {/* Input */}
        <div className="border-t border-border p-4">
          <PromptInput
            onSubmit={handleSend}
            isLoading={isLoading}
            disabled={!!pendingConfirmation}
            placeholder="Tell me about your event, or ask me to find vendors/sponsors..."
          />
          {isStreaming && (
            <button
              onClick={handleAbort}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Stop generating
            </button>
          )}
        </div>
      </ChatContainer>

      {/* Capabilities */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <CapabilityCard
          icon={<CalendarPlus size={24} weight="duotone" className="text-primary" />}
          title="Create Events"
          description="Describe your event and I'll create it with all the details"
        />
        <CapabilityCard
          icon={<Storefront size={24} weight="duotone" className="text-primary" />}
          title="Find Vendors"
          description="Search for catering, AV, photography, and more"
        />
        <CapabilityCard
          icon={<Handshake size={24} weight="duotone" className="text-primary" />}
          title="Discover Sponsors"
          description="Find companies interested in sponsoring events"
        />
      </div>
    </div>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

function SuggestionChip({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm',
        'bg-muted hover:bg-muted/80 text-foreground',
        'border border-border hover:border-primary/30',
        'transition-colors'
      )}
    >
      {children}
    </button>
  )
}

function CapabilityCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-4 rounded-xl bg-muted/50 border border-border">
      <div className="mb-2">{icon}</div>
      <h3 className="text-sm font-medium mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
