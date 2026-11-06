'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';
import { FiSave, FiEye, FiGlobe, FiImage, FiPhone, FiMail, FiMapPin, FiLink, FiLock, FiShoppingBag, FiCheckCircle, FiClock, FiLayout } from 'react-icons/fi';

interface LandingPageData {
  id: string;
  title: string;
  slug: string;
  sections: Record<string, unknown>[];
  styles: Record<string, unknown>;
  seo: Record<string, unknown>;
  published: boolean;
  publishedAt: string | null;
  viewCount?: number;
  logoUrl?: string;
  phoneNumber?: string;
  phoneNumber2?: string;
  emailAddress?: string;
  address?: string;
  socialLinks?: Record<string, string>;
  termsContent?: string;
  footerHtml?: string;
}

interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  icon?: string;
}

const PACKAGES: Package[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 499,
    description: 'Perfect for getting started with your online store',
    features: [
      'Single Product Landing Page',
      'Basic Order Management',
      'Up to 50 Orders/month',
      'Email Support',
    ],
    icon: '🌱',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 999,
    description: 'Best for growing businesses',
    features: [
      'Single Product Landing Page',
      'Full Order Management',
      'Inventory Management',
      'Customer Management',
      'Variants & Attributes',
      'Return Management',
      'Unlimited Orders',
      'Priority Support',
    ],
    popular: true,
    icon: '⭐',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2499,
    description: 'For large-scale operations',
    features: [
      'Everything in Professional',
      'Multi-Product Support',
      'Advanced Analytics',
      'Custom Domain',
      'Dedicated Account Manager',
      '24/7 Phone Support',
    ],
    icon: '🏢',
  },
];

