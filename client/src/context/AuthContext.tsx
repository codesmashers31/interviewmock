import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '../lib/axios';


export interface User {
  id?: string;
  userId?: string;
  email: string;
  userType: string;
  name?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, userType: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  fetchProfile: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

interface Props { children: ReactNode; }

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Attach token to axios defaults if present
  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axios.defaults.headers.common['Authorization'];
  }, [token]);

  // Global axios response interceptor — handle 401
  useEffect(() => {
    const id = axios.interceptors.response.use(
      res => res,
      (err) => {
        if (err?.response?.status === 401) {
          // token expired/invalid
          logout();
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On app load: if token exists, fetch profile
  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          await fetchProfile();
        } catch (e) {
          // fetchProfile handles logout on failure
        }
      }
      setIsLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  const fetchProfile = async (): Promise<User | null> => {
    try {
      const response = await axios.get('/api/auth/profile');
      const userData: User = response.data.user;

      // Normalize userId or _id to id for consistency
      const normalizedUser = {
        ...userData,
        id: userData.userId || (userData as any)._id || userData.id,
      };

      setUser(normalizedUser);
      return normalizedUser;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        // invalid token — clear everything
        logout();
        return null;
      }
      console.error('Failed to fetch profile', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      if (!newToken || !userData) throw new Error('Invalid response from server');

      // Normalize userId to id for consistency
      const normalizedUser = {
        ...userData,
        id: userData.userId || userData.id,
      };

      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(normalizedUser);
      setIsLoading(false);
      return normalizedUser;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Login failed';
      throw new Error(msg);
    }
  };

  const register = async (email: string, password: string, userType: string, name: string) => {
    try {
      await axios.post('/api/auth/register', { email, password, userType, name });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsLoading(false);
  };

  const value: AuthContextType = { user, token, login, register, logout, isLoading, fetchProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
