import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { ApiResponse, Sale } from '../../types';

export const getSales = async (params?: {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
  customerName?: string;
  userId?: string;
  search?: string;
  minTotal?: number;
  maxTotal?: number;
  branchId?: string;
}): Promise<ApiResponse<Sale[]>> => {
  const { data } = await api.get<ApiResponse<Sale[]>>(ENDPOINTS.SALES, { params });
  return data;
};

export const getSalesSummary = async (): Promise<ApiResponse<{
  salesToday: number;
  totalRevenue: number;
  avgTicket: number;
  cancelledCount: number;
  totalProductsSold: number;
}>> => {
  const { data } = await api.get(`${ENDPOINTS.SALES}/summary`);
  return data;
};

export const getSale = async (id: string): Promise<ApiResponse<Sale>> => {
  const { data } = await api.get<ApiResponse<Sale>>(`${ENDPOINTS.SALES}/${id}`);
  return data;
};

export const getSalePdf = async (id: string): Promise<Blob> => {
  const { data } = await api.get<Blob>(`${ENDPOINTS.SALES}/${id}/pdf`, {
    responseType: 'blob',
  });
  return data;
};

export const createSale = async (input: any): Promise<ApiResponse<Sale>> => {
  const { data } = await api.post<ApiResponse<Sale>>(ENDPOINTS.SALES, input);
  return data;
};

export const refundSale = async (id: string): Promise<ApiResponse<Sale>> => {
  const { data } = await api.post<ApiResponse<Sale>>(`${ENDPOINTS.SALES}/${id}/refund`);
  return data;
};

export const getSaleByNumber = async (saleNumber: string): Promise<ApiResponse<Sale>> => {
  const { data } = await api.get<ApiResponse<Sale>>(`${ENDPOINTS.SALES}/by-number/${saleNumber}`);
  return data;
};

// Cashier Shifts
export const getShifts = async (params?: {
  branchId?: string;
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<any[]>> => {
  const { data } = await api.get(ENDPOINTS.CASHIER_SHIFTS, { params });
  return data;
};

export const openShift = async (openingBalance: number): Promise<ApiResponse<any>> => {
  const { data } = await api.post(ENDPOINTS.CASHIER_SHIFTS_OPEN, { openingBalance });
  return data;
};

export const closeShift = async (shiftId: string): Promise<ApiResponse<any>> => {
  const { data } = await api.post(`${ENDPOINTS.CASHIER_SHIFTS}/${shiftId}/close`);
  return data;
};

export const getCurrentShift = async (): Promise<ApiResponse<any>> => {
  const { data } = await api.get(ENDPOINTS.CASHIER_SHIFTS_CURRENT);
  return data;
};

export const getShift = async (id: string): Promise<ApiResponse<any>> => {
  const { data } = await api.get(`${ENDPOINTS.CASHIER_SHIFTS}/${id}`);
  return data;
};

export const getMovements = async (shiftId: string): Promise<ApiResponse<any[]>> => {
  const { data } = await api.get(`${ENDPOINTS.CASHIER_SHIFTS}/${shiftId}/movements`);
  return data;
};

export const createMovement = async (shiftId: string, input: { type: 'entry' | 'exit'; amount: number; reason: string }): Promise<ApiResponse<any>> => {
  const { data } = await api.post(`${ENDPOINTS.CASHIER_SHIFTS}/${shiftId}/movements`, input);
  return data;
};
