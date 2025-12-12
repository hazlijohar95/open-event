import type { ReactNode } from 'react'

// ============================================================================
// Chat Message Types
// ============================================================================

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  toolCalls?: ToolCall[]
}

// ============================================================================
// Tool Types
// ============================================================================

export type ToolStatus = 'pending' | 'executing' | 'success' | 'error'

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface ToolResult {
  toolCallId: string
  name: string
  success: boolean
  summary?: string
  data?: unknown
  error?: string
}

export interface ExecutingTool {
  id: string
  name: string
  status: ToolStatus
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface AgenticChatV2Props {
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

export interface AgenticHeaderProps {
  hasMessages: boolean
  isRateLimited: boolean
  isAdmin: boolean
  promptsRemaining: number
  promptsLimit: number
  timeUntilReset: string
  subtitle: string
  onClear: () => void
  onNavigateToSettings: () => void
}

export interface AgenticMessageListProps {
  messages: ChatMessage[]
  isStreaming: boolean
  isLoading: boolean
  pendingConfirmation: ToolCall | null
  onQuickReply: (value: string) => void
}

export interface AgenticToolResultsProps {
  results: ToolResult[]
}

export interface AgenticThinkingIndicatorProps {
  activity: string | null
  executingTools: ExecutingTool[]
}

export interface AgenticInputAreaProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled: boolean
  placeholder: string
  isLoading: boolean
}

export interface QuickReply {
  label: string
  value: string
  variant: 'primary' | 'secondary'
}

// ============================================================================
// Chat State Types (for useReducer)
// ============================================================================

export interface ChatState {
  messages: ChatMessage[]
  inputValue: string
  isLoading: boolean
  isStreaming: boolean
  currentActivity: string | null
  pendingConfirmation: ToolCall | null
  executingTools: ExecutingTool[]
  toolResults: ToolResult[]
  confirmedToolCalls: string[]
  isComplete: boolean
}

export type ChatAction =
  | { type: 'SET_MESSAGES'; messages: ChatMessage[] }
  | { type: 'ADD_MESSAGE'; message: ChatMessage }
  | { type: 'UPDATE_MESSAGE'; id: string; content: string }
  | { type: 'SET_INPUT_VALUE'; value: string }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_STREAMING'; isStreaming: boolean }
  | { type: 'SET_ACTIVITY'; activity: string | null }
  | { type: 'SET_PENDING_CONFIRMATION'; confirmation: ToolCall | null }
  | { type: 'ADD_EXECUTING_TOOL'; tool: ExecutingTool }
  | { type: 'UPDATE_TOOL_STATUS'; id: string; status: ToolStatus }
  | { type: 'CLEAR_EXECUTING_TOOLS' }
  | { type: 'ADD_TOOL_RESULT'; result: ToolResult }
  | { type: 'CLEAR_TOOL_RESULTS' }
  | { type: 'ADD_CONFIRMED_TOOL_CALL'; id: string }
  | { type: 'SET_COMPLETE'; isComplete: boolean }
  | { type: 'CLEAR_CHAT' }
  | { type: 'PREPARE_FOR_SEND' }

// ============================================================================
// Constants
// ============================================================================

export const STORAGE_KEY = 'open-event-agentic-chat-v2'

export const toolDisplayNames: Record<string, string> = {
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
