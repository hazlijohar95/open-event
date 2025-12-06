import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  ArrowLeft,
  PaperPlaneTilt,
  Sparkle,
  User,
  CircleNotch,
  Check,
  Robot,
  Lightning,
  Stop,
  ArrowClockwise,
  WarningCircle,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { ToolExecutionCard, ToolConfirmationDialog } from '@/components/agent'
import { toast } from 'sonner'

// ============================================================================
// Types
// ============================================================================

interface Message {
  _id: Id<'aiMessages'>
  role: string
  content: string
  createdAt: number
  metadata?: {
    extractedFields?: string[]
    suggestedActions?: string[]
  }
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

interface AgentResponse {
  message: string
  toolCalls: ToolCall[]
  toolResults: ToolResult[]
  pendingConfirmations: ToolCall[]
  isComplete: boolean
  entityId?: Id<'events'>
}

interface StreamMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

// ============================================================================
// Component
// ============================================================================

export function EventCreatePage() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState<Id<'aiConversations'> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<ToolCall | null>(null)
  const [executingTools, setExecutingTools] = useState<string[]>([])
  const [lastToolResults, setLastToolResults] = useState<ToolResult[]>([])
  const [localMessages, setLocalMessages] = useState<StreamMessage[]>([])
  const [error, setError] = useState<Error | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Queries and mutations
  const activeConversation = useQuery(api.aiConversations.getActiveForEventCreation)
  const messages = useQuery(
    api.aiConversations.getMessages,
    conversationId ? { conversationId } : 'skip'
  )
  const createConversation = useMutation(api.aiConversations.create)
  const agentChat = useAction(api.actions.agent.chat)
  const confirmAndExecute = useAction(api.actions.agent.confirmAndExecute)

  // Set conversation ID when active conversation loads
  useEffect(() => {
    if (activeConversation) {
      setConversationId(activeConversation._id)
    }
  }, [activeConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, localMessages, executingTools, pendingConfirmation])

  // Send a message to the agent with streaming
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setError(null)

    // Start conversation if needed
    let currentConversationId = conversationId
    if (!currentConversationId) {
      setIsLoading(true)
      try {
        currentConversationId = await createConversation({ purpose: 'event-creation' })
        setConversationId(currentConversationId)
      } catch {
        setIsLoading(false)
        toast.error('Failed to start conversation')
        return
      }
    }

