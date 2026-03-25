'use client'
import { useState, useRef, useEffect } from 'react'
import type { Message } from '@/lib/ai/types'

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json() as { text?: string; error?: string }
      if (data.error) throw new Error(data.error)
      const assistantMsg: Message = { role: 'assistant', content: data.text ?? '' }
      setMessages([...newMessages, assistantMsg])
    } catch (err) {
      const errorMsg: Message = {
        role: 'assistant',
        content: err instanceof Error ? `Error: ${err.message}` : 'Something went wrong.',
      }
      setMessages([...newMessages, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && (
          <p style={{ color: '#9CA3AF', textAlign: 'center', marginTop: '40px' }}>Start a conversation...</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            padding: '12px 16px',
            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            background: msg.role === 'user' ? '#2563EB' : '#F3F4F6',
            color: msg.role === 'user' ? '#fff' : '#111827',
            fontSize: '15px',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            maxWidth: '80%',
            padding: '12px 16px',
            borderRadius: '16px 16px 16px 4px',
            background: '#F3F4F6',
            color: '#6B7280',
            fontSize: '15px',
          }}>
            <span style={{ opacity: 0.6 }}>▊</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} style={{ padding: '16px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '15px', outline: 'none' }}
        />
        <button type="submit" disabled={loading || !input.trim()} style={{
          padding: '12px 20px', borderRadius: '12px', background: '#2563EB', color: '#fff',
          border: 'none', cursor: 'pointer', fontWeight: 600, opacity: loading ? 0.6 : 1,
        }}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
