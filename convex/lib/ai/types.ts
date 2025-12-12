/**
 * AI Provider Types
 *
 * Defines the interfaces for AI providers (OpenAI, Anthropic, Groq).
 * This abstraction allows easy switching between providers.
 */

// ============================================================================
// Message Types
// ============================================================================

export type AIMessageRole = 'system' | 'user' | 'assistant' | 'tool'

export interface AIMessage {
  role: AIMessageRole
  content: string
  toolCalls?: AIToolCall[]
  toolCallId?: string
}

export interface AIToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

// ============================================================================
// Streaming Types
// ============================================================================

export type AIStreamChunkType = 'text' | 'tool_call_start' | 'tool_call_delta' | 'done' | 'error'

export interface AIStreamChunk {
  type: AIStreamChunkType
  content?: string
  toolCall?: Partial<AIToolCall> & { index?: number }
  finishReason?: 'stop' | 'tool_calls' | 'length' | 'content_filter'
  error?: string
}

// ============================================================================
// Tool Types
// ============================================================================

export interface AITool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface AIProviderConfig {
  model: string
  temperature?: number
  maxTokens?: number
  toolChoice?: 'auto' | 'none' | 'required'
}

// ============================================================================
// Provider Interface
// ============================================================================

export interface AIProvider {
  /** Provider name (openai, anthropic, groq) */
  readonly name: string

  /**
   * Create a streaming chat completion.
   * Returns an async iterable of stream chunks.
   */
  createStreamingChat(
    messages: AIMessage[],
    tools: AITool[],
    config: AIProviderConfig
  ): Promise<AsyncIterable<AIStreamChunk>>
}

// ============================================================================
// Provider Configuration
// ============================================================================

export type ProviderType = 'openai' | 'anthropic' | 'groq'

export interface ProviderCredentials {
  openai?: string
  anthropic?: string
  groq?: string
}

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_CONFIGS: Record<ProviderType, AIProviderConfig> = {
  openai: {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1500,
    toolChoice: 'auto',
  },
  anthropic: {
    model: 'claude-3-haiku-20240307',
    temperature: 0.7,
    maxTokens: 1500,
    toolChoice: 'auto',
  },
  groq: {
    model: 'mixtral-8x7b-32768',
    temperature: 0.7,
    maxTokens: 1500,
    toolChoice: 'auto',
  },
}
