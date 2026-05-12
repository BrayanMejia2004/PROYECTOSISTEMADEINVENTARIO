import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as salesApi from './api';

export const useSales = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => salesApi.getSales(params),
  });
};

export const useSalesSummary = () => {
  return useQuery({
    queryKey: ['sales', 'summary'],
    queryFn: salesApi.getSalesSummary,
    refetchInterval: 60000,
  });
};

export const useSale = (id: string) => {
  return useQuery({
    queryKey: ['sales', id],
    queryFn: () => salesApi.getSale(id),
    enabled: !!id,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: salesApi.createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'summary'] });
    },
  });
};

export const useRefundSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesApi.refundSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'summary'] });
    },
  });
};

export const useShifts = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: ['cashierShift', 'list', filters],
    queryFn: () => salesApi.getShifts(filters),
  });
};

export const useCurrentShift = () => {
  return useQuery({
    queryKey: ['cashierShift', 'current'],
    queryFn: salesApi.getCurrentShift,
    refetchInterval: 30000,
  });
};

export const useOpenShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (openingBalance: number) => salesApi.openShift(openingBalance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashierShift'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'summary'] });
    },
  });
};

export const useCloseShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shiftId: string) => salesApi.closeShift(shiftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashierShift'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'summary'] });
    },
  });
};

export const useMovements = (shiftId: string) => {
  return useQuery({
    queryKey: ['cashMovements', shiftId],
    queryFn: () => salesApi.getMovements(shiftId),
    enabled: !!shiftId,
  });
};

export const useCreateMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ shiftId, input }: { shiftId: string; input: { type: 'entry' | 'exit'; amount: number; reason: string } }) =>
      salesApi.createMovement(shiftId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashMovements'] });
      queryClient.invalidateQueries({ queryKey: ['cashierShift'] });
    },
  });
};

export { useProducts } from '../inventory/hooks';
