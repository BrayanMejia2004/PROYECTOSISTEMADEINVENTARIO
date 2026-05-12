import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { User, Tenant } from '../types';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, tenantSlug: string) => Promise<void>;
  registerTenant: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(ENDPOINTS.PROFILE);
      setUser(data.data.user);
      setTenant(data.data.tenant);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, tenantSlug: string) => {
    const { data } = await api.post(ENDPOINTS.LOGIN, { email, password, tenantSlug });
    localStorage.setItem('token', data.data.token);
    setToken(data.data.token);
    setUser(data.data.user);
    setTenant(data.data.tenant);
  };

  const registerTenant = async (data: any) => {
    await api.post(ENDPOINTS.REGISTER_TENANT, data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setTenant(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        token,
        loading,
        login,
        registerTenant,
        logout,
        isAuthenticated: !!token,
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
