'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';

const BUSINESS_TYPES = [
  'SUPERMARKET',
  'GROCERY',
  'RETAIL',
  'RESTAURANT',
  'CAFE',
  'CLOUD_KITCHEN',
  'TAILORING',
  'BOUTIQUE',
  'GARMENT_WORKSHOP',
  'UNIFORM_MANUFACTURER',
] as const;

type BusinessType = (typeof BUSINESS_TYPES)[number];
const isBusinessType = (value: string): value is BusinessType =>
  (BUSINESS_TYPES as readonly string[]).includes(value);

const getApiErrorMessage = (error: unknown, fallback: string) =>
  isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || fallback : fallback;

type BusinessTypeFormData = {
  businessType: BusinessType;
  name: string;
  companyName: string;
  tenantEmail: string;
  phone: string;
  phone2: string;
  address: string;
  timezone: string;
  currency: string;
  currencySymbol: string;
  taxPercentage: number;
  deliveryCharge: number;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [step, setStep] = useState<'business-type' | 'profile' | 'complete'>('business-type');
  const [businessType, setBusinessType] = useState<BusinessType>('RETAIL');
  const [form, setForm] = useState<BusinessTypeFormData>({
    businessType: 'RETAIL',
    name: '',
    companyName: '',
    tenantEmail: '',
    phone: '',
    phone2: '',
    address: '',
    timezone: 'Asia/Dhaka',
    currency: 'BDT',
    currencySymbol: '৳',
    taxPercentage: 0,
    deliveryCharge: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const availableBusinessTypes: { value: BusinessType; label: string }[] = [
    { value: 'SUPERMARKET', label: 'Supermarket' },
    { value: 'GROCERY', label: 'Grocery' },
    { value: 'RETAIL', label: 'Retail' },
    { value: 'RESTAURANT', label: 'Restaurant' },
    { value: 'CAFE', label: 'Cafe' },
    { value: 'CLOUD_KITCHEN', label: 'Cloud Kitchen' },
    { value: 'TAILORING', label: 'Tailoring' },
    { value: 'BOUTIQUE', label: 'Boutique' },
    { value: 'GARMENT_WORKSHOP', label: 'Garment Workshop' },
    { value: 'UNIFORM_MANUFACTURER', label: 'Uniform Manufacturer' },
  ];

  const fetchExistingProfile = useCallback(async () => {
    try {
      const res = await api.get('/business-profile');
      if (res.data.success && res.data.data) {
        const profile = res.data.data;
        const profileBusinessType = isBusinessType(profile.businessType) ? profile.businessType : 'RETAIL';
        setForm({
          businessType: profileBusinessType,
          name: profile.name || '',
          companyName: profile.companyName || '',
          tenantEmail: profile.tenantEmail || '',
          phone: profile.phone || '',
          phone2: profile.phone2 || '',
          address: profile.address || '',
          timezone: profile.timezone || 'Asia/Dhaka',
          currency: profile.currency || 'BDT',
          currencySymbol: profile.currencySymbol || '৳',
          taxPercentage: profile.taxPercentage || 0,
          deliveryCharge: profile.deliveryCharge || 0,
        });
        setBusinessType(profileBusinessType);
        setStep(profile.onboardingCompleted ? 'complete' : 'business-type');
      } else {
        setStep('business-type');
      }
    } catch {
      setStep('business-type');
    }
  }, []);

  useEffect(() => {
    if (user?.tenantId) {
      void Promise.resolve().then(fetchExistingProfile);
    }
  }, [fetchExistingProfile, user?.tenantId]);

  const onBusinessTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isBusinessType(e.target.value)) setBusinessType(e.target.value);
  };

  const onSubmitBusinessType = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.put('/business-profile', {
        businessType,
      });
      setStep('profile');
      showToast.success('Business type set successfully');
    } catch (error: unknown) {
      showToast.error(getApiErrorMessage(error, 'Failed to set business type'));
    } finally {
      setSubmitting(false);
    }
  };

  const onProfileSubmit = async () => {
    setSubmitting(true);
    try {
      await api.put('/business-profile', {
        businessType,
        name: form.name,
        companyName: form.companyName,
        tenantEmail: form.tenantEmail,
        phone: form.phone,
        phone2: form.phone2,
        address: form.address,
        timezone: form.timezone,
        currency: form.currency,
        currencySymbol: form.currencySymbol,
        taxPercentage: form.taxPercentage,
        deliveryCharge: form.deliveryCharge,
      });
      await api.post('/onboarding/complete');
      showToast.success('Profile updated successfully');
      setStep('complete');
    } catch (error: unknown) {
      showToast.error(getApiErrorMessage(error, 'Failed to update profile'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">অ্যাকাউন্ট লগইন আবশ্যক</h2>
        <p className="text-gray-500 mt-2">ড্যাশবোর্ড অ্যাক্সেস করতে প্রথমে লগইন করুন।</p>
        <button
          onClick={() => router.push('/auth/login')}
          className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-all"
        >
          লগইন করুন
        </button>
      </div>
    </div>;
  }

  if (step === 'business-type') {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">ব্যবসা ধর নির্বাচন করুন</h2>
          <p className="text-sm text-gray-500 mb-8">আপনার ব্যবসার ধর নির্বাচন করে আপনার dashboardsuitable মডিউলস সেট হবে</p>

          <form className="space-y-4" onSubmit={onSubmitBusinessType}>
            {availableBusinessTypes.map((bt) => (
              <div
                key={bt.value}
                className={`flex items-center gap-2 px-4 py-3 rounded-sm border-2 transition-all cursor-pointer ${
                  businessType === bt.value
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="businessType"
                  value={bt.value}
                  checked={businessType === bt.value}
                  onChange={onBusinessTypeChange}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <span className="text-sm font-medium truncate">
                  {bt.label}
                </span>
              </div>
            ))}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 text-sm hover:bg-gray-100 transition-all"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold shadow-sm"
              >
                {submitting ? 'Setting...' : 'Set Business Type'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">ব্যবসা প্রফাইল সেটআপ</h2>
          <p className="text-sm text-gray-500 mb-8">আপনার ব্যবসার তথ্য পূরণ করুন</p>

          <form className="space-y-4" onSubmit={onProfileSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ব্যবসার নাম</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="ব্যবসার নাম"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">কোম্পানির নাম</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="আমার কোম্পানি"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ইমেইল</label>
                <input
                  type="email"
                  value={form.tenantEmail}
                  onChange={(e) =>
                    setForm({ ...form, tenantEmail: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="info@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ফোন ১</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="+8801XXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ফোন ২</label>
                <input
                  type="text"
                  value={form.phone2}
                  onChange={(e) =>
                    setForm({ ...form, phone2: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="+8801XXXXXXXXX"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ঠিকানা</label>
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                  placeholder="দোকানের ঠিকানা"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">টাইমজোন</label>
                <select
                  value={form.timezone}
                  onChange={(e) =>
                    setForm({ ...form, timezone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">মুদ্রা</label>
                <select
                  value={form.currency}
                  onChange={(e) =>
                    setForm({ ...form, currency: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="BDT">BDT - বাংলাদেশি টাকা</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">মুদ্রা প্রতীক</label>
                <input
                  type="text"
                  value={form.currencySymbol}
                  onChange={(e) =>
                    setForm({ ...form, currencySymbol: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="৳"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">কর (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.taxPercentage}
                  onChange={(e) =>
                    setForm({ ...form, taxPercentage: Number(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ডেলিভারি চার্জ</label>
              <input
                type="number"
                step="0.01"
                value={form.deliveryCharge}
                onChange={(e) =>
                  setForm({ ...form, deliveryCharge: Number(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="0"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep('business-type')}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 text-sm hover:bg-gray-100 transition-all"
              >
                Change Business Type
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold shadow-sm"
              >
                {submitting ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900">Setup Complete</h2>
        <p className="text-sm text-gray-500 mb-8">Your business profile has been set up successfully. You can now access the dashboard.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-all text-lg font-semibold"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}