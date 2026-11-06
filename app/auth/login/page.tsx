'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { showToast } from '@/lib/toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import LoadingButton from '@/components/loading/LoadingButton';
import { AuthResponse, LoginResponse, RegisterResponse } from '@/types';

type OtpFormData = {
  email: string;
  otp: string;
};

type PasswordFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('password');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const otpForm = useForm<OtpFormData>();
  const passwordForm = useForm<PasswordFormData>();

  // ─── OTP Login ────────────────────────────────────────

  const handleEmailSubmit = async (data: OtpFormData) => {
    setLoading(true);
    try {
      const response = await api.post<RegisterResponse>('/auth/register', {
        email: data.email,
      });

      if (response.data.success) {
        setEmail(data.email);
        setStep('otp');
        showToast.success('OTP sent! Check console or terminal for the code.');
      } else {
        showToast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to send OTP. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (data: OtpFormData) => {
    setLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/verify', {
        email,
        otp: data.otp,
      }, { validateStatus: (status) => status < 500 });

      if (response.data.success && response.data.data?.token) {
        const userData = response.data.data.user;
        login(response.data.data.token, userData);
        showToast.success('Login successful!');
        
        // Route based on tenant status
        if (userData.role === 'SUPER_ADMIN') {
          router.push('/dashboard');
        } else if (userData.tenantStatus === 'ACTIVE') {
          router.push('/dashboard');
        } else if (userData.tenantStatus === 'PENDING_APPROVAL' && userData.paymentStatus === 'PENDING' && !userData.isPaymentSubmitted) {
          router.push('/payment/submit');
        } else if (userData.tenantStatus === 'PENDING_APPROVAL') {
          router.push('/payment/status');
        } else {
          router.push('/dashboard');
        }
      } else {
        showToast.error(response.data.message || 'Invalid or expired OTP. Please try again.');
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/resend-otp', { email },
        { validateStatus: (status) => status < 500 });
      if (response.data.success) {
        showToast.success('OTP resent! Check the terminal for the new code.');
      } else {
        showToast.error(response.data.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setEmail('');
    otpForm.reset();
  };

  // ─── Password Login ────────────────────────────────────

  const handlePasswordLogin = async (data: PasswordFormData) => {
    setLoading(true);
    try {
      const response = await api.post<LoginResponse>('/auth/login-password', {
        email: data.email,
        password: data.password,
      }, { validateStatus: (status) => status < 500 });

      if (response.data.success && response.data.data?.token) {
        const userData = response.data.data.user;
        login(response.data.data.token, userData);
        showToast.success(`Welcome ${userData.role}!`);
        
        // Route based on tenant status
        if (userData.role === 'SUPER_ADMIN') {
          router.push('/dashboard');
        } else if (userData.tenantStatus === 'ACTIVE') {
          router.push('/dashboard');
        } else if (userData.tenantStatus === 'PENDING_APPROVAL' && userData.paymentStatus === 'PENDING' && !userData.isPaymentSubmitted) {
          router.push('/payment/submit');
        } else if (userData.tenantStatus === 'PENDING_APPROVAL') {
          router.push('/payment/status');
        } else {
          router.push('/dashboard');
        }
      } else {
        showToast.error(response.data.message || 'Invalid email or password.');
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Login failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const switchToOtp = () => {
    setLoginMethod('otp');
    setStep('email');
    setEmail('');
    otpForm.reset();
    passwordForm.reset();
  };

  const switchToPassword = () => {
    setLoginMethod('password');
    setStep('email');
    setEmail('');
    otpForm.reset();
    passwordForm.reset();
  };

  // ─── Render ────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back For Login
          </h1>
          <p className="text-gray-600">
            {loginMethod === 'password'
              ? 'Login with your email & password'
              : step === 'email'
                ? 'Enter your email to receive an OTP For Free Registration'
                : 'Enter the 6-digit OTP sent to your email'}
          </p>
        </div>

        {/* ── Login Method Tabs ── */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={switchToPassword}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
              loginMethod === 'password'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={switchToOtp}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
              loginMethod === 'otp'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            OTP Login
          </button>
        </div>

        {/* ── Password Login Form ── */}
        {loginMethod === 'password' && (
          <form onSubmit={passwordForm.handleSubmit(handlePasswordLogin)} className="space-y-6">
            <div>
              <label htmlFor="p-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                {...passwordForm.register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                id="p-email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
              />
              {passwordForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                {...passwordForm.register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                type="password"
                id="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
              {passwordForm.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            {/* Super Admin Hint
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-700">
              <p className="font-semibold mb-1">🔐 Super Admin Login (seed data):</p>
              <p>Email: <span className="font-mono">fahiomnuman87@gmail.com</span></p>
              <p>Password: <span className="font-mono">Admin@123</span></p>
            </div> */}
          </form>
        )}

        {/* ── OTP Login Forms ── */}
        {loginMethod === 'otp' && step === 'email' && (
          <form onSubmit={otpForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
            <div>
              <label htmlFor="o-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                {...otpForm.register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                id="o-email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
              />
              {otpForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">{otpForm.formState.errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {loginMethod === 'otp' && step === 'otp' && (
          <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                OTP Code (check terminal)
              </label>
              <input
                {...otpForm.register('otp', {
                  required: 'OTP is required',
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: 'OTP must be 6 digits',
                  },
                })}
                type="text"
                id="otp"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="000000"
              />
              {otpForm.formState.errors.otp && (
                <p className="mt-1 text-sm text-red-600">{otpForm.formState.errors.otp.message}</p>
              )}
              <p className="mt-2 text-sm text-gray-600">
                Sent to: <span className="font-medium">{email}</span>
              </p>
              <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                💡 OTP কোডটি backend চলা terminal এ দেখুন
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={handleBackToEmail}
                className="text-gray-600 hover:text-gray-700 font-medium"
              >
                Change Email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
