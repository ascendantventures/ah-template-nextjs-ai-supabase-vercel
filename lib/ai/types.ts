export type AIProvider = 'anthropic' | 'openai'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ConversationContext {
  conversationId: string
  messages: Message[]
  userId: string
}

export interface AnalysisResult {
  summary: string
  insights: string[]
  confidence: number
}
