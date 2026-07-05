import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface PaginationMeta {
  total: number;
  page: number;
  totalPages?: number;
}

interface PaginationProps {
  meta: PaginationMeta;
  setPage: (page: number) => void;
  label: string;
}

export const Pagination = ({ meta, setPage, label }: PaginationProps) => {
  if (!meta.totalPages || meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
      <p className="text-xs text-brand-muted">
        {formatNumber(meta.total)} {label} — Página {formatNumber(meta.page)} de {formatNumber(meta.totalPages)}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, meta.page - 1))}
          disabled={meta.page <= 1}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setPage(Math.min(meta.totalPages!, meta.page + 1))}
          disabled={meta.page >= meta.totalPages}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
