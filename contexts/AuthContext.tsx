'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { getToken, setToken as saveToken, removeToken, getUserFromToken, isAuthenticated as checkAuth, saveUser } from '@/lib/auth';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const response = await api.get('/auth/me');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to refresh user status');
    }

    const freshUser = response.data.data as User;
    setUser(freshUser);
    saveUser(freshUser);
    return freshUser;
  }, []);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      const existingToken = getToken();
      if (existingToken && checkAuth()) {
        const userData = getUserFromToken(existingToken);
        if (userData) {
          setUser(userData);
          setToken(existingToken);
          try {
            await refreshUser();
          } catch (error) {
            console.error('Failed to refresh authenticated user:', error);
          }
        }
      }
      if (active) setLoading(false);
    };

    loadUser();
    return () => {
      active = false;
    };
  }, [refreshUser]);

  const login = (newToken: string, userData?: User) => {
    saveToken(newToken);
    if (userData) {
      // Use full user data from API response (includes tenantStatus, paymentStatus, etc.)
      setUser(userData);
      saveUser(userData);
    } else {
      // Fallback to decoding from token
      const decodedUser = getUserFromToken(newToken);
      if (decodedUser) {
        setUser(decodedUser);
      }
    }
    setToken(newToken);
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setToken(null);
    // Clear stored user data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