    // Add user message to local state immediately (optimistic)
    const userMsgId = `user-${Date.now()}`
    setLocalMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content: userMessage },
    ])

    setIsLoading(true)
    setExecutingTools([])
    setLastToolResults([])

    // Create abort controller for cancel functionality
    abortControllerRef.current = new AbortController()

    try {
      // Use the Convex action for now (non-streaming but reliable)
      // We can switch to HTTP streaming once it's properly set up
      const response: AgentResponse = await agentChat({
        conversationId: currentConversationId,
        userMessage,
      })

      // Clear local user message since it's now in DB
      setLocalMessages((prev) => prev.filter((m) => m.id !== userMsgId))

      // Handle tool results
      setLastToolResults(response.toolResults)

      // Handle pending confirmations
      if (response.pendingConfirmations.length > 0) {
        setPendingConfirmation(response.pendingConfirmations[0])
      }

      // Handle completion
      if (response.isComplete && response.entityId) {
        toast.success('Event created successfully!')
        setTimeout(() => {
          navigate(`/dashboard/events/${response.entityId}`)
        }, 1500)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)

      // Show error toast with retry action
      if (error.message.includes('rate limit')) {
        toast.error('Too many requests. Please wait a moment.')
      } else if (error.message.includes('API key') || error.message.includes('OPENAI')) {
        toast.error('AI service unavailable. Please check the OpenAI API key in Convex dashboard.')
      } else {
        toast.error('Something went wrong. Please try again.', {
          action: {
            label: 'Retry',
            onClick: () => {
              setInput(userMessage)
              setError(null)
            },
          },
        })
      }

      // Remove failed message from local state
      setLocalMessages((prev) => prev.filter((m) => m.id !== userMsgId))
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  // Stop generation
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
    toast.info('Generation stopped')
  }

  // Handle confirmation of pending tool
  const handleConfirm = async () => {
    if (!pendingConfirmation || !conversationId) return

    setIsLoading(true)
    setExecutingTools([pendingConfirmation.name])

    try {
      const result = await confirmAndExecute({
        conversationId,
        toolCallId: pendingConfirmation.id,
        toolName: pendingConfirmation.name,
        toolArguments: pendingConfirmation.arguments,
      })

      setLastToolResults([result])
      setPendingConfirmation(null)

      if (result.success) {
        toast.success(result.summary)
      } else {
        toast.error(result.error || 'Action failed')
      }

      // Navigate to event if created
      if (result.name === 'createEvent' && result.success && result.data) {
        const eventId = (result.data as { eventId: string }).eventId
        setTimeout(() => {
          navigate(`/dashboard/events/${eventId}`)
        }, 1500)
      }
    } catch {
      toast.error('Failed to confirm action')
    } finally {
      setIsLoading(false)
      setExecutingTools([])
    }
  }

  // Handle cancellation
  const handleCancel = () => {
    setPendingConfirmation(null)
    toast.info('Action cancelled')
  }

  // Retry after error
  const handleRetry = () => {
    setError(null)
  }

  const welcomeMessage = {
    role: 'assistant',
    content: `Hi! I'm your AI event planning assistant. I can help you:

- **Create events** - Just describe your event and I'll set it up
- **Find vendors** - Search for catering, AV, photography, and more
- **Discover sponsors** - Find companies interested in sponsoring your event

What would you like to do today?`,
  }

  const displayMessages = messages || []
  const showWelcome = displayMessages.length === 0 && localMessages.length === 0

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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-mono">AI Event Assistant</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Lightning size={12} weight="fill" />
              Agentic
            </span>
          </div>
          <p className="text-muted-foreground mt-1">
            I can create events, find vendors, and discover sponsors for you
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Chat Messages */}
        <div className="min-h-[450px] max-h-[550px] overflow-y-auto p-6 space-y-6">
          {/* Welcome Message */}
          {showWelcome && (
            <MessageBubble role="assistant" content={welcomeMessage.content} />
          )}

          {/* Database Messages */}
          {displayMessages.map((msg: Message) => (
            <div key={msg._id} className="space-y-3">
              <MessageBubble role={msg.role} content={msg.content} />
              {/* Show tool results inline if this message triggered tools */}
              {msg.metadata?.extractedFields && msg.metadata.extractedFields.length > 0 && (
                <div className="ml-14 space-y-2">
                  {msg.metadata.extractedFields.map((toolName, i) => {
                    const result = lastToolResults.find((r) => r.name === toolName)
                    return (
                      <ToolExecutionCard
                        key={`${msg._id}-${toolName}-${i}`}
                        toolName={toolName}
                        status={result ? (result.success ? 'success' : 'error') : 'success'}
                        result={result}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Local Messages (optimistic) */}
          {localMessages.map((msg) => (
            <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
          ))}

          {/* Executing Tools */}
          {executingTools.length > 0 && (
            <div className="ml-14 space-y-2">
              {executingTools.map((toolName) => (
                <ToolExecutionCard
                  key={toolName}
                  toolName={toolName}
                  status="executing"
                />
              ))}
            </div>
          )}

          {/* Pending Confirmation */}
          {pendingConfirmation && !isLoading && (
            <div className="ml-14">
              <ToolConfirmationDialog
                toolCall={pendingConfirmation}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && !executingTools.length && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Robot size={20} weight="duotone" className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="rounded-2xl rounded-tl-sm bg-muted p-4 max-w-[85%] inline-flex items-center gap-2">
                  <CircleNotch size={16} className="animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <WarningCircle size={20} weight="duotone" className="text-destructive" />
              </div>
              <div className="flex-1">
                <div className="rounded-2xl rounded-tl-sm bg-destructive/10 border border-destructive/20 p-4 max-w-[85%]">
                  <p className="text-sm text-destructive font-medium mb-2">Something went wrong</p>
                  <p className="text-xs text-destructive/80 mb-3">{error.message}</p>
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline cursor-pointer"
                  >
                    <ArrowClockwise size={14} />
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success indicator */}
          {lastToolResults.some(
            (r) => r.name === 'createEvent' && r.success
          ) && (
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600">
                <Check size={18} weight="bold" />
                <span className="text-sm font-medium">Event created! Redirecting...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tell me about your event, or ask me to find vendors/sponsors..."
                rows={1}
                disabled={isLoading || !!pendingConfirmation}
                className={cn(
                  'w-full px-4 py-3 rounded-xl border border-border bg-background',
                  'resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                  'text-sm placeholder:text-muted-foreground',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    e.currentTarget.form?.requestSubmit()
                  }
                }}
              />
            </div>

            {/* Stop button during loading */}
            {isLoading && (
              <button
                type="button"
                onClick={handleStop}
                className={cn(
                  'p-3 rounded-xl bg-muted text-muted-foreground',
                  'hover:bg-muted/80 transition-colors cursor-pointer'
                )}
                title="Stop generating"
              >
                <Stop size={20} weight="fill" />
              </button>
            )}

            <button
              type="submit"
              disabled={!input.trim() || isLoading || !!pendingConfirmation}
              className={cn(
                'p-3 rounded-xl bg-primary text-primary-foreground',
                'hover:bg-primary/90 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
              )}
            >
              <PaperPlaneTilt size={20} weight="fill" />
            </button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Capabilities */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <CapabilityCard
          icon="📅"
          title="Create Events"
          description="Describe your event and I'll create it with all the details"
        />
        <CapabilityCard
          icon="🏪"
          title="Find Vendors"
          description="Search for catering, AV, photography, and more"
        />
        <CapabilityCard
          icon="🤝"
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

function MessageBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === 'user'

  // Simple markdown rendering
  const renderContent = (text: string) => {
    // Remove JSON blocks from display
    const cleanText = text.replace(/```json[\s\S]*?```/g, '')

    // Parse bold text and bullet points
    const lines = cleanText.split('\n')
    return lines.map((line, lineIndex) => {
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-')

      // Parse bold text
      const parts = line.split(/\*\*(.*?)\*\*/g)
      const renderedLine = parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
      )

      return (
        <span key={lineIndex} className={cn(isBullet && 'block ml-2')}>
          {renderedLine}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      )
    })
  }

  if (isUser) {
    return (
      <div className="flex gap-4 justify-end">
        <div className="flex-1 flex justify-end">
          <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground p-4 max-w-[85%]">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User size={20} weight="duotone" className="text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Sparkle size={20} weight="duotone" className="text-primary" />
      </div>
      <div className="flex-1">
        <div className="rounded-2xl rounded-tl-sm bg-muted p-4 max-w-[85%]">
          <p className="text-sm leading-relaxed">{renderContent(content)}</p>
        </div>
      </div>
    </div>
  )
}

function CapabilityCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="p-4 rounded-xl bg-muted/50 border border-border">
      <span className="text-xl mb-2 block">{icon}</span>
      <h3 className="text-sm font-medium mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
