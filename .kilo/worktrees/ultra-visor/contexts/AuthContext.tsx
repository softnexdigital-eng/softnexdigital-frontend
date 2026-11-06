'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { getToken, setToken as saveToken, removeToken, getUserFromToken, isAuthenticated as checkAuth, saveUser } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const existingToken = getToken();
    if (existingToken && checkAuth()) {
      const userData = getUserFromToken(existingToken);
      if (userData) {
        setUser(userData);
        setToken(existingToken);
      }
    }
    setLoading(false);
  }, []);

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
