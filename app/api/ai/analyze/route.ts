import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient, getOpenAIClient, provider, model } from '@/lib/ai/client'
import type { AnalysisResult } from '@/lib/ai/types'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { text, instruction } = await req.json()
    if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 })

    const prompt = `${instruction ?? 'Analyze the following text and provide a summary and key insights.'}\n\nText:\n${text}\n\nRespond as JSON: {"summary": "...", "insights": ["...", "..."], "confidence": 0.9}`

    let result: AnalysisResult

    if (provider === 'anthropic') {
      const response = await getAnthropicClient().messages.create({
        model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      })
      const content = (response.content[0] as { type: 'text'; text: string }).text
      result = JSON.parse(content) as AnalysisResult
    } else {
      const response = await getOpenAIClient().chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      })
      result = JSON.parse(response.choices[0].message.content ?? '{}') as AnalysisResult
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
