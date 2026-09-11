import { useQuery } from '@tanstack/react-query';
import { getInventoryReport } from './api';

export const useInventorySummary = (branchId?: string) => {
  return useQuery({
    queryKey: ['inventorySummary', branchId],
    queryFn: () => getInventoryReport(branchId),
  });
};