export default function LandingPageBuilder() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // State for tracking tenant status
  const [tenantStatus, setTenantStatus] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [checkingTenant, setCheckingTenant] = useState(true);

  // Landing page builder state
  const [page, setPage] = useState<LandingPageData | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // New fields
  const [logoUrl, setLogoUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumber2, setPhoneNumber2] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [address, setAddress] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [termsContent, setTermsContent] = useState('');
  const [footerHtml, setFooterHtml] = useState('');
  const [landingTheme, setLandingTheme] = useState('original');

  const landingThemes = [
    { id: 'original', name: 'Default', desc: 'Blue - General Store', color: '#2563eb', icon: '🔵' },
     { id: 'clothing', name: 'Fashion', desc: 'Pink - Clothing Store', color: '#ec4899', icon: '👗' },
    { id: 'electronics', name: 'Tech', desc: 'Cyan - Electronics', color: '#06b6d4', icon: '⚡' },
    { id: 'grocery', name: 'Grocery', desc: 'red - Grocery Store', color: '#10b981', icon: '🛒' },
    { id: 'fruits', name: 'Fruits', desc: 'red - Fruit Store', color: '#f97316', icon: '🍎' },
  ];

  // Check tenant status on mount
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      // Determine tenant status from user object
      const status = user.tenantStatus || '';
      const payStatus = user.paymentStatus || '';
      setTenantStatus(status);
      setPaymentStatus(payStatus);
      setCheckingTenant(false);
    } else if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchLandingPage = useCallback(async () => {
    try {
      const res = await api.get('/landing-page');
      if (res.data.success) {
        const data = res.data.data;
        setPage(data);
        setTitle(data.title || '');
        setSlug(data.slug || '');
        // Save slug to localStorage for main landing page to use
        if (data.slug) {
          localStorage.setItem('landingPageSlug', data.slug);
        }
        setSeoDescription(data.seo?.description || '');
        setPublished(data.published || false);
        setLogoUrl(data.logoUrl || '');
        setPhoneNumber(data.phoneNumber || '');
        setPhoneNumber2(data.phoneNumber2 || '');
        setEmailAddress(data.emailAddress || '');
        setAddress(data.address || '');
        setFacebook(data.socialLinks?.facebook || '');
        setInstagram(data.socialLinks?.instagram || '');
        setWhatsapp(data.socialLinks?.whatsapp || '');
        setTermsContent(data.termsContent || '');
        setFooterHtml(data.footerHtml || '');
        setLandingTheme(data.landingTheme || 'original');
      }
    } catch (err: unknown) {
      const errResponse = (err as { response?: { status?: number; data?: { message?: string } } }).response;
      const status = errResponse?.status;
      if (status === 404) {
        showToast.error('No landing page found. Create a template first.');
      } else {
        showToast.error('Failed to load landing page');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch landing page for active tenants OR super admin (who skips payment)
    if (!checkingTenant && (tenantStatus === 'ACTIVE' || user?.role === 'SUPER_ADMIN')) {
      fetchLandingPage();
    } else if (!checkingTenant) {
      setLoading(false);
    }
  }, [checkingTenant, tenantStatus, user?.role, fetchLandingPage]);

  const handleSave = async () => {
    if (!title.trim()) {
      showToast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        title: title.trim(),
        seo: { title: title.trim(), description: seoDescription.trim() },
        logoUrl: logoUrl.trim(),
        phoneNumber: phoneNumber.trim(),
        phoneNumber2: phoneNumber2.trim(),
        emailAddress: emailAddress.trim(),
        address: address.trim(),
        socialLinks: {
          ...(facebook && { facebook }),
          ...(instagram && { instagram }),
          ...(whatsapp && { whatsapp }),
        },
        termsContent: termsContent.trim(),
        footerHtml: footerHtml.trim(),
        landingTheme: landingTheme,
      };
      if (slug.trim() && slug.trim() !== page?.slug) {
        payload.slug = slug.trim();
        localStorage.setItem('landingPageSlug', slug.trim());
      }

      const res = await api.put('/landing-page', payload);
      if (res.data.success) {
        setPage(res.data.data);
        showToast.success('Landing page updated!');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      const errMsg = error?.response?.data?.message || error?.message || 'Failed to save';
      showToast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    setPublishing(true);
    try {
      const res = await api.patch('/landing-page/publish', {
        published: !published,
      });
      if (res.data.success) {
        setPublished(!published);
        showToast.success(published ? 'Page unpublished' : 'Page published!');
      }
    } catch {
      showToast.error('Failed to update publish status');
    } finally {
      setPublishing(false);
    }
  };

  // Handle package selection - redirect to payment submit
  const handleSelectPackage = (pkg: Package) => {
    // Store selected package info in localStorage for the payment page
    localStorage.setItem('selectedPackage', JSON.stringify(pkg));
    router.push('/payment/submit');
  };

  // ─── SUPER ADMIN: Skip all payment checks, show builder directly ──
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // ─── Loading State ────────────────────────────────
  if (authLoading || checkingTenant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ─── SUPER ADMIN goes straight to builder (no payment needed) ──
  // ─── Payment Pending State (only for non-super-admin) ──────────
  if (!isSuperAdmin && tenantStatus !== 'ACTIVE' && paymentStatus === 'PENDING') {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
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
              <li>You can then access the Landing Page Builder</li>
            </ul>
          </div>
          <button
            onClick={() => router.push('/payment/status')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <FiClock className="mr-2" />
            Check Payment Status
          </button>
        </div>
      </div>
    );
  }

  // ─── Not Active / No Payment → Show Packages (not for super admin) ──
  if (!isSuperAdmin && tenantStatus !== 'ACTIVE') {
    return (
      <div className="max-w-8xl  mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Package</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select a package to unlock the Landing Page Builder and start creating your online store.
            One-time payment – no monthly fees!
          </p>
        </div>

        {/* Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-sm shadow-md overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                pkg.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}
              <div className="p-6">
                <div className="text-4xl mb-3">{pkg.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{pkg.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{pkg.price}</span>
                  <span className="text-gray-500 text-sm ml-1">BDT</span>
                  <p className="text-xs text-gray-400 mt-1">One-time payment</p>
                </div>
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-600">
                      <FiCheckCircle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelectPackage(pkg)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all inline-flex items-center justify-center ${
                    pkg.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiShoppingBag className="mr-2" />
                  Select {pkg.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Info */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-red-800 mb-2">💳 Payment Information</h3>
          <p className="text-red-700 text-sm">
            After selecting a package, you will be guided through the payment process.
            Pay via bKash to the provided number and submit your transaction ID for admin verification.
            Your Landing Page Builder will be unlocked once the payment is approved.
          </p>
        </div>
      </div>
    );
  }

  // ─── ACTIVE Tenant → Show Landing Page Builder ─────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Landing Page Theme Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4"><FiLayout className="inline mr-2" />Landing Page Theme</h2>
        <p className="text-sm text-gray-500 mb-4">Choose a theme design for your public landing page. Click on a theme to select it.</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {landingThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                setLandingTheme(theme.id);
                localStorage.setItem('landingPageTheme', theme.id);
              }}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-sm border-2 transition-all duration-300 ${
                landingTheme === theme.id
                  ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <span className="text-2xl">{theme.icon}</span>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-800">{theme.name}</p>
                <p className="text-[10px] text-gray-500">{theme.desc}</p>
              </div>
              {landingTheme === theme.id && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-sm flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Landing Page Builder</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure your store front-end landing page
          </p>
        </div>
        <div className="flex space-x-3">
          {slug && (
            <a
              href={`/${slug}`}
              target="_blank"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 inline-flex items-center"
            >
              <FiEye className="mr-2" />
              Preview
            </a>
          )}
          <button
            onClick={handlePublishToggle}
            disabled={publishing}
            className={`px-4 py-2 rounded-lg inline-flex items-center disabled:opacity-50 ${
              published
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <FiGlobe className="mr-2" />
            {published ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center disabled:opacity-50"
          >
            <FiSave className="mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Basic Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Basic Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="My Store" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm" placeholder="my-store" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
            <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)}
              rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description for search engines" />
          </div>
        </div>
      </div>

      {/* Logo Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4"><FiImage className="inline mr-2" />Logo Upload</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo Image URL</label>
          <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/logo.png" />
          {logoUrl && (
            <div className="mt-3 p-3 border rounded-lg bg-gray-50">
              <img src={logoUrl} alt="Logo preview" className="h-16 object-contain"
                onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4"><FiPhone className="inline mr-2" />Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number 1</label>
            <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="+8801XXXXXXXXX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number 2</label>
            <input type="text" value={phoneNumber2} onChange={(e) => setPhoneNumber2(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="+8801XXXXXXXXX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><FiMail className="inline mr-1" />Email</label>
            <input type="email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="info@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><FiMapPin className="inline mr-1" />Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Shop address" />
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4"><FiLink className="inline mr-2" />Social Media Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
            <input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
            <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
            <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="+8801XXXXXXXXX" />
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">📜 Terms & Conditions</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Terms Content</label>
          <textarea value={termsContent} onChange={(e) => setTermsContent(e.target.value)}
            rows={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your terms and conditions here..." />
        </div>
      </div>

      {/* Status & Analytics */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Status & Analytics</h2>
        <div className="flex items-center space-x-4 mb-4">
          <span className={`px-3 py-1 rounded-sm text-sm font-medium ${
            published ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {published ? 'Published' : 'Draft'}
          </span>
          {page?.publishedAt && (
            <span className="text-sm text-gray-500">
              Published: {new Date(page.publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="border-t pt-4 mt-2">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiEye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Page Views</p>
              <p className="text-2xl font-bold text-gray-900">{page?.viewCount || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}