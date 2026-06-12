import { Package } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-brand/5 flex items-center justify-center mb-4">
        {icon || <Package className="w-7 h-7 text-brand/40" />}
      </div>
      <h3 className="text-base font-semibold text-brand-text mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-brand-muted text-center max-w-xs mb-4">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
