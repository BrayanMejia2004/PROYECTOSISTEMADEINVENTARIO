import api from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse, Department } from '@/types';

export const getDepartments = async (params?: { page?: number; limit?: number }): Promise<ApiResponse<Department[]>> => {
  const { data } = await api.get<ApiResponse<Department[]>>(ENDPOINTS.DEPARTMENTS, { params });
  return data;
};

export const createDepartment = async (input: { name: string; parentId?: string }): Promise<ApiResponse<Department>> => {
  const { data } = await api.post<ApiResponse<Department>>(ENDPOINTS.DEPARTMENTS, input);
  return data;
};

export const updateDepartment = async (id: string, input: { name?: string; parentId?: string; isActive?: boolean }): Promise<ApiResponse<Department>> => {
  const { data } = await api.patch<ApiResponse<Department>>(`${ENDPOINTS.DEPARTMENTS}/${id}`, input);
  return data;
};

export const deleteDepartment = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete<ApiResponse<null>>(`${ENDPOINTS.DEPARTMENTS}/${id}`);
  return data;
};
