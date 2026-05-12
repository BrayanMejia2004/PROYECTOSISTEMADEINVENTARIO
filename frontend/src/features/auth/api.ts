import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { ApiResponse } from '../../types';
import { User, Tenant } from '../../types';

interface LoginResponse {
  token: string;
  user: User;
  tenant: Tenant;
}

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

export const getProfile = async (): Promise<{ user: User; tenant: Tenant }> => {
  const { data } = await api.get<ApiResponse<{ user: User; tenant: Tenant }>>(ENDPOINTS.PROFILE);
  return data.data;
};
