import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';

export const getSalesReport = async (startDate: string, endDate: string, branchId?: string) => {
  const { data } = await api.get(ENDPOINTS.REPORTS_SALES, { params: { startDate, endDate, branchId } });
  return data;
};

export const getInventoryReport = async (branchId?: string) => {
  const { data } = await api.get(ENDPOINTS.REPORTS_INVENTORY, { params: { branchId } });
  return data;
};

export const getBranchComparison = async (startDate: string, endDate: string) => {
  const { data } = await api.get(ENDPOINTS.REPORTS_BRANCHES, { params: { startDate, endDate } });
  return data;
};

export const getProfitabilityReport = async (startDate?: string, endDate?: string, branchId?: string) => {
  const { data } = await api.get(ENDPOINTS.REPORTS_PROFITABILITY, { params: { startDate, endDate, branchId } });
  return data;
};
