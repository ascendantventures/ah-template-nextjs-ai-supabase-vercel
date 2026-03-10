import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#09090B' }}>
      <Sidebar role={profile?.role || 'fan'} />
      <main style={{ flex: 1, minHeight: '100vh', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
