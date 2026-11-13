'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { FiSearch, FiTrash2, FiRefreshCw, FiGlobe, FiMonitor, FiUser, FiPhone, FiMail, FiMapPin, FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface IncompleteCheckoutItem {
  id: string;
  tenantId: string;
  sessionId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
  notes: string | null;
  variantId: string | null;
  quantity: number | null;
  cartSessionId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  formOpenedAt: string;
  lastUpdatedAt: string;
  createdAt: string;
}

interface Stats {
  total: number;
  todayCount: number;
  withPhoneCount: number;
  withNameCount: number;
}

function formatBDTDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTimeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'এখনই';
  if (mins < 60) return `${mins} মিনিট আগে`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ঘন্টা আগে`;
  const days = Math.floor(hours / 24);
  return `${days} দিন আগে`;
}

function getFilledCount(item: IncompleteCheckoutItem): number {
  let count = 0;
  if (item.customerName) count++;
  if (item.customerPhone) count++;
  if (item.customerEmail) count++;
  if (item.customerAddress) count++;
  if (item.notes) count++;
  return count;
}

function getCompletionPercentage(item: IncompleteCheckoutItem): number {
  const total = 5; // name, phone, email, address, notes
  return Math.round((getFilledCount(item) / total) * 100);
}

function truncateUA(ua: string | null, maxLen = 60): string {
  if (!ua) return '-';
  if (ua.length <= maxLen) return ua;
  return ua.substring(0, maxLen) + '...';
}

export default function IncompleteCheckoutsPage() {
  const [items, setItems] = useState<IncompleteCheckoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<IncompleteCheckoutItem | null>(null);

  const fetchItems = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (search) params.search = search;
      const res = await api.get('/incomplete-checkouts', { params });
      if (res.data.success) {
        setItems(res.data.data.items || []);
      }
    } catch {
      showToast.error('ডাটা লোড করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/incomplete-checkouts/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, [fetchItems, fetchStats]);

  const handleDelete = async (id: string) => {
    if (!confirm('এই এন্ট্রিটি ডিলিট করবেন? এটি পূর্বাবস্থায় ফেরানো যাবে না।')) return;
    try {
      const res = await api.delete(`/incomplete-checkouts/${id}`);
      if (res.data.success) {
        showToast.success('ডিলিট করা হয়েছে');
        fetchItems(searchQuery);
        fetchStats();
      }
    } catch {
      showToast.error('ডিলিট করতে ব্যর্থ');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems(searchQuery);
  };

  const handleRefresh = () => {
    setSearchQuery('');
    fetchItems();
    fetchStats();
  };

  const filteredItems = searchQuery
    ? items
    : items;

  return (
    <div className="max-w-8xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">অসম্পূর্ণ অর্ডার</h1>
          <p className="text-gray-500 mt-1 text-sm">
            যেসকল ইউজার ফর্ম ফিলআপ শুরু করে অর্ডার সম্পন্ন করেনি
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম, ফোন, আইপি অনুসন্ধান..."
              className="w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-sm text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </form>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" /> রিফ্রেশ
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">মোট</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">আজকে</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.todayCount}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ফোন সহ</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.withPhoneCount}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">নাম সহ</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.withNameCount}</p>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-sm shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">বিস্তারিত তথ্য</h2>
              <button onClick={() => setSelectedItem(null)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 flex items-center justify-center rounded-sm">
                <FiXCircle className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">নাম</p>
                  <p className="text-sm font-medium text-gray-900">{selectedItem.customerName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">ফোন</p>
                  <p className="text-sm font-medium text-gray-900">{selectedItem.customerPhone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">ইমেইল</p>
                  <p className="text-sm font-medium text-gray-900">{selectedItem.customerEmail || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">ঠিকানা</p>
                  <p className="text-sm font-medium text-gray-900">{selectedItem.customerAddress || '-'}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">টেকনিক্যাল তথ্য</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">আইপি ঠিকানা</p>
                    <p className="text-sm font-mono text-gray-900">{selectedItem.ipAddress || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">সেশন আইডি</p>
                    <p className="text-sm font-mono text-gray-900 text-xs truncate">{selectedItem.sessionId || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">ইউজার এজেন্ট (ব্রাউজার)</p>
                    <p className="text-sm text-gray-900 break-all">{selectedItem.userAgent || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">টাইমলাইন</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">ফর্ম খোলা</p>
                    <p className="text-sm text-gray-900">{formatBDTDate(selectedItem.formOpenedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">সর্বশেষ আপডেট</p>
                    <p className="text-sm text-gray-900">{formatBDTDate(selectedItem.lastUpdatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-sm h-12 w-12 border-2 border-red-500 border-t-transparent"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-12 text-center">
          <FiAlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">কোনো অসম্পূর্ণ অর্ডার পাওয়া যায়নি</p>
          <p className="text-gray-400 text-sm mt-1">যখন ইউজাররা ফর্ম ফিলআপ শুরু করে অর্ডার না করে চলে যাবে, তখন এখানে দেখা যাবে</p>
        </div>
      ) : (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">গ্রাহক তথ্য</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">আইপি ঠিকানা</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">পূরণ %</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">সর্বশেষ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredItems.map((item) => {
                  const pct = getCompletionPercentage(item);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-red-50/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-white text-xs font-bold ${
                            item.customerName ? 'bg-red-500' : 'bg-gray-300'
                          }`}>
                            <FiUser className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {item.customerName || <span className="text-gray-400">নাম নেই</span>}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              {item.customerPhone && (
                                <span className="flex items-center gap-1">
                                  <FiPhone className="w-3 h-3" /> {item.customerPhone}
                                </span>
                              )}
                              {item.customerEmail && (
                                <span className="flex items-center gap-1">
                                  <FiMail className="w-3 h-3" /> {item.customerEmail}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {item.ipAddress ? (
                          <div className="flex items-center gap-1.5">
                            <FiGlobe className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm font-mono text-gray-700">{item.ipAddress}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 60 ? 'bg-emerald-500' : pct >= 20 ? 'bg-red-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${
                            pct >= 60 ? 'text-emerald-600' : pct >= 20 ? 'text-red-600' : 'text-red-600'
                          }`}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-700">{getTimeAgo(item.lastUpdatedAt)}</div>
                        <div className="text-xs text-gray-400">{formatBDTDate(item.createdAt)}</div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-sm hover:bg-red-100 transition-colors"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" /> ডিলিট
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              মোট: <span className="font-semibold text-gray-900">{filteredItems.length}টি</span> অসম্পূর্ণ অর্ডার
            </p>
          </div>
        </div>
      )}
    </div>
  );
}