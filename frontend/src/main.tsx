import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, BranchProvider } from './context';
import { AppRouter } from './router';
import './index.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BranchProvider>
          <AppRouter />
        </BranchProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
