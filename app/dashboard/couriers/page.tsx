'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { FiTruck, FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiRefreshCcw } from 'react-icons/fi';

interface Courier {
  id: string;
  tenantId: string;
  name: string;
  apiKey: string;
  apiSecret: string;
  webhookUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CouriersPage() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    name: '',
    apiKey: '',
    apiSecret: '',
    webhookUrl: '',
    isActive: true,
  };

  const [form, setForm] = useState(emptyForm);

  const fetchCouriers = useCallback(async () => {
    try {
      const response = await api.get('/couriers');
      if (response.data.success) {
        setCouriers(response.data.data || []);
      }
    } catch {
      showToast.error('কুরিয়ার লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCouriers();
  }, [fetchCouriers]);

  const openCreateModal = () => {
    setEditingCourier(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (courier: Courier) => {
    setEditingCourier(courier);
    setForm({
      name: courier.name,
      apiKey: courier.apiKey,
      apiSecret: courier.apiSecret,
      webhookUrl: courier.webhookUrl || '',
      isActive: courier.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCourier) {
        await api.put(`/couriers/${editingCourier.id}`, form);
        showToast.success('কুরিয়ার আপডেট হয়েছে');
      } else {
        await api.post('/couriers', form);
        showToast.success('কুরিয়ার যোগ করা হয়েছে');
      }
      setShowModal(false);
      fetchCouriers();
    } catch {
      showToast.error('সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি এই কুরিয়ার্টি ডিলিট করতে চান?')) return;
    try {
      await api.delete(`/couriers/${id}`);
      showToast.success('কুরিয়ার ডিলিট করা হয়েছে');
      fetchCouriers();
    } catch {
      showToast.error('ডিলিট করতে সমস্যা হয়েছে');
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await api.patch(`/couriers/${id}/toggle`);
      showToast.success('স্ট্যাটাস আপডেট হয়েছে');
      fetchCouriers();
    } catch {
      showToast.error('স্ট্যাটাস অ্যাপডেট করতে সমস্যা হয়েছে');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-sm h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">কুরিয়ার পরিষেবা</h1>
          <p className="text-gray-500 mt-1 text-sm">আপনার কুরিয়ার সেবা ম্যানেজ করুন</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 font-semibold shadow-md transition-all"
        >
          <FiPlus className="w-4 h-4" />
          নতুন কুরিয়ার যোগ করুন
        </button>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">কুরিয়ার নাম</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">API কী</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">ওয়েবহুক URL</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">স্ট্যাটাস</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {couriers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <FiTruck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>কোনো কুরিয়ার যোগ করা হয়নি</p>
                  </td>
                </tr>
              ) : (
                couriers.map((courier) => (
                  <tr key={courier.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-sm bg-blue-50 flex items-center justify-center text-blue-600">
                          <FiTruck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{courier.name}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(courier.createdAt).toLocaleDateString('bn-BD')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-xs font-mono text-gray-600">{courier.apiKey.slice(0, 8)}...</div>
                        <div className="text-xs text-gray-400">Secret: {courier.apiSecret.slice(0, 6)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-600 max-w-xs truncate">
                        {courier.webhookUrl || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-sm ${
                        courier.isActive ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {courier.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(courier.id)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                          title={courier.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                        >
                          {courier.isActive ? (
                            <FiToggleRight className="w-5 h-5" />
                          ) : (
                            <FiToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(courier)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                          title="সম্পাদনা"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(courier.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                          title="ডিলিট"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-sm shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingCourier ? 'কুরিয়ার সম্পাদনা' : 'নতুন কুরিয়ার যোগ করুন'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">কুরিয়ার নাম *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="যেমন: Steadfast Courier"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">API Key *</label>
                    <input
                      value={form.apiKey}
                      onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                      placeholder="আপনার API Key"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Secret Key *</label>
                    <input
                      value={form.apiSecret}
                      onChange={(e) => setForm({ ...form, apiSecret: e.target.value })}
                      type="password"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                      placeholder="আপনার Secret Key"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">ওয়েবহুক URL</label>
                    <input
                      value={form.webhookUrl}
                      onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      placeholder="https://yourdomain.com/api/webhooks/steadfast"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:opacity-50 font-semibold shadow-md transition-all"
                  >
                    {saving ? 'সংরক্ষণ 중...' : 'সংরক্ষণ করুন'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-sm hover:bg-gray-50 font-semibold transition-all"
                  >
                    বাতিল
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}