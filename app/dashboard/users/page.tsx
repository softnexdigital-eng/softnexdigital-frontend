'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { User } from '@/types';
import { FiUserCheck, FiUserX, FiTrash2 } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch {
      showToast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await api.patch(`/users/${userId}/toggle-status`);
      if (res.data.success) {
        showToast.success(res.data.message);
        fetchUsers();
      }
    } catch {
      showToast.error(t('common.error'));
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(t('common.confirm') + '?')) return;
    try {
      const res = await api.delete(`/users/${userId}`);
      if (res.data.success) {
        showToast.success(t('common.delete') + ' ✓');
        fetchUsers();
      }
    } catch {
      showToast.error(t('common.error'));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-sm h-10 w-10 border-2 border-blue-600 border-t-transparent"></div></div>;
  }

  // Role translations
  const roleText: Record<string, string> = {
    SUPER_ADMIN: t('common.admin'),
    BUSINESS_ADMIN: t('users.businessAdmin'),
    STAFF: t('users.staff'),
  };

  return (
    <div className="max-w-8xl  mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t('users.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('users.subtitle')}</p>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">{t('users.noUsers')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('users.name')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('users.email')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('users.role')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('users.status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('users.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{user.name || 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{roleText[user.role] || user.role}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-sm ${user.isActive !== false ? 'bg-red-100 text-red-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive !== false ? t('users.active') : t('users.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleStatus(user.id)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${user.isActive !== false ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-red-50 text-red-700 hover:bg-red-100'} transition-colors`}>
                          {user.isActive !== false ? <FiUserX className="w-3 h-3" /> : <FiUserCheck className="w-3 h-3" />}
                          {user.isActive !== false ? t('common.block') : t('common.activate')}
                        </button>
                        <button onClick={() => handleDeleteUser(user.id, user.email)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
                          <FiTrash2 className="w-3 h-3" /> {t('common.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}