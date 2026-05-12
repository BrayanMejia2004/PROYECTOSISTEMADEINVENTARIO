import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { ApiResponse, Category } from '../../types';

export const getCategories = async (params?: { page?: number; limit?: number }): Promise<ApiResponse<Category[]>> => {
  const { data } = await api.get<ApiResponse<Category[]>>(ENDPOINTS.CATEGORIES, { params });
  return data;
};

export const createCategory = async (input: { name: string; parentId?: string }): Promise<ApiResponse<Category>> => {
  const { data } = await api.post<ApiResponse<Category>>(ENDPOINTS.CATEGORIES, input);
  return data;
};

export const updateCategory = async (id: string, input: { name?: string; parentId?: string; isActive?: boolean }): Promise<ApiResponse<Category>> => {
  const { data } = await api.patch<ApiResponse<Category>>(`${ENDPOINTS.CATEGORIES}/${id}`, input);
  return data;
};

export const deleteCategory = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete<ApiResponse<null>>(`${ENDPOINTS.CATEGORIES}/${id}`);
  return data;
};
