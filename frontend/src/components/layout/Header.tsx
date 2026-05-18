import { Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBranch } from '../../hooks/useBranch';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header = ({ onMenuToggle }: HeaderProps) => {
  const { user, tenant } = useAuth();
  const { activeBranch } = useBranch();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm px-6 lg:px-8 py-3 flex items-center justify-between border-b border-gray-200/50">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-2 rounded-lg text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-sans font-semibold text-brand-text truncate">
          {tenant?.name}
        </h2>
        {activeBranch && (
          <>
            <span className="text-brand-muted shrink-0">/</span>
            <span className="text-sm text-brand-muted truncate">{activeBranch.name}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-xs font-semibold text-brand">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-brand-text leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-brand-muted capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
