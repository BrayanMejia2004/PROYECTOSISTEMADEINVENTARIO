import api from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse } from '@/types';
import { Customer } from './types';

export const getCustomers = async (params?: { search?: string; page?: number; limit?: number }): Promise<ApiResponse<Customer[]>> => {
  const { data } = await api.get<ApiResponse<Customer[]>>('/customers', { params });
  return data;
};

export const getCustomer = async (id: string): Promise<ApiResponse<Customer>> => {
  const { data } = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
  return data;
};

export const createCustomer = async (input: Partial<Customer>): Promise<ApiResponse<Customer>> => {
  const { data } = await api.post<ApiResponse<Customer>>('/customers', input);
  return data;
};

export const updateCustomer = async (id: string, input: Partial<Customer>): Promise<ApiResponse<Customer>> => {
  const { data } = await api.patch<ApiResponse<Customer>>(`/customers/${id}`, input);
  return data;
};

export const deleteCustomer = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete<ApiResponse<null>>(`/customers/${id}`);
  return data;
};
