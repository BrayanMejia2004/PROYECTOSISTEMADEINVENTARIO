import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CartProvider } from '@/context/CartContext';

export const AppShell = () => {
  return (
    <div className="min-h-screen bg-brand-bg flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8">
          <CartProvider>
            <Outlet />
          </CartProvider>
        </main>
      </div>
    </div>
  );
};
