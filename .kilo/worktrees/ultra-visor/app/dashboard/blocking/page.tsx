'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { FiShield, FiPhone, FiGlobe, FiTrash2, FiPlus, FiSettings, FiAlertTriangle } from 'react-icons/fi';
import { BlockedPhone, BlockedIp, BlockSettings } from '@/types';

export default function BlockingPage() {
  const [activeTab, setActiveTab] = useState<'phones' | 'ips' | 'settings'>('phones');
  const [phones, setPhones] = useState<BlockedPhone[]>([]);
  const [ips, setIps] = useState<BlockedIp[]>([]);
  const [settings, setSettings] = useState<BlockSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showIpModal, setShowIpModal] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newPhoneReason, setNewPhoneReason] = useState('');
  const [newIp, setNewIp] = useState('');
  const [newIpReason, setNewIpReason] = useState('');

  const fetchPhones = useCallback(async () => {
    try {
      const res = await api.get('/blocking/phones');
      if (res.data.success) setPhones(res.data.data.blockedPhones);
    } catch { showToast.error('Failed to load blocked phones'); }
  }, []);

  const fetchIps = useCallback(async () => {
    try {
      const res = await api.get('/blocking/ips');
      if (res.data.success) setIps(res.data.data.blockedIps);
    } catch { showToast.error('Failed to load blocked IPs'); }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/blocking/settings');
      if (res.data.success) setSettings(res.data.data);
    } catch { showToast.error('Failed to load block settings'); }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPhones(), fetchIps(), fetchSettings()]);
    setLoading(false);
  }, [fetchPhones, fetchIps, fetchSettings]);

  useEffect(() => { loadData(); }, [loadData]);

  // Block phone
  const handleBlockPhone = async () => {
    if (!newPhone.trim()) return showToast.error('Phone number is required');
    try {
      const res = await api.post('/blocking/phones', { phone: newPhone.trim(), reason: newPhoneReason });
      if (res.data.success) {
        showToast.success('Phone blocked successfully');
        setShowPhoneModal(false);
        setNewPhone('');
        setNewPhoneReason('');
        fetchPhones();
      }
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to block phone');
    }
  };

  // Unblock phone
  const handleUnblockPhone = async (phone: string) => {
    try {
      const res = await api.delete(`/blocking/phones/${encodeURIComponent(phone)}`);
      if (res.data.success) {
        showToast.success('Phone unblocked');
        fetchPhones();
      }
    } catch { showToast.error('Failed to unblock phone'); }
  };

  // Block IP
  const handleBlockIp = async () => {
    if (!newIp.trim()) return showToast.error('IP address is required');
    try {
      const res = await api.post('/blocking/ips', { ip: newIp.trim(), reason: newIpReason });
      if (res.data.success) {
        showToast.success('IP blocked successfully');
        setShowIpModal(false);
        setNewIp('');
        setNewIpReason('');
        fetchIps();
      }
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || 'Failed to block IP');
    }
  };

  // Unblock IP
  const handleUnblockIp = async (ip: string) => {
    try {
      const res = await api.delete(`/blocking/ips/${encodeURIComponent(ip)}`);
      if (res.data.success) {
        showToast.success('IP unblocked');
        fetchIps();
      }
    } catch { showToast.error('Failed to unblock IP'); }
  };

  // Update settings
  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      const res = await api.put('/blocking/settings', settings);
      if (res.data.success) {
        showToast.success('Settings updated');
        fetchSettings();
      }
    } catch { showToast.error('Failed to save settings'); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleString('bn-BD');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-sm h-12 w-12 border-2 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <FiShield className="w-6 h-6 text-red-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Order Blocking Management</h1>
        </div>
        <p className="text-gray-500 mt-1 text-sm">Manage phone blocks, IP blocks, and repeat order settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('phones')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all ${
            activeTab === 'phones' ? 'bg-red-50 text-red-700 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FiPhone className="w-4 h-4" /> Blocked Phones
        </button>
        <button
          onClick={() => setActiveTab('ips')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all ${
            activeTab === 'ips' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FiGlobe className="w-4 h-4" /> Blocked IPs
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all ${
            activeTab === 'settings' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FiSettings className="w-4 h-4" /> Repeat Order Settings
        </button>
      </div>

      {/* Phone Blocking Tab */}
      {activeTab === 'phones' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Blocked Phone Numbers ({phones.length})</h2>
            <button
              onClick={() => setShowPhoneModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-all text-sm font-medium"
            >
              <FiPlus className="w-4 h-4" /> Block Phone
            </button>
          </div>

          {phones.length === 0 ? (
            <div className="bg-gray-50 rounded-sm p-8 text-center border border-gray-200">
              <FiPhone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No blocked phones yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Blocked At</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {phones.map((p) => (
                    <tr key={p.id} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">{p.phone}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.reason || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(p.blockedAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleUnblockPhone(p.phone)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Unblock"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Block Phone Modal */}
          {showPhoneModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPhoneModal(false)}>
              <div className="bg-white rounded-sm p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Block Phone Number</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                      placeholder="e.g. 01712345678"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <input
                      type="text"
                      value={newPhoneReason}
                      onChange={e => setNewPhoneReason(e.target.value)}
                      placeholder="Why is this phone being blocked?"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowPhoneModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                      Cancel
                    </button>
                    <button onClick={handleBlockPhone} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-sm text-sm font-medium hover:bg-red-700 transition-all">
                      Block
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* IP Blocking Tab */}
      {activeTab === 'ips' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Blocked IP Addresses ({ips.length})</h2>
            <button
              onClick={() => setShowIpModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-sm hover:bg-purple-700 transition-all text-sm font-medium"
            >
              <FiPlus className="w-4 h-4" /> Block IP
            </button>
          </div>

          {ips.length === 0 ? (
            <div className="bg-gray-50 rounded-sm p-8 text-center border border-gray-200">
              <FiGlobe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No blocked IPs yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Blocked At</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ips.map((ip) => (
                    <tr key={ip.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">{ip.ip}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{ip.reason || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(ip.blockedAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleUnblockIp(ip.ip)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="Unblock"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Block IP Modal */}
          {showIpModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowIpModal(false)}>
              <div className="bg-white rounded-sm p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Block IP Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IP Address *</label>
                    <input
                      type="text"
                      value={newIp}
                      onChange={e => setNewIp(e.target.value)}
                      placeholder="e.g. 192.168.1.1"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <input
                      type="text"
                      value={newIpReason}
                      onChange={e => setNewIpReason(e.target.value)}
                      placeholder="Why is this IP being blocked?"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowIpModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                      Cancel
                    </button>
                    <button onClick={handleBlockIp} className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-sm text-sm font-medium hover:bg-purple-700 transition-all">
                      Block
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && settings && (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiSettings className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Repeat Order Blocking Settings</h2>
          </div>

          <div className="space-y-6 max-w-lg">
            {/* Enable/Disable Toggles */}
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-sm">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Enable Phone Blocking</p>
                  <p className="text-xs text-gray-500">Block orders from specific phone numbers</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enablePhoneBlock}
                  onChange={e => setSettings({ ...settings, enablePhoneBlock: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-sm">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Enable IP Blocking</p>
                  <p className="text-xs text-gray-500">Block orders from specific IP addresses</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableIpBlock}
                  onChange={e => setSettings({ ...settings, enableIpBlock: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-sm">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Enable Repeat Order Block</p>
                  <p className="text-xs text-gray-500">Prevent same customer from ordering repeatedly</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableRepeatBlock}
                  onChange={e => setSettings({ ...settings, enableRepeatBlock: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>

            {/* Numerical Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repeat Order Block Time (minutes)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.repeatOrderBlockMinutes}
                  onChange={e => setSettings({ ...settings, repeatOrderBlockMinutes: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min={0}
                />
                <p className="text-xs text-gray-400 mt-1">Current: 0.5 (30 seconds) | Default: 0.5</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Orders Per Day
                </label>
                <input
                  type="number"
                  value={settings.maxOrdersPerDay}
                  onChange={e => setSettings({ ...settings, maxOrdersPerDay: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min={0}
                />
                <p className="text-xs text-gray-400 mt-1">Default: 5</p>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-all text-sm font-medium"
            >
              Save Settings
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-red-50 rounded-sm border border-red-200">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">How Blocking Works</p>
                <ul className="text-xs text-red-700 mt-1 space-y-1 list-disc list-inside">
                  <li><strong>Phone Blocking</strong>: Blocked phone numbers cannot place orders</li>
                  <li><strong>IP Blocking</strong>: Blocked IP addresses cannot place orders</li>
                  <li><strong>Repeat Order Block</strong>: Same phone cannot order again within the set time window</li>
                  <li><strong>Daily Limit</strong>: Limits how many orders a phone can place per day</li>
                  <li>Incomplete checkouts are tracked but not counted toward repeat/daily limits</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}