import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as categoriesApi from './api';

export const useCategories = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoriesApi.getCategories(params),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { name?: string; parentId?: string; isActive?: boolean } }) =>
      categoriesApi.updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
