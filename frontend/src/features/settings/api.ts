import api from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, Tenant } from '@/types';

export const getTenant = async (): Promise<ApiResponse<Tenant>> => {
  const { data } = await api.get<ApiResponse<Tenant>>(ENDPOINTS.TENANT);
  return data;
};

export const updateTenantSettings = async (input: any): Promise<ApiResponse<Tenant>> => {
  const { data } = await api.patch<ApiResponse<Tenant>>(ENDPOINTS.TENANT_SETTINGS, input);
  return data;
};

export const getBranches = async (): Promise<ApiResponse<any[]>> => {
  const { data } = await api.get<ApiResponse<any[]>>(ENDPOINTS.BRANCHES);
  return data;
};

export const createBranch = async (input: any): Promise<ApiResponse<any>> => {
  const { data } = await api.post<ApiResponse<any>>(ENDPOINTS.BRANCHES, input);
  return data;
};

export const updateBranch = async (id: string, input: any): Promise<ApiResponse<any>> => {
  const { data } = await api.patch<ApiResponse<any>>(`${ENDPOINTS.BRANCHES}/${id}`, input);
  return data;
};

export const deleteBranch = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete<ApiResponse<null>>(`${ENDPOINTS.BRANCHES}/${id}`);
  return data;
};

export const uploadLogo = async (file: File): Promise<ApiResponse<Tenant>> => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post<ApiResponse<Tenant>>(`${ENDPOINTS.TENANT}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
