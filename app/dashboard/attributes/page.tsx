'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';

interface AttributeTemplate {
  id: string;
  name: string;
  type: string;
  options: string[];
  isActive: boolean;
  createdAt: string;
}

export default function AttributesPage() {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<AttributeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AttributeTemplate | null>(null);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('text');
  const [formOptions, setFormOptions] = useState<string[]>([]);
  const [formOptionInput, setFormOptionInput] = useState('');
  const [saving, setSaving] = useState(false);

  const loadTemplates = async () => {
    try {
      const res = await api.get('/attribute-templates');
      if (res.data.success) setTemplates(res.data.data || []);
    } catch {
      showToast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTemplates(); }, []);

  const resetForm = () => {
    setFormName(''); setFormType('text'); setFormOptions([]); setFormOptionInput(''); setEditing(null);
  };

  const openCreateForm = () => { resetForm(); setShowForm(true); };
  const openEditForm = (tpl: AttributeTemplate) => {
    setEditing(tpl); setFormName(tpl.name); setFormType(tpl.type); setFormOptions(tpl.options || []); setFormOptionInput(''); setShowForm(true);
  };

  const addOption = () => {
    const val = formOptionInput.trim();
    if (!val) return;
    if (formOptions.includes(val)) { showToast.error(t('attributes.optionExists')); return; }
    setFormOptions([...formOptions, val]); setFormOptionInput('');
  };

  const removeOption = (idx: number) => setFormOptions(formOptions.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { showToast.error(t('attributes.nameReq')); return; }
    if (formOptions.length === 0) { showToast.error(t('attributes.optionReq')); return; }
    setSaving(true);
    try {
      const payload = { name: formName.trim(), type: formType, options: formOptions };
      if (editing) {
        await api.put(`/attribute-templates/${editing.id}`, payload);
        showToast.success(t('attributes.updated'));
      } else {
        await api.post('/attribute-templates', payload);
        showToast.success(t('attributes.created'));
      }
      loadTemplates(); setShowForm(false); resetForm();
    } catch (err: any) {
      showToast.error(err.response?.data?.message || t('common.error'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('attributes.deleteConfirm'))) return;
    try { await api.delete(`/attribute-templates/${id}`); showToast.success(t('attributes.deleted')); loadTemplates(); }
    catch { showToast.error(t('common.error')); }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-sm h-10 w-10 border-2 border-blue-600 border-t-transparent"></div></div>;
  }

  return (
    <div className="max-w-8xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t('attributes.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('attributes.subtitle')}</p>
        </div>
        <button onClick={openCreateForm}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-sm hover:bg-blue-700 transition-all font-semibold">
          <FiPlus className="w-4 h-4" /> {t('attributes.add')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-5 md:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editing ? t('attributes.editTitle') : t('attributes.createTitle')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('attributes.name')} *</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder={t('attributes.name')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('attributes.displayType')}</label>
                <select value={formType} onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  <option value="text">{t('attributes.typeText')}</option>
                  <option value="color">{t('attributes.typeColor')}</option>
                  <option value="number">{t('attributes.typeNumber')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('attributes.options')} *</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={formOptionInput} onChange={(e) => setFormOptionInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder={t('attributes.optionsPlaceholder')} />
                <button type="button" onClick={addOption}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 text-sm font-semibold">{t('attributes.addOption')}</button>
              </div>
              {formOptions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formOptions.map((opt, idx) => (
                    <span key={idx} className="inline-flex items-center bg-blue-100 text-blue-800 rounded-sm px-3 py-1 text-sm">
                      {opt}
                      <button type="button" onClick={() => removeOption(idx)} className="ml-2 text-blue-600 hover:text-blue-800"><FiX size={14} /></button>
                    </span>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-400">{t('attributes.noOptions')}</p>}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:opacity-50 transition-all text-sm font-semibold">
                {saving ? t('common.saving') : (editing ? t('common.update') : t('common.create'))}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 transition-all text-sm font-semibold">
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-8 md:p-12 text-center">
          <p className="text-gray-600 mb-2">{t('attributes.noData')}</p>
          <p className="text-sm text-gray-400">{t('attributes.example')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-white rounded-sm shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{tpl.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">{tpl.type}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditForm(tpl)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 size={14} /></button>
                  <button onClick={() => handleDelete(tpl.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 size={14} /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(tpl.options || []).map((opt, idx) => (
                  <span key={idx} className="bg-gray-50 text-gray-600 rounded px-2 py-0.5 text-xs border border-gray-100">{opt}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}