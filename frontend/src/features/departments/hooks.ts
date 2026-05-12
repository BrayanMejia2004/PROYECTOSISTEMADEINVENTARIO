import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as departmentsApi from './api';

export const useDepartments = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: () => departmentsApi.getDepartments(params),
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: departmentsApi.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { name?: string; parentId?: string; isActive?: boolean } }) =>
      departmentsApi.updateDepartment(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: departmentsApi.deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};
