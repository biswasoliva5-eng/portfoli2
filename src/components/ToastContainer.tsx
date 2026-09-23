import React from 'react';
import { usePortfolio } from '../context/PortfolioContext.js';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = usePortfolio();

  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 shadow-xl border text-xs tracking-wide transition-all ${
            toast.type === 'error'
              ? 'bg-[#1a1414] border-red-800 text-red-200'
              : toast.type === 'info'
              ? 'bg-[#14181f] border-blue-800 text-blue-200'
              : 'bg-[#141a14] border-green-800 text-green-200'
          }`}
        >
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />}
          <div className="flex-1 leading-relaxed">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-neutral-400 hover:text-white shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
