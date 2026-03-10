import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export default function LoadingSpinner({ size = 24 }: LoadingSpinnerProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Loader2 size={size} strokeWidth={2} style={{ color: '#8B5CF6', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
