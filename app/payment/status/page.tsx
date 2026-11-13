'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentStatusPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [refreshError, setRefreshError] = useState('');

  const checkPaymentStatus = useCallback(async () => {
    setCheckingStatus(true);
    setRefreshError('');
    try {
      const user = await refreshUser();
      if (user.tenantStatus === 'ACTIVE') {
        router.replace('/dashboard/landing-page');
        return;
      }
      if (!user.isPaymentSubmitted || user.paymentStatus !== 'PENDING') {
        router.replace('/payment/submit');
        return;
      }
    } catch (error) {
      console.error('Failed to check payment approval status:', error);
      setRefreshError('Could not check your latest payment status. Please try again.');
    } finally {
      setCheckingStatus(false);
    }
  }, [refreshUser, router]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    checkPaymentStatus();
  }, [authLoading, isAuthenticated, checkPaymentStatus, router]);

  if (authLoading || checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {/* Pending Icon */}
        <div className="text-6xl mb-4">⏳</div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Pending Approval</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-red-800">
            Your payment has been submitted and is waiting for admin verification.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left space-y-2">
          <p className="text-blue-800 text-sm">
            <strong>📌 What happens next?</strong>
          </p>
          <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
            <li>Super Admin will verify your payment</li>
            <li>Your store will be activated within 30 minutes</li>
            <li>You will receive email notification once approved</li>
            <li>You can then login and access the dashboard</li>
          </ul>
        </div>

        {refreshError && (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {refreshError}
          </p>
        )}

        <div className="space-y-3">
          <button
            onClick={checkPaymentStatus}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Check Payment Status
          </button>
          <p className="text-sm text-gray-600">
            Need help? Contact support.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/auth/login');
            }}
            className="text-gray-600 text-sm hover:text-gray-700 underline"
          >
            Logout and try another account
          </button>
        </div>
      </div>
    </div>
  );
}