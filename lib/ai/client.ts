import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

export type AIProvider = 'anthropic' | 'openai'

const provider = (process.env.AI_PROVIDER ?? 'anthropic') as AIProvider
const model = process.env.AI_MODEL ?? (provider === 'anthropic' ? 'claude-3-5-haiku-20241022' : 'gpt-4o-mini')

let _anthropic: Anthropic | null = null
let _openai: OpenAI | null = null

export function getAnthropicClient(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _anthropic
}

export function getOpenAIClient(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

export { provider, model }
