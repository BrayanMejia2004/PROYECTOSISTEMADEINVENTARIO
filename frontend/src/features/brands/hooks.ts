import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as brandsApi from './api';

export const useBrands = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: () => brandsApi.getBrands(params),
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: brandsApi.createBrand,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['brands'] }); },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { name?: string; isActive?: boolean } }) =>
      brandsApi.updateBrand(id, input),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['brands'] }); },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: brandsApi.deleteBrand,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['brands'] }); },
  });
};
