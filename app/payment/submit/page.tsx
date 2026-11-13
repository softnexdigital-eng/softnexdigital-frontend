'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Store,
  ShieldCheck,
  Clock,
  CreditCard,
  CheckCircle2,
  Copy,
  ArrowRight,
  Phone,
  Calendar
} from "lucide-react";

export default function PaymentSubmitPage() {
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!authLoading && user) {
      if (user.tenantStatus === 'ACTIVE') {
        router.push('/dashboard');
        return;
      }
      if (user.paymentStatus === 'PENDING' && user.isPaymentSubmitted) {
        router.push('/payment/status');
        return;
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('01918647966');
    setCopied(true);
    showToast.success('bKash number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      showToast.error('Please enter your bKash transaction ID');
      return;
    }
    if (transactionId.trim().length < 5) {
      showToast.error('Transaction ID seems too short. Please check and try again.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/payment/submit', {
        transactionId: transactionId.trim(),
      });

      if (response.data.success) {
        setSubmitted(true);
        showToast.success(response.data.message || 'Payment submitted successfully!');
      } else {
        showToast.error(response.data.message || 'Failed to submit payment');
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to submit payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (submitted) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-sm shadow-2xl p-10 text-center">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-sm flex items-center justify-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Submitted Successfully!</h1>
        <p className="text-gray-600 mb-8">Thank you for your first monthly subscription payment.</p>

        <div className="bg-gray-50 border border-gray-100 rounded-sm p-6 mb-8 text-left space-y-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Transaction ID</span>
            <span className="font-semibold text-gray-900 font-mono">{transactionId}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Amount Paid</span>
            <span className="font-semibold text-gray-900">250 BDT</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Next Billing</span>
            <span className="font-semibold text-gray-900">After 30 days</span>
          </div>
        </div>

        <div className="text-left bg-blue-50 border border-blue-100 rounded-sm p-6 mb-8">
          <p className="text-gray-700 leading-relaxed">
            Our admin team will now verify your transaction. If the Transaction ID is correct and the payment is confirmed, 
            <strong> your store and landing page will be activated within 30 minutes.</strong>
          </p>
          <p className="text-gray-600 mt-4 text-sm">
            You will receive a confirmation email once your subscription is active.
          </p>
        </div>

        <button
          onClick={() => router.push('/payment/status')}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-sm font-semibold text-lg transition-all flex items-center justify-center gap-2"
        >
          Check Subscription Status <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-sm shadow-md">
              <Store className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Monthly Subscription</h1>
          <p className="text-xl text-gray-600">250 BDT / month • Cancel anytime</p>
        </div>

        <div className="bg-white rounded-sm shadow-xl p-8 md:p-12">
          {/* Pricing */}
          <div className="flex items-center justify-between mb-8 pb-8 border-b">
            <div>
              <p className="text-sm text-gray-500">Monthly Subscription</p>
              <p className="text-4xl font-bold text-gray-900">250 <span className="text-2xl font-normal text-gray-500">BDT/month</span></p>
            </div>
            <div className="flex items-center gap-3 bg-red-50 px-5 py-3 rounded-sm">
              <div className="text-red-600">
                <Phone className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">bKash</p>
                <p className="text-lg font-semibold">01918-647966</p>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> How to Pay
            </h2>
            <div className="bg-gradient-to-r from-red-50 to-emerald-50 border border-red-100 rounded-sm p-6 space-y-5">
              <ol className="space-y-4 text-gray-700">
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-sm bg-red-100 text-red-700 flex items-center justify-center text-sm font-bold">1</div>
                  <div>Send <strong>250 BDT</strong> to bKash number <span className="font-mono font-semibold">01918647966</span></div>
                </li>
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-sm bg-red-100 text-red-700 flex items-center justify-center text-sm font-bold">2</div>
                  <div>Copy the <strong>Transaction ID</strong> from your bKash payment confirmation</div>
                </li>
                <li className="flex gap-4">
                  <div className="w-6 h-6 rounded-sm bg-red-100 text-red-700 flex items-center justify-center text-sm font-bold">3</div>
                  <div>Paste the Transaction ID below to activate your store</div>
                </li>
              </ol>

              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors mt-2"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy bKash Number'}
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> What You Get
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Single Product Landing Page",
                "Order Management System",
                "Inventory Management",
                "Customer Management",
                "Product Variants & Attributes",
                "Return & Refund Management",
                "Priority Customer Support",
                "Regular Updates & New Features",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-sm">
                  <CheckCircle2 className="w-5 h-5 text-red-600" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Info */}
          <div className="bg-red-50 border border-red-200 rounded-sm p-5 mb-8 flex gap-4">
            <Calendar className="w-6 h-6 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Monthly Subscription</p>
              <p>You will need to pay 250 BDT every month to keep your store active.</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
                bKash Transaction ID (This Month)
              </label>
              <input
                type="text"
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                placeholder="e.g., TRX8K9M2P4"
                className="w-full px-5 py-4 border border-gray-200 rounded-sm focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg font-mono"
                required
                minLength={5}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-emerald-600 hover:from-red-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-sm font-semibold text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-500/30"
            >
              {loading ? (
                <>Processing Payment...</>
              ) : (
                <>Pay 250 BDT & Activate Store <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            <p className="text-center text-xs text-gray-500">
              By submitting, you agree to the monthly subscription of 250 BDT
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}