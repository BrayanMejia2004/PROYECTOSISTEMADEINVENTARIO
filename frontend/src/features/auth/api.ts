import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { ApiResponse, LoginResponse, RefreshResponse } from '../../types';

interface RegisterTenantInput {
  tenantName: string;
  tenantSlug: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  branchName: string;
}

export const login = async (email: string, password: string, tenantSlug: string): Promise<LoginResponse> => {
  const { data } = await api.post<ApiResponse<LoginResponse>>(ENDPOINTS.LOGIN, {
    email,
    password,
    tenantSlug,
  });
  return data.data;
};

export const registerTenant = async (input: RegisterTenantInput): Promise<LoginResponse> => {
  const { data } = await api.post<ApiResponse<LoginResponse>>(ENDPOINTS.REGISTER_TENANT, input);
  return data.data;
};

export const refreshToken = async (): Promise<RefreshResponse> => {
  const { data } = await api.post<ApiResponse<RefreshResponse>>(ENDPOINTS.REFRESH_TOKEN);
  return data.data;
};

export const getProfile = async (): Promise<{ user: import('../../types').User; tenant: import('../../types').Tenant }> => {
  const { data } = await api.get<ApiResponse<{ user: import('../../types').User; tenant: import('../../types').Tenant }>>(ENDPOINTS.PROFILE);
  return data.data;
};

export const logout = async (): Promise<void> => {
  await api.post(ENDPOINTS.LOGOUT);
};
