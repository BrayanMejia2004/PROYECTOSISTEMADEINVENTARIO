import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api, { setAccessToken } from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import { User, Tenant, LoginResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  login: (email: string, password: string, tenantSlug: string) => Promise<void>;
  registerTenant: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshTenant: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const { data } = await api.post(ENDPOINTS.REFRESH_TOKEN);
        if (data.data?.accessToken) {
          setAccessToken(data.data.accessToken);
          setUser(data.data.user);
          setTenant(data.data.tenant);
        }
      } catch {
        // No hay sesión
      } finally {
        setLoading(false);
      }
    };
    tryRefresh();
  }, []);

  const login = useCallback(async (email: string, password: string, tenantSlug: string) => {
    const { data } = await api.post<{ success: boolean; data: LoginResponse }>(ENDPOINTS.LOGIN, {
      email,
      password,
      tenantSlug,
    });
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    setTenant(data.data.tenant);
  }, []);

  const registerTenant = useCallback(async (registerData: any) => {
    const { data } = await api.post<{ success: boolean; data: LoginResponse }>(ENDPOINTS.REGISTER_TENANT, registerData);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    setTenant(data.data.tenant);
  }, []);

  const refreshTenant = useCallback(async () => {
    try {
      const { data } = await api.get(ENDPOINTS.TENANT);
      if (data.data) {
        setTenant(data.data);
      }
    } catch {
      // Ignorar error
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post(ENDPOINTS.LOGOUT);
    } catch {
      // Ignorar error en logout
    }
    setAccessToken(null);
    sessionStorage.removeItem('pos-carts');
    sessionStorage.removeItem('pos-cajas');
    setUser(null);
    setTenant(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        loading,
        login,
        registerTenant,
        logout,
        refreshTenant,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
