import { jwtDecode } from 'jwt-decode';
import { User } from '@/types';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const saveUser = (user: any): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
};

export const getSavedUser = (): any | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch {}
  return null;
};

export const getUserFromToken = (token: string): User | null => {
  try {
    const decoded: any = jwtDecode(token);
    // First try to get the full user from localStorage
    const savedUser = getSavedUser();
    if (savedUser && savedUser.id === decoded.id) {
      // Return full user data from localStorage (has tenantStatus, paymentStatus, etc.)
      return savedUser;
    }
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId,
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};
