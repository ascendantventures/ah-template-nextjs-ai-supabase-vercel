import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ color: '#71717A', marginBottom: 16 }}>{icon}</div>
      <h4 style={{ fontSize: 20, fontWeight: 600, color: '#A1A1AA', margin: '0 0 8px' }}>{title}</h4>
      <p style={{ fontSize: 16, color: '#71717A', margin: 0 }}>{description}</p>
      {action && <div style={{ marginTop: 24 }}>{action}</div>}
    </div>
  );
}
