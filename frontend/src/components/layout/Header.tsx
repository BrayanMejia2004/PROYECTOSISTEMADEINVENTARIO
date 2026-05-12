import { useAuth } from '../../hooks/useAuth';
import { useBranch } from '../../hooks/useBranch';

export const Header = () => {
  const { user, tenant } = useAuth();
  const { activeBranch } = useBranch();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm px-6 lg:px-8 py-3 flex items-center justify-between border-b border-gray-200/50">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-sans font-semibold text-brand-text">
          {tenant?.name}
        </h2>
        {activeBranch && (
          <>
            <span className="text-brand-muted">/</span>
            <span className="text-sm text-brand-muted">{activeBranch.name}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
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
