'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { useTheme } from '@/contexts/ThemeContext';
import { FiSave, FiRefreshCcw, FiDroplet, FiShoppingBag, FiGlobe, FiLink, FiFileText, FiSettings, FiTag, FiLock, FiKey, FiTruck } from 'react-icons/fi';

type SettingsFormData = {
  companyName: string;
  tenantEmail: string;
  phone: string;
  phone2: string;
  address: string;
  logo: string;
  timezone: string;
  currency: string;
  currencySymbol: string;
  taxPercentage: number;
  deliveryCharge: number;
  facebook: string;
  instagram: string;
  whatsapp: string;
  termsAndConditions: string;
  // Product Features
  pfTagline: string;
  pfBadge: string;
  pfFeatures: string;
  pfVariantDetails: string;
  pfTrust1Value: string;
  pfTrust1Label: string;
  pfTrust2Value: string;
  pfTrust2Label: string;
  pfTrust3Value: string;
  pfTrust3Label: string;
  pfTrust4Value: string;
  pfTrust4Label: string;
  pfTrust5Value: string;
  pfTrust5Label: string;
  // Steadfast Courier
  steadfastApiKey: string;
  steadfastSecretKey: string;
};

const themePresets = [
  { name: 'নীল', colors: { primary: '#2563eb', secondary: '#059669', accent: '#7c3aed', sidebarBg: '#0f172a', sidebarText: '#cbd5e1', sidebarActive: '#2563eb', cardBg: '#ffffff' } },
  { name: 'সবুজ', colors: { primary: '#059669', secondary: '#10b981', accent: '#8b5cf6', sidebarBg: '#064e3b', sidebarText: '#a7f3d0', sidebarActive: '#059669', cardBg: '#ffffff' } },
  { name: 'বেগুনি', colors: { primary: '#7c3aed', secondary: '#10b981', accent: '#f50b0b', sidebarBg: '#1e1b4b', sidebarText: '#c4b5fd', sidebarActive: '#7c3aed', cardBg: '#ffffff' } },
  { name: 'লাল', colors: { primary: '#dc2626', secondary: '#06d937', accent: '#7c3aed', sidebarBg: '#1f2937', sidebarText: '#fca5a5', sidebarActive: '#dc2626', cardBg: '#ffffff' } },
  { name: 'গাঢ়', colors: { primary: '#3b82f6', secondary: '#10b981', accent: '#8b5cf6', sidebarBg: '#000000', sidebarText: '#9ca3af', sidebarActive: '#3b82f6', cardBg: '#1f2937' } },
  { name: 'কাস্টম', colors: null },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const { colors, setColors, resetColors } = useTheme();
  const [selectedPreset, setSelectedPreset] = useState('নীল');
  const [customColors, setCustomColors] = useState({ ...colors });

  // Steadfast Courier state
  const [steadfastTesting, setSteadfastTesting] = useState(false);
  const [steadfastConnected, setSteadfastConnected] = useState(false);
  const [steadfastBalance, setSteadfastBalance] = useState<number | null>(null);

  // Password management state
  const [hasPassword, setHasPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormData>();

  const fetchSettings = useCallback(async () => {
    try {
      const [settingsRes] = await Promise.allSettled([
        api.get('/settings'),
      ]);

      if (settingsRes.status === 'fulfilled' && settingsRes.value.data.success) {
        const data = settingsRes.value.data.data;
        const pf = data.productFeatures || {};
        reset({
          companyName: data.companyName || '',
          tenantEmail: data.tenantEmail || '',
          phone: data.phone || '',
          phone2: data.phone2 || '',
          address: data.address || '',
          logo: data.logo || '',
          timezone: data.timezone || 'Asia/Dhaka',
          currency: data.currency || 'BDT',
          currencySymbol: data.currencySymbol || '৳',
          taxPercentage: data.taxPercentage || 0,
          deliveryCharge: data.deliveryCharge || 0,
          facebook: data.socialLinks?.facebook || '',
          instagram: data.socialLinks?.instagram || '',
          whatsapp: data.socialLinks?.whatsapp || '',
          termsAndConditions: data.termsAndConditions || '',
          pfTagline: pf.tagline || '',
          pfBadge: pf.badge || '',
          pfFeatures: pf.features ? pf.features.join('\n') : '',
          pfVariantDetails: pf.variantDetails ? pf.variantDetails.join('\n') : '',
          pfTrust1Value: pf.trustBar?.[0]?.value || '',
          pfTrust1Label: pf.trustBar?.[0]?.label || '',
          pfTrust2Value: pf.trustBar?.[1]?.value || '',
          pfTrust2Label: pf.trustBar?.[1]?.label || '',
          pfTrust3Value: pf.trustBar?.[2]?.value || '',
          pfTrust3Label: pf.trustBar?.[2]?.label || '',
          pfTrust4Value: pf.trustBar?.[3]?.value || '',
          pfTrust4Label: pf.trustBar?.[3]?.label || '',
          pfTrust5Value: pf.trustBar?.[4]?.value || '',
          pfTrust5Label: pf.trustBar?.[4]?.label || '',
          steadfastApiKey: data.steadfastApiKey || '',
          steadfastSecretKey: data.steadfastSecretKey || '',
        });

        // Check steadfast connection status
        if (data.steadfastApiKey) {
          setSteadfastConnected(true);
        }
      }
    } catch {
      showToast.error('সেটিংস লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [reset]);

  // Fetch password status
  const fetchPasswordStatus = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setHasPassword(!!res.data.data.hasPassword);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => { fetchSettings(); fetchPasswordStatus(); }, [fetchSettings, fetchPasswordStatus]);

  // Handle set/change password
  const handlePasswordSubmit = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast.error('পাসওয়ার্ড অবশ্যই ৬ অক্ষরের বেশি হতে হবে');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast.error('পাসওয়ার্ড দুটি মেলেনি');
      return;
    }
    setPasswordLoading(true);
    try {
      if (hasPassword) {
        if (!currentPassword) {
          showToast.error('বর্তমান পাসওয়ার্ড দিন');
          setPasswordLoading(false);
          return;
        }
        await api.post('/auth/change-password', { currentPassword, newPassword });
        showToast.success('পাসওয়ার্ড পরিবর্তন হয়েছে!');
      } else {
        await api.post('/auth/set-password', { password: newPassword });
        showToast.success('পাসওয়ার্ড সেট করা হয়েছে!');
        setHasPassword(true);
      }
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (err: any) {
      showToast.error(err.response?.data?.message || 'পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setPasswordLoading(false);
    }
  };

  const applyPreset = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = themePresets.find(p => p.name === presetName);
    if (preset && preset.colors) {
      setColors(preset.colors);
      setCustomColors(preset.colors);
    }
  };

  const handleCustomColorChange = (key: string, value: string) => {
    const updated = { ...customColors, [key]: value };
    setCustomColors(updated);
    setColors(updated);
    setSelectedPreset('কাস্টম');
  };

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    try {
      const socialLinks = {
        ...(data.facebook && { facebook: data.facebook }),
        ...(data.instagram && { instagram: data.instagram }),
        ...(data.whatsapp && { whatsapp: data.whatsapp }),
      };

      // Build productFeatures from individual fields
      const features = data.pfFeatures ? data.pfFeatures.split('\n').filter(f => f.trim()) : [];
      const variantDetails = data.pfVariantDetails ? data.pfVariantDetails.split('\n').filter(f => f.trim()) : [];
      const trustBar = [
        data.pfTrust1Value || data.pfTrust1Label ? { value: data.pfTrust1Value || '', label: data.pfTrust1Label || '', icon: 'star' } : null,
        data.pfTrust2Value || data.pfTrust2Label ? { value: data.pfTrust2Value || '', label: data.pfTrust2Label || '', icon: 'users' } : null,
        data.pfTrust3Value || data.pfTrust3Label ? { value: data.pfTrust3Value || '', label: data.pfTrust3Label || '', icon: 'truck' } : null,
        data.pfTrust4Value || data.pfTrust4Label ? { value: data.pfTrust4Value || '', label: data.pfTrust4Label || '', icon: 'lock' } : null,
        data.pfTrust5Value || data.pfTrust5Label ? { value: data.pfTrust5Value || '', label: data.pfTrust5Label || '', icon: 'shield' } : null,
      ].filter(Boolean);

      const productFeatures: Record<string, any> = {};
      if (data.pfTagline) productFeatures.tagline = data.pfTagline;
      if (data.pfBadge) productFeatures.badge = data.pfBadge;
      if (features.length > 0) productFeatures.features = features;
      if (variantDetails.length > 0) productFeatures.variantDetails = variantDetails;
      if (trustBar.length > 0) productFeatures.trustBar = trustBar;

      const settingsPayload: Record<string, any> = {
        companyName: data.companyName,
        tenantEmail: data.tenantEmail,
        phone: data.phone,
        phone2: data.phone2,
        address: data.address,
        logo: data.logo,
        timezone: data.timezone,
        currency: data.currency,
        currencySymbol: data.currencySymbol,
        taxPercentage: parseFloat(String(data.taxPercentage)) || 0,
        deliveryCharge: parseFloat(String(data.deliveryCharge)) || 0,
        socialLinks,
        termsAndConditions: data.termsAndConditions,
        productFeatures,
      };

      // Only send Steadfast credentials if the courier tab is active
      if (activeTab === 'courier') {
        settingsPayload.steadfastApiKey = data.steadfastApiKey;
        settingsPayload.steadfastSecretKey = data.steadfastSecretKey;
      }

      await api.put('/settings', settingsPayload);

      showToast.success('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
      fetchSettings();
    } catch {
      showToast.error('সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-sm h-12 w-12 border-2 border-blue-600 border-t-transparent"></div></div>;
  }

  const tabs = [
    { id: 'general', label: 'সাধারণ', icon: FiSettings },
    { id: 'theme', label: 'থিম', icon: FiDroplet },
    { id: 'shop', label: 'দোকান', icon: FiShoppingBag },
    { id: 'system', label: 'সিস্টেম', icon: FiGlobe },
    { id: 'productFeatures', label: 'পণ্য ফিচার', icon: FiTag },
    { id: 'password', label: 'পাসওয়ার্ড', icon: FiLock },
    { id: 'social', label: 'সোশ্যাল', icon: FiLink },
    { id: 'terms', label: 'শর্তাবলী', icon: FiFileText },
    { id: 'courier', label: 'কুরিয়ার', icon: FiTruck },
  ];

  return (
    <div className="max-w-8xl  mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">সেটিংস</h1>
        <p className="text-gray-500 mt-1 text-sm">আপনার ব্যবসা এবং সিস্টেম সেটিংস কাস্টমাইজ করুন</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-sm text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white '
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-sm  border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">সাধারণ তথ্য</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">কোম্পানির নাম</label>
                <input {...register('companyName')} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="আমার কোম্পানি" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ইমেইল</label>
                <input {...register('tenantEmail')} type="email" className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="info@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ফোন ১</label>
                <input {...register('phone')} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="+8801XXXXXXXXX" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ফোন ২</label>
                <input {...register('phone2')} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="+8801XXXXXXXXX" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ঠিকানা</label>
                <textarea {...register('address')} rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" placeholder="দোকানের ঠিকানা" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">লোগো (URL)</label>
                <input {...register('logo')} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="https://example.com/logo.png" />
                <p className="text-xs text-gray-400 mt-1.5">লোগোর সরাসরি ইমেজ URL দিন</p>
              </div>
            </div>
          </div>
        )}

        {/* Theme Tab */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            <div className="bg-white rounded-sm  border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">ড্যাশবোর্ড থিম</h2>
              <p className="text-sm text-gray-500 mb-6">আপনার পছন্দের রঙে ড্যাশবোর্ড সাজান</p>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
                {themePresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => preset.colors && applyPreset(preset.name)}
                    disabled={preset.name === 'কাস্টম'}
                    className={`relative p-4 rounded-sm border-2 transition-all ${
                      selectedPreset === preset.name
                        ? 'border-blue-500  ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${preset.name === 'কাস্টম' ? 'opacity-60' : ''}`}
                  >
                    {preset.colors ? (
                      <div className="space-y-2">
                        <div className="flex gap-1 justify-center">
                          <div className="w-6 h-6 rounded-sm" style={{ backgroundColor: preset.colors.primary }}></div>
                          <div className="w-6 h-6 rounded-sm" style={{ backgroundColor: preset.colors.secondary }}></div>
                          <div className="w-6 h-6 rounded-sm" style={{ backgroundColor: preset.colors.sidebarBg }}></div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">{preset.name}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FiDroplet className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                        <p className="text-xs font-semibold text-gray-700">{preset.name}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 rounded-sm p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-4">কাস্টম রঙ</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'primary', label: 'প্রাথমিক', default: '#2563eb' },
                    { key: 'secondary', label: 'সেকেন্ডারি', default: '#059669' },
                    { key: 'accent', label: 'অ্যাকসেন্ট', default: '#7c3aed' },
                    { key: 'sidebarBg', label: 'সাইডবার ব্যাকগ্রাউন্ড', default: '#0f172a' },
                    { key: 'sidebarText', label: 'সাইডবার টেক্সট', default: '#cbd5e1' },
                    { key: 'sidebarActive', label: 'সাইডবার একটিভ', default: '#2563eb' },
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{item.label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customColors[item.key as keyof typeof customColors]}
                          onChange={(e) => handleCustomColorChange(item.key, e.target.value)}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={customColors[item.key as keyof typeof customColors]}
                          onChange={(e) => handleCustomColorChange(item.key, e.target.value)}
                          className="flex-1 px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3">প্রিভিউ</h3>
                <div className="rounded-sm overflow-hidden border border-gray-200">
                  <div className="flex h-32">
                    <div className="w-1/3 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: customColors.sidebarBg, color: customColors.sidebarText }}>
                      সাইডবার
                    </div>
                    <div className="flex-1 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: customColors.primary }}>
                      প্রাথমিক রঙ
                    </div>
                    <div className="w-1/4 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: customColors.secondary }}>
                      সেকেন্ডারি
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetColors}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-sm text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <FiRefreshCcw className="w-4 h-4" />
                  ডিফল্ট রিসেট
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <div className="bg-white rounded-sm  border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">দোকানের তথ্য</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">কোম্পানির নাম</label>
                <input {...register('companyName')} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="আমার কোম্পানি" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">লোগো URL</label>
                <input {...register('logo')} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="https://..." />
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="bg-white rounded-sm  border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">সিস্টেম সেটিংস</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">টাইমজোন</label>
                <select {...register('timezone')} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                  <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">মুদ্রা</label>
                <select {...register('currency')} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                  <option value="BDT">BDT - বাংলাদেশি টাকা</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">মুদ্রা প্রতীক</label>
                <input {...register('currencySymbol')} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="৳" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">কর (%)</label>
                <input {...register('taxPercentage')} type="number" step="0.01" className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ডেলিভারি চার্জ</label>
                <input {...register('deliveryCharge')} type="number" step="0.01" className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="0" />
              </div>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-sm  border border-gray-100 p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl flex-shrink-0 ">
                <FiKey />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">পাসওয়ার্ড ব্যবস্থাপনা</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {hasPassword 
                    ? 'আপনার বর্তমান পাসওয়ার্ড পরিবর্তন করুন' 
                    : 'আপনার অ্যাকাউন্টের জন্য একটি পাসওয়ার্ড সেট করুন'}
                </p>
              </div>
            </div>

            <div className="max-w-md space-y-4">
              {hasPassword && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">বর্তমান পাসওয়ার্ড</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {hasPassword ? 'নতুন পাসওয়ার্ড' : 'পাসওয়ার্ড'}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="কমপক্ষে ৬ অক্ষর"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">পাসওয়ার্ড নিশ্চিত করুন</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="আবার পাসওয়ার্ড লিখুন"
                />
              </div>
              <button
                type="button"
                onClick={handlePasswordSubmit}
                disabled={passwordLoading}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-sm hover:bg-indigo-700 disabled:opacity-50 font-semibold  hover:shadow-xl transition-all"
              >
                <FiLock className="w-5 h-5" />
                {passwordLoading ? 'প্রক্রিয়াধীন...' : (hasPassword ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'পাসওয়ার্ড সেট করুন')}
              </button>
            </div>

            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-sm">
              <p className="text-sm text-red-800 font-semibold flex items-center gap-2">
                <FiKey className="w-4 h-4" />
                {hasPassword
                  ? 'পাসওয়ার্ড সেট থাকায় আপনি ইমেইল ও পাসওয়ার্ড দিয়েও লগইন করতে পারবেন'
                  : 'পাসওয়ার্ড সেট করলে আপনি ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করতে পারবেন'}
              </p>
            </div>
          </div>
        )}

        {/* Product Features Tab */}
        {activeTab === 'productFeatures' && (
          <div className="space-y-6">
            {/* ════ 1. TAGLINE ════ */}
            <div className="bg-white rounded-sm  border border-gray-100 p-6 md:p-8">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-red-500 to-emerald-600 flex items-center justify-center text-white text-lg flex-shrink-0 ">✦</div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">ট্যাগলাইন</h3>
                  <p className="text-xs text-red-600 font-semibold mt-0.5">হিরো সেকশন • প্রোডাক্ট টাইটেলের নিচে</p>
                </div>
              </div>

              <div className="bg-red-50/70 rounded-sm p-5 mb-5 border border-red-100">
                <p className="text-xs font-bold text-red-800 mb-2">👁️ ওয়েবসাইটে যেভাবে দেখাবে:</p>
                <div className="bg-white rounded-sm p-4  border border-red-200">
                  <p className="text-lg font-black text-gray-800">আপনার পণ্যের নাম</p>
                  <p className="text-sm font-bold text-red-700 mt-1">← আপনার লেখা ট্যাগলাইন এখানে দেখাবে</p>
                </div>
              </div>

              <label className="block text-sm font-bold text-gray-700 mb-2">কী লিখবেন:</label>
              <input {...register('pfTagline')}
                className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-sm text-sm font-medium focus:ring-4 focus:ring-red-200 focus:border-red-500 outline-none transition-all "
                placeholder='যেমন: "কোনো কেমিক্যাল নেই • ১০০% খাঁটি ও প্রাকৃতিক"' />

              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <span className="text-red-500">💡</span>
                এই লেখাটা হোমপেজের হিরো সেকশনে প্রোডাক্ট টাইটেলের নিচে দেখানো হবে
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {['কোনো কেমিক্যাল নেই • ১০০% খাঁটি','প্রিমিয়াম কোয়ালিটি • সেরা পণ্য','অর্গানিক ও প্রাকৃতিক • হেলদি'].map((preset, i) => (
                  <button key={i} type="button" onClick={() => { const el = document.getElementsByName('pfTagline')[0]; if(el) { (el as HTMLInputElement).value = preset; el.dispatchEvent(new Event('input', { bubbles: true })); } }}
                    className="px-4 py-2 text-xs font-semibold rounded-sm border-2 border-dashed border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-all">
                    ⚡ {preset.length > 25 ? preset.slice(0, 25) + '...' : preset}
                  </button>
                ))}
                <button type="button" onClick={() => { const el = document.getElementsByName('pfTagline')[0]; if(el) { (el as HTMLInputElement).value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); } }}
                  className="px-4 py-2 text-xs font-semibold rounded-sm border-2 border-gray-200 text-gray-400 hover:bg-gray-50 transition-all">
                  ✕ খালি করুন
                </button>
              </div>
            </div>

            {/* ════ 2. BADGE ════ */}
            <div className="bg-white rounded-sm  border border-gray-100 p-6 md:p-8">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-lg flex-shrink-0 ">🏷️</div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">ব্যাজ টেক্সট</h3>
                  <p className="text-xs text-red-600 font-semibold mt-0.5">হিরো সেকশন • উপরের ছোট স্টিকার</p>
                </div>
              </div>

              <div className="bg-red-50/70 rounded-sm p-5 mb-5 border border-red-100">
                <p className="text-xs font-bold text-red-800 mb-2">👁️ ওয়েবসাইটে যেভাবে দেখাবে:</p>
                <div className="bg-white rounded-sm p-4  border border-red-200 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-sm bg-red-50 text-red-700 border border-red-200">
                    ← আপনার লেখা ব্যাজ টেক্সট
                  </span>
                </div>
              </div>

              <label className="block text-sm font-bold text-gray-700 mb-2">কী লিখবেন:</label>
              <input {...register('pfBadge')}
                className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-sm text-sm font-medium focus:ring-4 focus:ring-red-200 focus:border-red-500 outline-none transition-all "
                placeholder='যেমন: "১০০% খাঁটি ও প্রাকৃতিক পণ্য"' />

              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <span className="text-red-500">💡</span>
                ছোট একটা ট্যাগ/স্টিকার হবে — পণ্যের উপরে দেখানো হবে
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {['১০০% খাঁটি ও প্রাকৃতিক','লিমিটেড অফার','সেরা কোয়ালিটি'].map((preset, i) => (
                  <button key={i} type="button" onClick={() => { const el = document.getElementsByName('pfBadge')[0]; if(el) { (el as HTMLInputElement).value = preset; el.dispatchEvent(new Event('input', { bubbles: true })); } }}
                    className="px-4 py-2 text-xs font-semibold rounded-sm border-2 border-dashed border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-all">
                    ⚡ {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* ════ 3. FEATURES LIST ════ */}
            <div className="bg-white rounded-sm  border border-gray-100 p-6 md:p-8">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg flex-shrink-0 ">✓</div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">পণ্যের বৈশিষ্ট্য লিস্ট</h3>
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">হিরো সেকশন • বুলেট পয়েন্ট আকারে</p>
                </div>
              </div>

              <div className="bg-blue-50/70 rounded-sm p-5 mb-5 border border-blue-100">
                <p className="text-xs font-bold text-blue-800 mb-2">👁️ ওয়েবসাইটে যেভাবে দেখাবে:</p>
                <div className="bg-white rounded-sm p-4  border border-blue-200">
                  <div className="grid grid-cols-2 gap-2">
                    {['✓ ফিচার ১','✓ ফিচার ২','✓ ফিচার ৩','✓ ফিচার ৪'].map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="w-4 h-4 rounded-sm bg-red-100 flex items-center justify-center text-red-600 text-[8px]">✓</span>
                        ← আপনার লেখা ফিচার
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <label className="block text-sm font-bold text-gray-700 mb-2">কী লিখবেন:</label>
              <div className="text-xs font-medium text-gray-500 mb-2">প্রতি লাইনে ১টা করে ফিচার লিখুন</div>
              <textarea {...register('pfFeatures')} rows={5}
                className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-sm text-sm font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all  resize-none"
                placeholder={'১০০% খাঁটি ও প্রাকৃতিক\nকেমিক্যাল ও প্রিজারভেটিভ মুক্ত\nস্বাস্থ্যকর ও পুষ্টিগুণ ভরপুর\nসারা বাংলাদেশে হোম ডেলিভারি\nক্যাশ অন ডেলিভারি সুবিধা\n৭ দিনের রিটার্ন গ্যারান্টি'} />

              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <span className="text-blue-500">💡</span>
                ১ লাইন = ১ টা ফিচার। অটো ✅ বুলেট লিস্ট হয়ে যাবে
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {['ডেলিভারি ফোকাসড','কোয়ালিটি ফোকাসড','ট্রাস্ট ফোকাসড'].map((preset, i) => (
                  <button key={i} type="button" onClick={() => {
                    const el = document.getElementsByName('pfFeatures')[0] as HTMLTextAreaElement;
                    if(el) {
                      const vals: Record<string, string> = {'ডেলিভারি ফোকাসড': 'সারা বাংলাদেশে ফ্রি ডেলিভারি\n২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি\nক্যাশ অন ডেলিভারি সুবিধা\nট্র্যাকিং সুবিধা','কোয়ালিটি ফোকাসড': '১০০% খাঁটি ও প্রিমিয়াম কোয়ালিটি\nকোনো কেমিক্যাল নেই\nসেরা মানের পণ্য\nসকল স্বাস্থ্য সার্টিফিকেট আছে','ট্রাস্ট ফোকাসড': '৭ দিনের রিটার্ন গ্যারান্টি\n১০০% রিফান্ড পলিসি\nনিরাপদ লেনদেন\n২৪/৭ গ্রাহক সাপোর্ট'};
                      el.value = vals[preset] || '';
                      el.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }}
                    className="px-4 py-2 text-xs font-semibold rounded-sm border-2 border-dashed border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all">
                    ⚡ {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* ════ 4. VARIANT DETAILS ════ */}
            <div className="bg-white rounded-sm  border border-gray-100 p-6 md:p-8">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-lg flex-shrink-0 ">📋</div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">ভেরিয়েন্টের বিবরণ</h3>
                  <p className="text-xs text-purple-600 font-semibold mt-0.5">প্রতিটি ভেরিয়েন্টের নিচে দেখাবে</p>
                </div>
              </div>

              <div className="bg-purple-50/70 rounded-sm p-5 mb-5 border border-purple-100">
                <p className="text-xs font-bold text-purple-800 mb-2">👁️ ওয়েবসাইটে যেভাবে দেখাবে:</p>
                <div className="bg-white rounded-sm p-4  border border-purple-200">
                  <div className="space-y-2">
                    {['📦 নিট ওজন: ১ কেজি','❄️ সংরক্ষণ: ঠান্ডা স্থানে রাখুন','📅 মেয়াদ: ১২ মাস','🇧🇩 উৎপাদন: বাংলাদেশ'].map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="w-4 h-4 rounded-sm bg-purple-100 flex items-center justify-center text-purple-600 text-[8px]">✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <label className="block text-sm font-bold text-gray-700 mb-2">কী লিখবেন:</label>
              <div className="text-xs font-medium text-gray-500 mb-2">প্রতি লাইনে ১টা করে তথ্য লিখুন</div>
              <textarea {...register('pfVariantDetails')} rows={4}
                className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-sm text-sm font-medium focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all  resize-none"
                placeholder={'নিট ওজন: {attr}\nসংরক্ষণ: ঠান্ডা স্থানে রাখুন\nমেয়াদ: ১২ মাস\nউৎপাদন: বাংলাদেশ'} />

              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <span className="text-purple-500">💡</span>
                <code className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[11px] font-mono">{'{attr}'}</code> লিখলে অটো ভেরিয়েন্টের নাম বসে যাবে
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {['স্ট্যান্ডার্ড','ফুড আইটেম'].map((preset, i) => (
                  <button key={i} type="button" onClick={() => {
                    const el = document.getElementsByName('pfVariantDetails')[0] as HTMLTextAreaElement;
                    if(el) {
                      const vals: Record<string, string> = {'স্ট্যান্ডার্ড': 'নিট ওজন: {attr}\nসংরক্ষণ: ঠান্ডা স্থানে রাখুন\nমেয়াদ: ১২ মাস\nউৎপাদন: বাংলাদেশ','ফুড আইটেম': 'নেট: {attr}\nফ্রিজে সংরক্ষণ করুন\nপ্যাকেটের তারিখ দেখুন\nখাঁটি ও হাই কোয়ালিটি'};
                      el.value = vals[preset] || '';
                      el.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }}
                    className="px-4 py-2 text-xs font-semibold rounded-sm border-2 border-dashed border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all">
                    ⚡ {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* ════ 5. TRUST BAR ════ */}
            <div className="bg-white rounded-sm  border border-gray-100 p-6 md:p-8">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-lg flex-shrink-0 ">🛡️</div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">ট্রাস্ট বার (৫টি)</h3>
                  <p className="text-xs text-pink-600 font-semibold mt-0.5">হিরো সেকশনের নিচে • ক্ষুদে তথ্য বার</p>
                </div>
              </div>

              <div className="bg-pink-50/70 rounded-sm p-5 mb-5 border border-pink-100">
                <p className="text-xs font-bold text-pink-800 mb-2">👁️ ওয়েবসাইটে যেভাবে দেখাবে:</p>
                <div className="bg-white rounded-sm p-4  border border-pink-200">
                  <div className="flex flex-wrap gap-4 justify-center">
                    {['★ ৪.৯/৫\nগ্রাহক রেটিং','👥 ৫০০+\nসন্তুষ্ট গ্রাহক','🚚 সারা বাংলাদেশ\nহোম ডেলিভারি','🔒 ক্যাশ অন\nনিরাপদ পেমেন্ট','🛡️ ১০০%\nগ্যারান্টি'].map((t, i) => (
                      <div key={i} className="text-center">
                        <div className="text-xs font-black text-gray-800">{t.split('\n')[0]}</div>
                        <div className="text-[9px] text-gray-400">{t.split('\n')[1]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <label className="block text-sm font-bold text-gray-700 mb-3">প্রতিটি বক্স পূরণ করুন:</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { vKey: 'pfTrust1Value', lKey: 'pfTrust1Label', num: 1, vPlace: '৪.৯/৫', lPlace: 'গ্রাহক রেটিং', icon: '★', color: 'red' },
                  { vKey: 'pfTrust2Value', lKey: 'pfTrust2Label', num: 2, vPlace: '৫০০+', lPlace: 'সন্তুষ্ট গ্রাহক', icon: '👥', color: 'emerald' },
                  { vKey: 'pfTrust3Value', lKey: 'pfTrust3Label', num: 3, vPlace: 'সারা বাংলাদেশ', lPlace: 'হোম ডেলিভারি', icon: '🚚', color: 'blue' },
                  { vKey: 'pfTrust4Value', lKey: 'pfTrust4Label', num: 4, vPlace: 'ক্যাশ অন ডেলিভারি', lPlace: 'নিরাপদ পেমেন্ট', icon: '🔒', color: 'indigo' },
                  { vKey: 'pfTrust5Value', lKey: 'pfTrust5Label', num: 5, vPlace: '১০০% নিরাপদ', lPlace: 'গ্যারান্টিযুক্ত', icon: '🛡️', color: 'purple' },
                ].map((item) => (
                  <div key={item.num} className="bg-gray-50 rounded-sm p-4 border border-gray-200 hover:border-gray-300 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 rounded-sm bg-white  flex items-center justify-center text-sm">{item.icon}</span>
                      <span className="text-xs font-bold text-gray-600">{item.num} নং ট্রাস্ট আইটেম</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-[11px] font-semibold text-gray-500 mb-1">মূল টেক্সট (বড় অক্ষরে)</div>
                        <input {...register(item.vKey as keyof SettingsFormData)}
                          className="w-full px-4 py-2.5 text-sm font-bold border-2 border-gray-200 rounded-sm focus:ring-4 focus:ring-red-200 focus:border-red-500 outline-none transition-all"
                          placeholder={item.vPlace} />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-gray-500 mb-1">লেবেল (ছোট অক্ষরে)</div>
                        <input {...register(item.lKey as keyof SettingsFormData)}
                          className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-sm focus:ring-4 focus:ring-red-200 focus:border-red-500 outline-none transition-all"
                          placeholder={item.lPlace} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {['ডিফল্ট ট্রাস্ট','স্টোর ফোকাসড'].map((preset, i) => (
                  <button key={i} type="button" onClick={() => {
                    const inputs = [
                      document.getElementsByName('pfTrust1Value')[0] as HTMLInputElement,
                      document.getElementsByName('pfTrust1Label')[0] as HTMLInputElement,
                      document.getElementsByName('pfTrust2Value')[0] as HTMLInputElement,
                      document.getElementsByName('pfTrust2Label')[0] as HTMLInputElement,
                      document.getElementsByName('pfTrust3Value')[0] as HTMLInputElement,
                      document.getElementsByName('pfTrust3Label')[0] as HTMLInputElement,
                      document.getElementsByName('pfTrust4Value')[0] as HTMLInputElement,
                      document.getElementsByName('pfTrust4Label')[0] as HTMLInputElement,
                      document.getElementsByName('pfTrust5Value')[0] as HTMLInputElement,
                      document.getElementsByName('pfTrust5Label')[0] as HTMLInputElement,
                    ];
                    const vals: Record<string, string[]> = {'ডিফল্ট ট্রাস্ট': ['৪.৯/৫','গ্রাহক রেটিং','৫০০+','সন্তুষ্ট গ্রাহক','সারা বাংলাদেশ','হোম ডেলিভারি','ক্যাশ অন ডেলিভারি','নিরাপদ পেমেন্ট','১০০% নিরাপদ','গ্যারান্টিযুক্ত'],'স্টোর ফোকাসড': ['১০০০+','সন্তুষ্ট ক্রেতা','ফ্রি ডেলিভারি','সারা বাংলাদেশ','ক্যাশ অন','নিরাপদ','২৪/৭','গ্রাহক সাপোর্ট','৭ দিন','রিটার্ন পলিসি']};
                    const v = vals[preset];
                    if(v && v.length >= 10) {
                      inputs.forEach((el, idx) => { if(el) { el.value = v[idx]; el.dispatchEvent(new Event('input', { bubbles: true })); } });
                    }
                  }}
                    className="px-4 py-2 text-xs font-semibold rounded-sm border-2 border-dashed border-pink-300 text-pink-700 hover:bg-pink-50 hover:border-pink-400 transition-all">
                    ⚡ {preset}
                  </button>
                ))}
                <button type="button" onClick={() => {
                  ['pfTrust1Value','pfTrust1Label','pfTrust2Value','pfTrust2Label','pfTrust3Value','pfTrust3Label','pfTrust4Value','pfTrust4Label','pfTrust5Value','pfTrust5Label'].forEach(name => {
                    const el = document.getElementsByName(name)[0] as HTMLInputElement;
                    if(el) { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); }
                  });
                }}
                  className="px-4 py-2 text-xs font-semibold rounded-sm border-2 border-gray-200 text-gray-400 hover:bg-gray-50 transition-all">
                  ✕ সব খালি করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Social Tab */}
        {activeTab === 'social' && (
          <div className="bg-white rounded-sm  border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">সোশ্যাল মিডিয়া লিংক</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ফেসবুক URL</label>
                <input {...register('facebook')} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="https://facebook.com/..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ইনস্টাগ্রাম URL</label>
                <input {...register('instagram')} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">হোয়াটসঅ্যাপ নম্বর</label>
                <input {...register('whatsapp')} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="+8801XXXXXXXXX" />
              </div>
            </div>
          </div>
        )}

        {/* Courier Tab */}
        {activeTab === 'courier' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-sm  border border-gray-100 p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-sm bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-2xl flex-shrink-0 ">
                  <FiTruck />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Steadfast Courier Integration</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    আপনার Steadfast Courier অ্যাকাউন্ট কানেক্ট করুন। API Key এবং Secret Key দিন, তারপর অর্ডার সরাসরি Steadfast-এ পাঠাতে পারবেন।
                  </p>
                </div>
              </div>

              {/* Connection Status */}
              {steadfastConnected && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <p className="text-sm font-semibold text-red-800">
                      Steadfast Courier সংযুক্ত আছে {steadfastBalance !== null && `| ব্যালেন্স: ৳${steadfastBalance}`}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    API Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('steadfastApiKey')}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                    placeholder="Your Steadfast API Key"
                  />
                  <p className="text-xs text-gray-400 mt-1">Steadfast Courier পোর্টাল থেকে প্রাপ্ত API Key</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Secret Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('steadfastSecretKey')}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                    placeholder="Your Steadfast Secret Key"
                  />
                  <p className="text-xs text-gray-400 mt-1">Steadfast Courier পোর্টাল থেকে প্রাপ্ত Secret Key</p>
                </div>
              </div>

              {/* Test Connection Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={steadfastTesting}
                  onClick={async () => {
                    const apiKey = (document.getElementsByName('steadfastApiKey')[0] as HTMLInputElement)?.value;
                    const secretKey = (document.getElementsByName('steadfastSecretKey')[0] as HTMLInputElement)?.value;
                    if (!apiKey || !secretKey) {
                      showToast.error('API Key এবং Secret Key উভয়ই প্রয়োজন');
                      return;
                    }
                    setSteadfastTesting(true);
                    try {
                      const res = await api.post('/steadfast/test-connection', { apiKey, secretKey });
                      if (res.data.success) {
                        setSteadfastConnected(true);
                        setSteadfastBalance(res.data.data?.current_balance || null);
                        showToast.success('Steadfast Courier API সংযোগ সফল!');
                      } else {
                        showToast.error(res.data.message || 'সংযোগ ব্যর্থ');
                      }
                    } catch {
                      showToast.error('Steadfast API সংযোগ ব্যর্থ হয়েছে');
                    } finally {
                      setSteadfastTesting(false);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-sm hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 font-semibold  transition-all"
                >
                  <FiRefreshCcw className={`w-4 h-4 ${steadfastTesting ? 'animate-spin' : ''}`} />
                  {steadfastTesting ? 'Testing...' : 'Test Connection'}
                </button>
                {steadfastConnected && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await api.get('/steadfast/balance');
                        if (res.data.success) {
                          setSteadfastBalance(res.data.data?.current_balance || 0);
                          showToast.success(`Balance: ৳${res.data.data?.current_balance || 0}`);
                        }
                      } catch {
                        showToast.error('Balance fetch failed');
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 border border-gray-200 text-gray-600 rounded-sm hover:bg-gray-50 font-semibold transition-all"
                  >
                    Check Balance
                  </button>
                )}
              </div>
            </div>

            {/* API Information */}
            <div className="bg-white rounded-sm  border border-gray-100 p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">API Information</h3>
              <div className="bg-blue-50 rounded-sm p-4 border border-blue-100">
                <p className="text-sm font-semibold text-blue-800 mb-2">How to get your API credentials:</p>
                <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                  <li>Login to your Steadfast Courier account at <a href="https://portal.packzy.com" target="_blank" className="underline font-semibold">portal.packzy.com</a></li>
                  <li>Go to API Settings / Integration section</li>
                  <li>Copy your API Key and Secret Key</li>
                  <li>Paste them in the fields above and click "Test Connection"</li>
                </ol>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-sm p-4 border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Available Features</h4>
                  <ul className="space-y-1.5">
                    {[
                      'Send single order to Steadfast',
                      'Bulk send orders (up to 500)',
                      'Check delivery status',
                      'View account balance',
                      'Create return requests',
                      'View payments & consignments',
                    ].map((feat, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-[9px]">✓</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 rounded-sm p-4 border border-red-200">
                  <h4 className="text-sm font-bold text-red-800 mb-2">Base URL</h4>
                  <code className="block bg-white px-3 py-2 rounded text-xs font-mono text-red-700 border border-red-200">
                    https://portal.packzy.com/api/v1
                  </code>
                  <p className="text-xs text-red-600 mt-2">This integration uses the official Steadfast Courier API v1</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Terms Tab */}
        {activeTab === 'terms' && (
          <div className="bg-white rounded-sm  border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">শর্তাবলী ও নীতিমালা</h2>
            <p className="text-sm text-gray-500 mb-6">ল্যান্ডিং পেজে দেখানোর জন্য শর্তাবলী লিখুন</p>
            <div>
              <textarea {...register('termsAndConditions')} rows={8} className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-sans text-sm" placeholder="আপনার শর্তাবলী এখানে লিখুন..." />
            </div>
          </div>
        )}

        {/* Save Button (hidden on password tab) */}
        {activeTab !== 'password' && (
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:opacity-50 font-semibold  hover:shadow-xl transition-all"
            >
              <FiSave className="w-5 h-5" />
              {saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}