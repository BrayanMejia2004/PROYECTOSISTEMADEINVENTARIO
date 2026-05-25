import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as inventoryApi from './api';

export const useProducts = (params?: { page?: number; limit?: number; search?: string; branchId?: string }) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => inventoryApi.getProducts(params),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => inventoryApi.getProduct(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Product> }) =>
      inventoryApi.updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useStock = (branchId?: string) => {
  return useQuery({
    queryKey: ['stock', branchId],
    queryFn: () => inventoryApi.getStock(branchId),
  });
};

export const useLowStock = (branchId?: string) => {
  return useQuery({
    queryKey: ['lowStock', branchId],
    queryFn: () => inventoryApi.getLowStock(branchId),
  });
};

export const useOutOfStock = (branchId?: string) => {
  return useQuery({
    queryKey: ['outOfStock', branchId],
    queryFn: () => inventoryApi.getOutOfStock(branchId),
  });
};

export const useInitializeStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.initializeStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
  });
};

export const useImportProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.importProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
