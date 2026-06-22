import { useState } from 'react';

export type ToastType = 'success' | 'error';

export interface Toast {
  type: ToastType;
  msg: string;
}

export function useToast(durationMs = 3000) {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: ToastType, msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), durationMs);
  };

  const success = (msg: string) => showToast('success', msg);
  const error = (msg: string) => showToast('error', msg);

  return { toast, showToast, success, error };
}
