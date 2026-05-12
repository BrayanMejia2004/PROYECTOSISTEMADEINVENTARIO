import { X, AlertTriangle, RotateCcw, CheckCircle2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success';
  isLoading?: boolean;
}

const variantStyles = {
  danger: {
    icon: AlertTriangle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    buttonBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    buttonText: 'text-white',
  },
  warning: {
    icon: RotateCcw,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    buttonBg: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
    buttonText: 'text-white',
  },
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    buttonBg: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    buttonText: 'text-white',
  },
};

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) => {
  if (!open) return null;

  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-6 h-6 ${styles.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-sans font-bold text-brand-text">{title}</h3>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-text shrink-0 ml-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-brand-muted leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-brand-muted hover:text-brand-text hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.buttonBg} ${styles.buttonText}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {confirmText}
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
