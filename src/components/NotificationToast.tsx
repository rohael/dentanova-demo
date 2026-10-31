import React, { useState, useEffect } from 'react';
import { BellRing, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface ToastData {
  id: string;
  title: string;
  message: string;
  urgent?: boolean;
}

export const NotificationToast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; message: string; urgent?: boolean }>;
      const newToast: ToastData = {
        id: Math.random().toString(),
        title: customEvent.detail.title,
        message: customEvent.detail.message,
        urgent: customEvent.detail.urgent,
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 3));

      // Automatyczne usuwanie po 6 sekundach
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 6000);
    };

    window.addEventListener('dentanova:notification', handleNotification);
    return () => window.removeEventListener('dentanova:notification', handleNotification);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300 ${
            t.urgent
              ? 'bg-rose-950/90 text-rose-100 border-rose-500/50'
              : 'bg-slate-900/95 text-white border-slate-700'
          }`}
        >
          <div
            className={`p-2 rounded-xl shrink-0 ${
              t.urgent ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {t.urgent ? <AlertTriangle className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
          </div>

          <div className="flex-1">
            <h4 className="text-xs font-bold">{t.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{t.message}</p>
          </div>

          <button
            onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
