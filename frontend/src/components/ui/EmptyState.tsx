import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-brand" />
    </div>
    <h3 className="text-lg font-semibold text-brand-text mb-1">{title}</h3>
    {description && <p className="text-sm text-brand-muted mb-4 text-center max-w-xs">{description}</p>}
    {action && (
      <button
        onClick={action.onClick}
        className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium"
      >
        {action.label}
      </button>
    )}
  </div>
);
