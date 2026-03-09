'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import Toast from '@/components/ui/Toast';

export default function RecalculateButton() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/recalculate', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Recalculation failed');
      setToast({ message: 'Rankings recalculated successfully', type: 'success' });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Recalculation failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
        onClick={handleRecalculate}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Recalculating...' : 'Recalculate Rankings'}
      </motion.button>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
