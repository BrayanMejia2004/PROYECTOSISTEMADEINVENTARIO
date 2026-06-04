import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { User, Tenant } from '../types';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  login: (email: string, password: string, tenantSlug: string) => Promise<void>;
  registerTenant: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(ENDPOINTS.PROFILE);
      setUser(data.data.user);
      setTenant(data.data.tenant);
    } catch (_error) {
      // No autenticado, ignorar silenciosamente
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, tenantSlug: string) => {
    const { data } = await api.post(ENDPOINTS.LOGIN, { email, password, tenantSlug });
    setUser(data.data.user);
    setTenant(data.data.tenant);
  };

  const registerTenant = async (registerData: any) => {
    await api.post(ENDPOINTS.REGISTER_TENANT, registerData);
  };

  const logout = async () => {
    try {
      await api.post(ENDPOINTS.LOGOUT);
    } catch (_error) {
      // Ignorar error en logout
    }
    sessionStorage.removeItem('pos-carts');
    sessionStorage.removeItem('pos-cajas');
    setUser(null);
    setTenant(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        loading,
        login,
        registerTenant,
        logout,
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
