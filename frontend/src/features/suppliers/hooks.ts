import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as supplierApi from './api';
import type { Supplier } from '../../types';

export const useSuppliers = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => supplierApi.getSuppliers(params),
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supplierApi.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Supplier> }) =>
      supplierApi.updateSupplier(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => supplierApi.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
};
