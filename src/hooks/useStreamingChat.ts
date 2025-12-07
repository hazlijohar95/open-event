import { useState, useCallback, useRef } from 'react'
import { useQuery, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

// ============================================================================
// Types
// ============================================================================

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface ToolResult {
  toolCallId: string
  name: string
  success: boolean
  data?: unknown
  error?: string
  summary: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  isStreaming?: boolean
  toolCalls?: ToolCall[]
  toolResults?: ToolResult[]
  createdAt: number
}

interface DoneEventData {
  message: string
  toolCalls: ToolCall[]
  toolResults: ToolResult[]
  pendingConfirmations: ToolCall[]
  isComplete: boolean
  entityId?: string
}

export interface UseStreamingChatReturn {
  messages: ChatMessage[]
  isStreaming: boolean
  isLoading: boolean
  streamingContent: string
  error: Error | null
  pendingConfirmation: ToolCall | null
  executingTools: ToolCall[]
  toolResults: ToolResult[]
  isComplete: boolean
  entityId: string | null
  send: (message: string) => Promise<void>
  confirmTool: (toolCall: ToolCall) => Promise<void>
  cancelTool: () => void
  abort: () => void
  retry: () => void
  reset: () => void
}

// ============================================================================
// Hook
// ============================================================================

export function useStreamingChat(
  conversationId: Id<'aiConversations'> | null
): UseStreamingChatReturn {
  // State
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<Error | null>(null)
  const [pendingConfirmation, setPendingConfirmation] = useState<ToolCall | null>(null)
  const [executingTools, setExecutingTools] = useState<ToolCall[]>([])
  const [toolResults, setToolResults] = useState<ToolResult[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [entityId, setEntityId] = useState<string | null>(null)
  const [lastUserMessage, setLastUserMessage] = useState<string>('')

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null)
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string

  // Queries
  const dbMessages = useQuery(
    api.aiConversations.getMessages,
    conversationId ? { conversationId } : 'skip'
  )

  // Mutations
  const confirmAndExecute = useAction(api.actions.agent.confirmAndExecute)

  // Combine database messages with local streaming state
  const messages: ChatMessage[] = [
    ...(dbMessages || []).map((msg) => ({
      id: msg._id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      createdAt: msg.createdAt,
      toolCalls: msg.metadata?.extractedFields?.map((name, i) => ({
        id: `db-${msg._id}-${i}`,
        name,
        arguments: {},
      })),
    })),
    ...localMessages,
  ]

  // Send a message with streaming
  const send = useCallback(
    async (message: string) => {
      if (!conversationId || !message.trim() || isLoading) return

      setError(null)
      setIsLoading(true)
      setIsStreaming(false)
      setStreamingContent('')
      setExecutingTools([])
      setToolResults([])
      setPendingConfirmation(null)
      setIsComplete(false)
      setEntityId(null)
      setLastUserMessage(message)

      // Add user message optimistically
      const userMsgId = `user-${Date.now()}`
      setLocalMessages((prev) => [
        ...prev,
        {
          id: userMsgId,
          role: 'user',
          content: message,
          createdAt: Date.now(),
        },
      ])

      // Create abort controller
      abortControllerRef.current = new AbortController()

      try {
        // Get the HTTP URL from Convex URL
        const httpUrl = convexUrl.replace('.convex.cloud', '.convex.site')

        const response = await fetch(`${httpUrl}/api/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId,
            userMessage: message,
          }),
          signal: abortControllerRef.current.signal,
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
        let fullContent = ''

        // Add assistant message placeholder
        const assistantMsgId = `assistant-${Date.now()}`
        setLocalMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            isStreaming: true,
            createdAt: Date.now(),
          },
        ])
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
                handleStreamEvent(currentEvent, parsed, assistantMsgId, fullContent, (content) => {
                  fullContent = content
                })
              } catch {
                // Ignore parse errors
              }
            }
          }
        }

        // Remove local user message since it's in DB now
        setLocalMessages((prev) =>
          prev.filter((m) => m.id !== userMsgId && m.id !== assistantMsgId)
        )
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // User aborted
          setLocalMessages((prev) => prev.filter((m) => m.id !== userMsgId))
        } else {
          const error = err instanceof Error ? err : new Error('Unknown error')
          setError(error)
          // Keep user message for retry
        }
      } finally {
        setIsLoading(false)
        setIsStreaming(false)
        abortControllerRef.current = null
      }
    },
    [conversationId, isLoading, convexUrl]
  )

  // Handle stream events
  const handleStreamEvent = (
    event: string,
    data: unknown,
    assistantMsgId: string,
    currentContent: string,
    setContent: (content: string) => void
  ) => {
    switch (event) {
      case 'thinking':
        // Show thinking indicator
        break

      case 'text': {
        const textData = data as { content: string }
        const newContent = currentContent + textData.content
        setContent(newContent)
        setStreamingContent(newContent)
        setLocalMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: newContent } : m
          )
        )
        break
      }

      case 'tool_start': {
        const toolData = data as ToolCall
        setExecutingTools((prev) => [...prev, toolData])
        break
      }

      case 'tool_pending': {
        const toolData = data as ToolCall
        setPendingConfirmation(toolData)
        setExecutingTools((prev) => prev.filter((t) => t.id !== toolData.id))
        break
      }

      case 'tool_result': {
        const resultData = data as ToolResult & { id: string; name: string }
        const result: ToolResult = {
          toolCallId: resultData.id,
          name: resultData.name,
          success: resultData.success,
          summary: resultData.summary,
          data: resultData.data,
          error: resultData.error,
        }
        setToolResults((prev) => [...prev, result])
        setExecutingTools((prev) => prev.filter((t) => t.id !== resultData.id))
        break
      }

      case 'done': {
        const doneData = data as DoneEventData
        setIsComplete(doneData.isComplete)
        if (doneData.entityId) {
          setEntityId(doneData.entityId)
        }
        if (doneData.pendingConfirmations.length > 0) {
          setPendingConfirmation(doneData.pendingConfirmations[0])
        }
        break
      }

      case 'error': {
        const errorData = data as { message: string }
        setError(new Error(errorData.message))
        break
      }
    }
  }

  // Confirm a pending tool
  const confirmTool = useCallback(
    async (toolCall: ToolCall) => {
      if (!conversationId) return

      setIsLoading(true)
      setExecutingTools([toolCall])
      setPendingConfirmation(null)

      try {
        const result = await confirmAndExecute({
          conversationId,
          toolCallId: toolCall.id,
          toolName: toolCall.name,
          toolArguments: toolCall.arguments,
        })

        setToolResults((prev) => [...prev, result])

        if (result.name === 'createEvent' && result.success && result.data) {
          setIsComplete(true)
          setEntityId((result.data as { eventId: string }).eventId)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to confirm action'))
      } finally {
        setIsLoading(false)
        setExecutingTools([])
      }
    },
    [conversationId, confirmAndExecute]
  )

  // Cancel a pending tool
  const cancelTool = useCallback(() => {
    setPendingConfirmation(null)
  }, [])

  // Abort the current request
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
    setIsStreaming(false)
  }, [])

  // Retry the last message
  const retry = useCallback(() => {
    if (lastUserMessage) {
      setError(null)
      send(lastUserMessage)
    }
  }, [lastUserMessage, send])

  // Reset the chat state
  const reset = useCallback(() => {
    setLocalMessages([])
    setIsStreaming(false)
    setIsLoading(false)
    setStreamingContent('')
    setError(null)
    setPendingConfirmation(null)
    setExecutingTools([])
    setToolResults([])
    setIsComplete(false)
    setEntityId(null)
    setLastUserMessage('')
  }, [])

  return {
    messages,
    isStreaming,
    isLoading,
    streamingContent,
    error,
    pendingConfirmation,
    executingTools,
    toolResults,
    isComplete,
    entityId,
    send,
    confirmTool,
    cancelTool,
    abort,
    retry,
    reset,
  }
}
