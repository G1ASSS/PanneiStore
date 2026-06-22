'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { Toast } from '@/hooks/useToast';

export function ToastNotification({ toast }: { toast: Toast | null }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 20px',
            borderRadius: 16,
            background: toast.type === 'success'
              ? 'rgba(16,185,129,0.15)'
              : 'rgba(239,68,68,0.15)',
            border: `1px solid ${toast.type === 'success'
              ? 'rgba(16,185,129,0.4)'
              : 'rgba(239,68,68,0.4)'}`,
            backdropFilter: 'blur(16px)',
            color: toast.type === 'success' ? '#10B981' : '#ef4444',
            fontWeight: 700,
            fontSize: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            minWidth: 220,
          }}
        >
          {toast.type === 'success'
            ? <CheckCircle size={18} />
            : <XCircle size={18} />}
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
