import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import { AuthProvider, BranchProvider } from './context';
import { AppRouter } from './router';
import { getErrorMessage } from './lib/utils';
import './index.css';

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      const axiosErr = error as { response?: { status?: number; data?: { message?: string } } } | undefined;
      const message = axiosErr?.response?.data?.message?.toLowerCase() ?? '';
      if (axiosErr?.response?.status === 403 && message.includes('suscripción')) return;
      toast.error(getErrorMessage(error, 'Ocurrió un error inesperado'));
    },
  }),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BranchProvider>
          <AppRouter />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#0F172A',
                fontSize: '14px',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              },
              error: {
                style: {
                  borderLeft: '4px solid #EF4444',
                },
              },
              success: {
                style: {
                  borderLeft: '4px solid #2D8A4E',
                },
              },
            }}
          />
        </BranchProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
