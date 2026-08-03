import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
 type ReactNode,
} from 'react';

import axios from 'axios';
import axiosPublic, { refreshAccessToken } from '../../URI/axiosPublic';


interface User {
  _id: string;
  name: string;
  email: string;
  role: 'hr' | 'employee';
  department?: string;
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isHR: boolean;
  isEmployee: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const meApi = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
});

meApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await meApi.get('/auth/me');
      setUser(res.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        try {
          await refreshAccessToken();
          const retryRes = await meApi.get('/auth/me');
          setUser(retryRes.data);
        } catch {
          setUser(null);
          localStorage.removeItem('accessToken');
        }
      } else {
        setUser(null);
        localStorage.removeItem('accessToken');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await axiosPublic.post('/auth/login', { email, password });
    const { accessToken, user: loggedInUser } = res.data;
    localStorage.setItem('accessToken', accessToken);
    setUser(loggedInUser);
  };

  const logOut = async () => {
    try {
      await axiosPublic.post('/auth/logout');
    } catch {
      // backend fail করলেও client session ক্লিয়ার করে দাও
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isHR: user?.role === 'hr',
        isEmployee: user?.role === 'employee',
        isLoading,
        login,
        logOut,
        refetchUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};