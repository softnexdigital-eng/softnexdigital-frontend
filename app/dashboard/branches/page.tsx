'use client';

import { useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';

const getApiErrorMessage = (error: unknown, fallback: string) =>
  isAxiosError<{ message?: string }>(error) ? error.response?.data?.message || fallback : fallback;

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseOpeningHours = (value: string): Record<string, unknown> => {
  const parsed: unknown = value ? JSON.parse(value) : {};
  if (!isObjectRecord(parsed)) throw new Error('Opening hours must be a JSON object');
  return parsed;
};

interface Branch {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  phone?: string;
  email?: string;
  address?: string;
  timezone?: string;
  openingHours?: Record<string, unknown>;
  managerId?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BranchMember {
  id: string;
  tenantId: string;
  branchId: string;
  userId: string;
  role: string;
  permissions: Record<string, boolean>;
  effectivePermissions: Record<string, boolean>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string; role: string; isActive: boolean };
}

interface BranchPermissionCatalog {
  groups: Record<string, string[]>;
  presets: Record<string, string[]>;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [membersBranch, setMembersBranch] = useState<Branch | null>(null);
  const [members, setMembers] = useState<BranchMember[]>([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);
  const [permissionCatalog, setPermissionCatalog] = useState<BranchPermissionCatalog>({ groups: {}, presets: {} });
  const [memberForm, setMemberForm] = useState({ userId: '', role: 'STAFF' });

  const [form, setForm] = useState({
    name: '',
    code: '',
    phone: '',
    email: '',
    address: '',
    timezone: 'Asia/Dhaka',
    openingHours: '',
    managerId: '',
    isDefault: false,
  });

  const fetchBranches = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/branches?page=1&limit=100');
      if (res.data.success) {
        setBranches(res.data.data.branches);
      }
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 403) {
        showToast.error('Session expired or insufficient permissions. Please log in again.');
      } else {
        showToast.error('Failed to load branches');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchBranches);
  }, [fetchBranches]);

  const handleCreateBranch = async () => {
    try {
      await api.post('/branches', {
        ...form,
        openingHours: parseOpeningHours(form.openingHours),
      });
      showToast.success('Branch created');
      setShowCreateModal(false);
      setForm({ name: '', code: '', phone: '', email: '', address: '', timezone: 'Asia/Dhaka', openingHours: '', managerId: '', isDefault: false });
      fetchBranches();
    } catch (error: unknown) {
      showToast.error(error instanceof Error ? error.message : getApiErrorMessage(error, 'Failed to create branch'));
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/branches/${id}/default`);
      showToast.success('Default branch set');
      fetchBranches();
    } catch (error: unknown) {
      showToast.error(getApiErrorMessage(error, 'Failed to set default branch'));
    }
  };

  const handleToggleStatus = async (branch: Branch) => {
    try {
      await api.patch(`/branches/${branch.id}/status`, { isActive: !branch.isActive });
      showToast.success(branch.isActive ? 'Branch deactivated' : 'Branch activated');
      fetchBranches();
    } catch (error: unknown) {
      showToast.error(getApiErrorMessage(error, 'Failed to update branch status'));
    }
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setForm({
      name: branch.name,
      code: branch.code,
      phone: branch.phone || '',
      email: branch.email || '',
      address: branch.address || '',
      timezone: branch.timezone || 'Asia/Dhaka',
      openingHours: JSON.stringify(branch.openingHours || {}),
      managerId: branch.managerId || '',
      isDefault: branch.isDefault,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editingBranch) return;
    let openingHours: Record<string, unknown> = {};
    try {
      openingHours = parseOpeningHours(form.openingHours);
    } catch {
      showToast.error('Opening hours must be valid JSON');
      return;
    }
    try {
      await api.put(`/branches/${editingBranch.id}`, {
        name: form.name,
        code: form.code,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        timezone: form.timezone || undefined,
        managerId: form.managerId || null,
        openingHours,
      });
      if (form.isDefault && !editingBranch.isDefault) {
        await api.patch(`/branches/${editingBranch.id}/default`);
      }
      showToast.success('Branch updated');
      setShowEditModal(false);
      setEditingBranch(null);
      fetchBranches();
    } catch (error: unknown) {
      showToast.error(getApiErrorMessage(error, 'Failed to update branch'));
    }
  };

  const handleRemoveBranchMember = async (member: BranchMember) => {
    if (!membersBranch) return;
    try {
      await api.delete(`/branches/${membersBranch.id}/members/${member.id}`);
      setMembers((current) => current.filter((entry) => entry.id !== member.id));
      showToast.success('Branch member removed');
    } catch (error: unknown) {
      showToast.error(getApiErrorMessage(error, 'Failed to remove branch member'));
    }
  };

  const handleAddBranchMember = async () => {
    if (!membersBranch || !memberForm.userId.trim()) return;
    try {
      const response = await api.post(`/branches/${membersBranch.id}/members`, {
        userId: memberForm.userId.trim(),
        role: memberForm.role,
      });
      setMembers((current) => [...current.filter((member) => member.id !== response.data.data.id), response.data.data]);
      setMemberForm({ userId: '', role: 'STAFF' });
      showToast.success('Branch member added');
    } catch (error: unknown) {
      showToast.error(getApiErrorMessage(error, 'Failed to add branch member'));
    }
  };

  const handleMemberRoleChange = async (member: BranchMember, role: string) => {
    if (!membersBranch) return;
    try {
      const response = await api.patch(`/branches/${membersBranch.id}/members/${member.id}`, { role });
      setMembers((current) => current.map((entry) => entry.id === member.id ? response.data.data : entry));
      showToast.success('Member role updated');
    } catch (error: unknown) {
      showToast.error(getApiErrorMessage(error, 'Failed to update member role'));
    }
  };

  const handleMemberPermissionChange = async (member: BranchMember, permission: string, allowed: boolean) => {
    if (!membersBranch) return;
    const permissions = { ...member.effectivePermissions, [permission]: allowed };
    try {
      const response = await api.patch(`/branches/${membersBranch.id}/members/${member.id}`, {
        role: 'CUSTOM',
        permissions,
      });
      setMembers((current) => current.map((entry) => entry.id === member.id ? response.data.data : entry));
    } catch (error: unknown) {
      showToast.error(getApiErrorMessage(error, 'Failed to update member permissions'));
    }
  };

  const openMembersModal = async (branch: Branch) => {
    setMembersBranch(branch);
    try {
      const [membersResponse, catalogResponse] = await Promise.all([
        api.get(`/branches/${branch.id}/members?page=1&limit=100`),
        api.get('/branches/permissions'),
      ]);
      if (membersResponse.data.success) {
        setMembers(membersResponse.data.data.memberships || []);
      }
      if (catalogResponse.data.success) {
        setPermissionCatalog(catalogResponse.data.data);
      }
    } catch (error: unknown) {
      showToast.error(getApiErrorMessage(error, 'Failed to load branch members and permissions'));
    }
    setMemberForm({ userId: '', role: 'STAFF' });
    setShowMembersModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-sm h-10 w-10 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="text-sm text-gray-500 mt-1">Manage branches for your business</p>
        </div>
        <button
          onClick={() => {
            setForm({ name: '', code: '', phone: '', email: '', address: '', timezone: 'Asia/Dhaka', openingHours: '', managerId: '', isDefault: false });
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-sm text-sm hover:bg-blue-700"
        >
          <span>+</span> Add Branch
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-2">No branches yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Manager</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Default</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{branch.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">{branch.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{branch.managerId || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${branch.isActive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                      {branch.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{branch.isDefault ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingBranch(branch)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => openMembersModal(branch)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        Members
                      </button>
                      <button
                        onClick={() => handleSetDefault(branch.id)}
                        disabled={branch.isDefault}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40"
                      >
                        Set Default
                      </button>
                      <button
                        onClick={() => handleToggleStatus(branch)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        {branch.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => openEditModal(branch)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {viewingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30" role="dialog" aria-modal="true" aria-labelledby="branch-details-title">
          <div className="bg-white rounded-sm shadow-xl p-6 w-full max-w-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 id="branch-details-title" className="text-lg font-semibold text-gray-900">Branch Details</h3>
              <button onClick={() => setViewingBranch(null)} className="min-h-12 min-w-12 text-gray-500" aria-label="Close branch details">✕</button>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Name</dt><dd className="font-medium">{viewingBranch.name}</dd></div>
              <div><dt className="text-gray-500">Code</dt><dd className="font-medium">{viewingBranch.code}</dd></div>
              <div><dt className="text-gray-500">Phone</dt><dd className="font-medium">{viewingBranch.phone || '-'}</dd></div>
              <div><dt className="text-gray-500">Email</dt><dd className="font-medium">{viewingBranch.email || '-'}</dd></div>
              <div><dt className="text-gray-500">Address</dt><dd className="font-medium">{viewingBranch.address || '-'}</dd></div>
              <div><dt className="text-gray-500">Timezone</dt><dd className="font-medium">{viewingBranch.timezone || '-'}</dd></div>
              <div><dt className="text-gray-500">Status</dt><dd className="font-medium">{viewingBranch.isActive ? 'Active' : 'Inactive'}</dd></div>
              <div><dt className="text-gray-500">Default branch</dt><dd className="font-medium">{viewingBranch.isDefault ? 'Yes' : 'No'}</dd></div>
            </dl>
          </div>
        </div>
      )}

      {/* Create Branch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-sm shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Add Branch</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="e.g. Dhaka Branch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="e.g. DHAKA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                  placeholder="Address"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateBranch}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold"
                >
                  Create
                </button>
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 text-sm font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {showEditModal && editingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-sm shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Edit Branch</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Is Default</label>
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleEditSubmit}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold"
                >
                  Save Changes
                </button>
                <button onClick={() => { setShowEditModal(false); setEditingBranch(null); }} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 text-sm font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && membersBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-sm shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Branch Members</h3>
              <button onClick={() => setShowMembersModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mb-5">
              <label className="sr-only" htmlFor="branch-member-user-id">Tenant user ID</label>
              <input
                id="branch-member-user-id"
                value={memberForm.userId}
                onChange={(event) => setMemberForm((current) => ({ ...current, userId: event.target.value }))}
                placeholder="Tenant user ID"
                className="min-h-12 flex-1 px-3 border border-gray-200 rounded-sm text-sm"
              />
              <label className="sr-only" htmlFor="branch-member-role">Role preset</label>
              <select
                id="branch-member-role"
                value={memberForm.role}
                onChange={(event) => setMemberForm((current) => ({ ...current, role: event.target.value }))}
                className="min-h-12 px-3 border border-gray-200 rounded-sm text-sm"
              >
                {Object.keys(permissionCatalog.presets).map((role) => <option key={role} value={role}>{role.replaceAll('_', ' ')}</option>)}
              </select>
              <button
                onClick={handleAddBranchMember}
                disabled={!memberForm.userId.trim()}
                className="min-h-12 px-4 bg-blue-600 text-white rounded-sm text-sm font-medium disabled:opacity-50"
              >
                Add member
              </button>
            </div>
            {members.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">No members found.</p>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-sm">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.user?.name || member.userId}</p>
                      <p className="text-xs text-gray-500">{member.user?.email || member.userId}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="sr-only" htmlFor={`member-role-${member.id}`}>Role for {member.user?.name || member.userId}</label>
                      <select
                        id={`member-role-${member.id}`}
                        value={member.role}
                        onChange={(event) => void handleMemberRoleChange(member, event.target.value)}
                        className="min-h-12 px-2 border border-gray-200 rounded-sm text-xs font-semibold"
                      >
                        {!Object.prototype.hasOwnProperty.call(permissionCatalog.presets, member.role) && (
                          <option value={member.role}>{member.role.replaceAll('_', ' ')}</option>
                        )}
                        {Object.keys(permissionCatalog.presets).map((role) => <option key={role} value={role}>{role.replaceAll('_', ' ')}</option>)}
                      </select>
                      <button
                        onClick={() => handleRemoveBranchMember(member)}
                        className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg min-h-12"
                      >
                        Remove
                      </button>
                    </div>
                    {member.role === 'CUSTOM' && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(permissionCatalog.groups).map(([group, permissions]) => (
                          <fieldset key={group} className="border border-gray-200 rounded-sm p-3">
                            <legend className="px-1 text-xs font-semibold capitalize">{group}</legend>
                            <div className="space-y-2">
                              {permissions.map((permission) => (
                                <label key={permission} className="flex items-center gap-2 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={member.effectivePermissions[permission] === true}
                                    onChange={(event) => void handleMemberPermissionChange(member, permission, event.target.checked)}
                                  />
                                  {permission}
                                </label>
                              ))}
                            </div>
                          </fieldset>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowMembersModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 text-sm font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}