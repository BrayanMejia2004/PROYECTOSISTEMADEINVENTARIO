import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { ApiResponse, User } from '../types';

export const getUsers = async (params?: { role?: string; page?: number; limit?: number }): Promise<ApiResponse<User[]>> => {
  const { data } = await api.get<ApiResponse<User[]>>(ENDPOINTS.USERS, { params });
  return data;
};

export const createUser = async (input: Partial<User>): Promise<ApiResponse<User>> => {
  const { data } = await api.post<ApiResponse<User>>(ENDPOINTS.USERS, input);
  return data;
};

export const updateUser = async (id: string, input: Partial<User>): Promise<ApiResponse<User>> => {
  const { data } = await api.patch<ApiResponse<User>>(`${ENDPOINTS.USERS}/${id}`, input);
  return data;
};

export const deleteUser = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete<ApiResponse<null>>(`${ENDPOINTS.USERS}/${id}`);
  return data;
};
