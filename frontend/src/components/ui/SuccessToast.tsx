import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessToastProps {
  open: boolean;
  onClose: () => void;
  message: string;
  duration?: number;
}

export const SuccessToast = ({ open, onClose, message, duration = 3000 }: SuccessToastProps) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, onClose, duration]);

  if (!open) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] animate-slide-down">
      <div className="bg-white rounded-xl border border-green-200 shadow-lg p-4 flex items-center gap-3 min-w-[300px]">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </div>
        <p className="text-sm font-medium text-brand-text flex-1">{message}</p>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-text">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
