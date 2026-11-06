'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { Expense } from '@/types';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign } from 'react-icons/fi';

const EXPENSE_CATEGORIES = ['Rent', 'Salary', 'Marketing', 'Utilities', 'Raw Materials', 'Transport', 'Packaging', 'Maintenance', 'Software', 'Other'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category: 'Rent', amount: '', description: '', date: new Date().toISOString().split('T')[0] });

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      if (res.data.success) { setExpenses(res.data.data.expenses || []); setTotalExpenses(res.data.data.total || 0); }
    } catch { showToast.error('Failed to load expenses'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchExpenses(); }, []);

  const resetForm = () => setForm({ category: 'Rent', amount: '', description: '', date: new Date().toISOString().split('T')[0] });

  const openCreate = () => { resetForm(); setEditing(null); setShowForm(true); };
  const openEdit = (e: Expense) => { setEditing(e); setForm({ category: e.category, amount: String(e.amount), description: e.description || '', date: e.date.split('T')[0] }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) { showToast.error('Valid amount is required'); return; }
    setSaving(true);
    try {
      const payload = { category: form.category, amount: parseFloat(form.amount), description: form.description, date: form.date };
      if (editing) { await api.put(`/expenses/${editing.id}`, payload); showToast.success('Expense updated'); }
      else { await api.post('/expenses', payload); showToast.success('Expense added'); }
      fetchExpenses(); setShowForm(false); resetForm();
    } catch (err: any) { showToast.error(err.response?.data?.message || 'Error saving expense'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try { await api.delete(`/expenses/${id}`); showToast.success('Expense deleted'); fetchExpenses(); }
    catch { showToast.error('Error deleting expense'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-sm h-10 w-10 border-2 border-blue-600 border-t-transparent"></div></div>;

  return (
    <div className="max-w-8xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">Track your business expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-sm text-sm font-semibold flex items-center gap-1.5">
            <FiDollarSign className="w-4 h-4" /> Total: ৳{totalExpenses.toFixed(2)}
          </div>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-sm hover:bg-blue-700 transition-all font-semibold">
            <FiPlus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-5 md:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit Expense' : 'Add Expense'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm">
                  {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (৳) *</label>
                <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="Optional description" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold">
                {saving ? 'Saving...' : (editing ? 'Update' : 'Create')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 text-sm font-semibold">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-8 md:p-12 text-center">
          <p className="text-gray-500">No expenses yet. Add your first expense.</p>
        </div>
      ) : (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 rounded-lg px-2 py-0.5 text-xs">{exp.category}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{exp.description || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">৳{exp.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(exp)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(exp.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 className="w-3.5 h-3.5" /></button>
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