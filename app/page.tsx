'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import OriginalTheme from '@/components/landing/OriginalTheme';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const parsed = JSON.parse(userStr);
            if (parsed.role === 'SUPER_ADMIN') {
              router.push('/dashboard');
              return;
            }
          }
        } catch {}
      }
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-sm h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return <OriginalTheme />;
}