import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-brand-text mb-1">Error al cargar datos</h3>
      <p className="text-sm text-brand-muted mb-4 text-center max-w-xs">
        {message || 'Ocurrió un error inesperado. Intenta de nuevo.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Intentar de nuevo
        </button>
      )}
    </div>
  </div>
);
