import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient, getOpenAIClient, provider, model } from '@/lib/ai/client'
import type { Message } from '@/lib/ai/types'

// Note: no edge runtime — Supabase SSR client requires cookies() from next/headers
// which is incompatible with edge runtime. Non-streaming response used instead.

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages } = await req.json() as { messages: Message[], conversationId?: string }
    if (!messages?.length) return NextResponse.json({ error: 'messages required' }, { status: 400 })

    if (provider === 'anthropic') {
      const response = await getAnthropicClient().messages.create({
        model,
        max_tokens: 2048,
        messages: messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        system: messages.find(m => m.role === 'system')?.content,
      })
      const text = (response.content[0] as { type: 'text'; text: string }).text
      return NextResponse.json({ text })
    } else {
      const response = await getOpenAIClient().chat.completions.create({
        model,
        messages: messages as { role: 'user' | 'assistant' | 'system'; content: string }[],
      })
      const text = response.choices[0].message.content ?? ''
      return NextResponse.json({ text })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'AI error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
