import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, description?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, description?: string, duration?: number) => void;
    error: (message: string, description?: string, duration?: number) => void;
    warning: (message: string, description?: string, duration?: number) => void;
    info: (message: string, description?: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', description?: string, duration: number = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newToast: ToastItem = { id, type, message, description, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      success: (msg: string, desc?: string, dur?: number) => showToast(msg, 'success', desc, dur),
      error: (msg: string, desc?: string, dur?: number) => showToast(msg, 'error', desc, dur),
      warning: (msg: string, desc?: string, dur?: number) => showToast(msg, 'warning', desc, dur),
      info: (msg: string, desc?: string, dur?: number) => showToast(msg, 'info', desc, dur),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toast }}>
      {children}
      {/* Toast Render Container */}
      <div
        className="fixed bottom-5 right-5 z-[9999] flex max-w-sm flex-col gap-2.5 pointer-events-none"
        aria-live="polite"
        role="region"
        aria-label="Thông báo hệ thống"
      >
        {toasts.map((t) => {
          const isError = t.type === 'error';
          const isSuccess = t.type === 'success';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              role={isError ? 'alert' : 'status'}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-xl p-3.5 shadow-lg border text-sm transition-all duration-200 animate-fade-in-up',
                'bg-surface dark:bg-[#1f2332]',
                isSuccess && 'border-emerald-500/40 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-200',
                isError && 'border-rose-500/40 dark:border-rose-500/50 text-rose-900 dark:text-rose-200',
                isWarning && 'border-amber-500/40 dark:border-amber-500/50 text-amber-900 dark:text-amber-200',
                t.type === 'info' && 'border-sky-500/40 dark:border-sky-500/50 text-sky-900 dark:text-sky-200'
              )}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />}
                {isError && <AlertCircle className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400" />}
                {isWarning && <AlertTriangle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />}
                {t.type === 'info' && <Info className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400" />}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <p className="font-semibold leading-tight text-ink dark:text-slate-100">{t.message}</p>
                {t.description && (
                  <p className="mt-1 text-xs text-ink-muted dark:text-slate-300 leading-snug">{t.description}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 text-ink-muted hover:text-ink dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors"
                aria-label="Đóng thông báo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast phải được sử dụng bên trong ToastProvider');
  }
  return context;
}
