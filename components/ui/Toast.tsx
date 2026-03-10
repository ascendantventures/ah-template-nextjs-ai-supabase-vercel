'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (opts: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((opts: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...opts, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const iconMap = {
    success: <CheckCircle2 size={20} strokeWidth={2} style={{ color: '#22C55E' }} />,
    warning: <AlertTriangle size={20} strokeWidth={2} style={{ color: '#F59E0B' }} />,
    error: <XCircle size={20} strokeWidth={2} style={{ color: '#EF4444' }} />,
    info: <Info size={20} strokeWidth={2} style={{ color: '#06B6D4' }} />,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 48 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                backgroundColor: '#1E1E1E',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 12,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                padding: '16px 20px',
                minWidth: 320,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flexShrink: 0, marginTop: 1 }}>{iconMap[t.type]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#F4F4F5' }}>{t.title}</div>
                {t.message && <div style={{ fontSize: 14, color: '#A1A1AA', marginTop: 2 }}>{t.message}</div>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                style={{ color: '#71717A', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

// Legacy default export for compatibility
export default function Toast() { return null; }
