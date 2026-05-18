import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { ApiResponse, Brand } from '../../types';

export const getBrands = async (params?: { page?: number; limit?: number }): Promise<ApiResponse<Brand[]>> => {
  const { data } = await api.get<ApiResponse<Brand[]>>(ENDPOINTS.BRANDS, { params });
  return data;
};

export const createBrand = async (input: { name: string }): Promise<ApiResponse<Brand>> => {
  const { data } = await api.post<ApiResponse<Brand>>(ENDPOINTS.BRANDS, input);
  return data;
};

export const updateBrand = async (id: string, input: { name?: string; isActive?: boolean }): Promise<ApiResponse<Brand>> => {
  const { data } = await api.patch<ApiResponse<Brand>>(`${ENDPOINTS.BRANDS}/${id}`, input);
  return data;
};

export const deleteBrand = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete<ApiResponse<null>>(`${ENDPOINTS.BRANDS}/${id}`);
  return data;
};
