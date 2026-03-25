import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatWindow } from '@/components/ChatWindow'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  return (
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600 }}>__PROJECT_NAME__ AI</h1>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ChatWindow />
      </div>
    </main>
  )
}
