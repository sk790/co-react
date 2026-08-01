import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore } from '../store/toastStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[999999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const bgStyles =
          t.type === 'success'
            ? 'bg-emerald-600 shadow-emerald-600/20'
            : t.type === 'error'
            ? 'bg-rose-600 shadow-rose-600/20'
            : t.type === 'warning'
            ? 'bg-amber-600 shadow-amber-600/20'
            : 'bg-indigo-600 shadow-indigo-600/20';

        const Icon =
          t.type === 'success'
            ? CheckCircle2
            : t.type === 'error'
            ? AlertCircle
            : t.type === 'warning'
            ? AlertTriangle
            : Info;

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${bgStyles}`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-2 p-0.5 hover:opacity-80 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
