import { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CartProvider } from '@/context/CartContext';
import { MobileBlocker } from './MobileBlocker';
import { useAuth } from '@/hooks/useAuth';

export const AppShell = () => {
  const { tenant } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarDesktopOpen, setSidebarDesktopOpen] = useState(true);

  const brandStyle = useMemo(() => ({
    '--color-brand': tenant?.brandColor || '#2D8A4E',
    '--color-brand-light': tenant?.brandColorLight || '#6ABF8A',
    '--color-brand-dark': tenant?.brandColorDark || '#1E5A32',
  } as React.CSSProperties), [tenant?.brandColor, tenant?.brandColorLight, tenant?.brandColorDark]);

  return (
    <MobileBlocker>
      <div className="min-h-screen bg-brand-bg flex" style={brandStyle}>
        <Sidebar isOpen={sidebarOpen} desktopOpen={sidebarDesktopOpen} onClose={() => setSidebarOpen(false)} />
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${sidebarDesktopOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
          <Header onMenuToggle={() => setSidebarOpen((prev) => !prev)} onDesktopMenuToggle={() => setSidebarDesktopOpen((prev) => !prev)} />
          <main className="flex-1 p-6 lg:p-8">
            <CartProvider>
              <Outlet />
            </CartProvider>
          </main>
        </div>
      </div>
    </MobileBlocker>
  );
};
