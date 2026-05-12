import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as authApi from './api';
import { useAuth } from '../../hooks/useAuth';

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, password, tenantSlug }: { email: string; password: string; tenantSlug: string }) =>
      authApi.login(email, password, tenantSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useRegisterTenant = () => {
  return useMutation({
    mutationFn: authApi.registerTenant,
  });
};

export const useProfile = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
  });
};
