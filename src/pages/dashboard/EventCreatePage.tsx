import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import {
  ArrowLeft,
  Lightning,
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

interface DBMessage {
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

// ============================================================================
// Component
// ============================================================================

export function EventCreatePage() {
  const navigate = useNavigate()
  const [conversationId, setConversationId] = useState<Id<'aiConversations'> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<ToolCall | null>(null)
  const [executingTools, setExecutingTools] = useState<ToolCall[]>([])
  const [toolResults, setToolResults] = useState<ToolResult[]>([])
  const [pendingMessageContent, setPendingMessageContent] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isComplete, setIsComplete] = useState(false)

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

  // Clear pending message when it appears in DB messages
  useEffect(() => {
    if (pendingMessageContent && messages) {
      const messageInDb = messages.some(
        (msg) => msg.role === 'user' && msg.content === pendingMessageContent
      )
      if (messageInDb) {
        setPendingMessageContent(null)
      }
    }
  }, [messages, pendingMessageContent])

  // Send a message
  const handleSend = useCallback(async (userMessage: string) => {
    if (isLoading) return

    setError(null)
    setIsLoading(true)

    // Start conversation if needed
    let currentConversationId = conversationId
    if (!currentConversationId) {
      try {
        currentConversationId = await createConversation({ purpose: 'event-creation' })
        setConversationId(currentConversationId)
      } catch {
        setIsLoading(false)
        toast.error('Failed to start conversation')
        return
      }
    }

    // Track pending message content (will be cleared when DB updates)
    setPendingMessageContent(userMessage)
    setExecutingTools([])
    setToolResults([])

    try {
      const response: AgentResponse = await agentChat({
        conversationId: currentConversationId,
        userMessage,
      })

      // Clear pending message (in case effect didn't fire yet)
      setPendingMessageContent(null)

      // Handle tool results
      setToolResults(response.toolResults)

      // Handle pending confirmations
      if (response.pendingConfirmations.length > 0) {
        setPendingConfirmation(response.pendingConfirmations[0])
      }

      // Handle completion
      if (response.isComplete && response.entityId) {
        setIsComplete(true)
        toast.success('Event created successfully!')
        setTimeout(() => {
          navigate(`/dashboard/events/${response.entityId}`)
        }, 1500)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      setPendingMessageContent(null)

      if (error.message.includes('rate limit')) {
        toast.error('Too many requests. Please wait a moment.')
      } else if (error.message.includes('API key') || error.message.includes('OPENAI')) {
        toast.error('AI service unavailable. Please check configuration.')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [conversationId, isLoading, createConversation, agentChat, navigate])

  // Confirm pending tool
  const handleConfirm = useCallback(async () => {
    if (!pendingConfirmation || !conversationId) return

    setIsLoading(true)
    setExecutingTools([pendingConfirmation])

    try {
      const result = await confirmAndExecute({
        conversationId,
        toolCallId: pendingConfirmation.id,
        toolName: pendingConfirmation.name,
        toolArguments: pendingConfirmation.arguments,
      })

      setToolResults([result])
      setPendingConfirmation(null)

      if (result.success) {
        toast.success(result.summary)
      } else {
        toast.error(result.error || 'Action failed')
      }

      // Navigate to event if created
      if (result.name === 'createEvent' && result.success && result.data) {
        setIsComplete(true)
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
  }, [pendingConfirmation, conversationId, confirmAndExecute, navigate])

  // Cancel pending tool
  const handleCancel = useCallback(() => {
    setPendingConfirmation(null)
    toast.info('Action cancelled')
  }, [])

  // Retry after error
  const handleRetry = useCallback(() => {
    setError(null)
  }, [])

  // Determine tool status
  const getToolStatus = (toolName: string): ToolStatus => {
    if (executingTools.some((t) => t.name === toolName)) return 'executing'
    const result = toolResults.find((r) => r.name === toolName)
    if (result) return result.success ? 'success' : 'error'
    return 'pending'
  }

  const dbMessages = (messages || []) as DBMessage[]
  const isEmpty = dbMessages.length === 0 && !pendingMessageContent

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
            Create events, find vendors, and discover sponsors with AI assistance
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <ChatContainer
        title="Event Assistant"
        subtitle="AI-powered event planning"
        badge={
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Online
          </span>
        }
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
                content={`Hi! I'm your AI event planning assistant. I can help you:

- **Create events** - Just describe your event and I'll set it up
- **Find vendors** - Search for catering, AV, photography, and more
- **Discover sponsors** - Find companies interested in sponsoring your event

What would you like to do today?`}
              />
            </Message>
          )}

          {/* Database messages */}
          {dbMessages.map((msg) => (
            <div key={msg._id} className="space-y-3">
              <Message
                role={msg.role as 'user' | 'assistant'}
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
                  content={msg.content}
                  isUser={msg.role === 'user'}
                />
              </Message>

              {/* Tool results for this message */}
              {msg.metadata?.extractedFields && msg.metadata.extractedFields.length > 0 && (
                <div className="ml-11">
                  <ToolList>
                    {msg.metadata.extractedFields.map((toolName, i) => {
                      const result = toolResults.find((r) => r.name === toolName)
                      return (
                        <Tool
                          key={`${msg._id}-${toolName}-${i}`}
                          id={`${msg._id}-${toolName}-${i}`}
                          name={toolName}
                          status={getToolStatus(toolName)}
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

          {/* Pending user message (optimistic) */}
          {pendingMessageContent && (
            <Message role="user" status="sending">
              <MessageContent content={pendingMessageContent} isUser />
            </Message>
          )}

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
                title="Confirm Action"
                description="The AI wants to perform the following action:"
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
