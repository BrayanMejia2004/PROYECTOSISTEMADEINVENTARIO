import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { ApiResponse, Supplier } from '../types';

export const getSuppliers = async (params?: { page?: number; limit?: number }): Promise<ApiResponse<Supplier[]>> => {
  const { data } = await api.get<ApiResponse<Supplier[]>>(ENDPOINTS.SUPPLIERS, { params });
  return data;
};

export const createSupplier = async (input: Partial<Supplier>): Promise<ApiResponse<Supplier>> => {
  const { data } = await api.post<ApiResponse<Supplier>>(ENDPOINTS.SUPPLIERS, input);
  return data;
};

export const updateSupplier = async (id: string, input: Partial<Supplier>): Promise<ApiResponse<Supplier>> => {
  const { data } = await api.patch<ApiResponse<Supplier>>(`${ENDPOINTS.SUPPLIERS}/${id}`, input);
  return data;
};

export const deleteSupplier = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete<ApiResponse<null>>(`${ENDPOINTS.SUPPLIERS}/${id}`);
  return data;
};
