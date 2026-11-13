'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { Variant, Supplier } from '@/types';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiMove } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';

interface AttributeTemplate {
  id: string;
  name: string;
  type: string;
  options: string[];
}

interface VariantWithExtra extends Variant {
  costPrice?: number;
  supplierId?: string;
}

type VariantFormData = {
  productId: string;
  sku: string;
  price: number;
  compareAtPrice: number;
  costPrice: number;
  stock: number;
  image: string;
  supplierId: string;
};

type VariantDraft = {
  attributes: Record<string, string>;
  sku: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  image: string;
};

export default function VariantsPage() {
  const { t } = useLanguage();
  const [variants, setVariants] = useState<VariantWithExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [attributeTemplates, setAttributeTemplates] = useState<AttributeTemplate[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [bulkShow, setBulkShow] = useState(false);
  const [bulkBasePrice, setBulkBasePrice] = useState('');
  const [bulkSkuPrefix, setBulkSkuPrefix] = useState('');
  const [bulkOptions, setBulkOptions] = useState<Record<string, string[]>>({});
  const [bulkDrafts, setBulkDrafts] = useState<VariantDraft[]>([]);
  const [generating, setGenerating] = useState(false);

  // Drag and drop state for attribute reordering
  const [draggedOption, setDraggedOption] = useState<{ attrName: string; index: number } | null>(null);
  const [orderedOptions, setOrderedOptions] = useState<Record<string, string[]>>({});

  // Color-wise image URLs
  const [colorImageUrls, setColorImageUrls] = useState<Record<string, string>>({});

  const { register, handleSubmit, formState: { errors }, reset } = useForm<VariantFormData>();

  const fetchVariants = async (productId = selectedProductId) => {
    if (!productId) {
      setVariants([]);
      setLoading(false);
      return;
    }
    try {
      const response = await api.get(`/variants?productId=${productId}`);
      if (response.data.success) {
        setVariants(response.data.data || []);
      }
    } catch {
      showToast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/product');
      if (res.data.success) {
        const data = res.data.data;
        const productList = data.products || data || [];
        setProducts(Array.isArray(productList) ? productList : []);
      }
    } catch {}
  };

  const fetchAttributeTemplates = async () => {
    try {
      const res = await api.get('/attribute-templates');
      if (res.data.success) {
        const templates = res.data.data || [];
        setAttributeTemplates(templates);
        // Initialize ordered options with existing order from templates
        const opts: Record<string, string[]> = {};
        templates.forEach((tpl: AttributeTemplate) => {
          opts[tpl.name] = [...(tpl.options || [])];
        });
        setOrderedOptions(opts);
        setBulkOptions(opts);
      }
    } catch {}
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      if (res.data.success) setSuppliers(res.data.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchProducts();
    fetchVariants();
    fetchAttributeTemplates();
    fetchSuppliers();
  }, []);

  // Drag and drop handlers
  const handleDragStart = (attrName: string, index: number) => {
    setDraggedOption({ attrName, index });
  };

  const handleDragOver = (e: React.DragEvent, attrName: string, index: number) => {
    e.preventDefault();
    if (!draggedOption || draggedOption.attrName !== attrName) return;
    const opts = [...(orderedOptions[attrName] || [])];
    const fromIndex = draggedOption.index;
    if (fromIndex === index) return;
    const [movedItem] = opts.splice(fromIndex, 1);
    opts.splice(index, 0, movedItem);
    setOrderedOptions({ ...orderedOptions, [attrName]: opts });
    setDraggedOption({ attrName, index });
  };

  const handleDragEnd = () => {
    setDraggedOption(null);
  };

  const buildAttributesFromSelections = (): Record<string, string> => {
    const attrs: Record<string, string> = {};
    for (const [key, val] of Object.entries(selectedAttributes)) {
      if (val) attrs[key] = val;
    }
    return attrs;
  };

  const onSubmit = async (data: VariantFormData) => {
    try {
      if (!selectedProductId) {
        showToast.error(t('variants.selectProductReq') || 'Please select a product first');
        return;
      }
      const attributes = buildAttributesFromSelections();
      if (Object.keys(attributes).length === 0) {
        showToast.error(t('variants.selectAttrReq'));
        return;
      }
      const payload = {
        productId: selectedProductId,
        sku: data.sku,
        price: Number(data.price),
        compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
        costPrice: data.costPrice ? Number(data.costPrice) : 0,
        stock: Number(data.stock),
        image: data.image || undefined,
        attributes,
        supplierId: data.supplierId || undefined,
      };
      let savedVariantId: string | undefined;
      if (editingVariant) {
        const res = await api.put(`/variants/${editingVariant.id}`, payload);
        savedVariantId = res.data.data?.id || editingVariant.id;
        showToast.success(t('variants.updated'));
      } else {
        const res = await api.post('/variants', payload);
        savedVariantId = res.data.data?.id;
        showToast.success(t('variants.created'));
      }

      // Save color image URLs as variant images
      if (savedVariantId && attributes.Color) {
        const colorValues = Array.isArray(attributes.Color)
          ? attributes.Color
          : [attributes.Color];
        const colorImages = colorValues
          .map((color) => {
            const url = colorImageUrls[color];
            if (!url || !url.trim()) return null;
            return {
              variantId: savedVariantId,
              url: url.trim(),
              altText: color,
              color: color,
              isPrimary: false,
              sortOrder: 0,
            };
          })
          .filter(Boolean);

        for (const imgData of colorImages) {
          try {
            await api.post('/variant-images', imgData);
          } catch (e) {
            console.error('Failed to save color image:', imgData, e);
          }
        }
      }

      fetchVariants();
      setShowForm(false);
      setEditingVariant(null);
      reset({ productId: selectedProductId });
      setSelectedAttributes({});
      setColorImageUrls({});
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showToast.error(err.response?.data?.message || t('common.error'));
    }
  };

  const handleEdit = (variant: VariantWithExtra) => {
    const variantProductId = variant.productId;
    if (variantProductId) {
      setSelectedProductId(variantProductId);
      fetchVariants(variantProductId);
    }
    setEditingVariant(variant);
    setSelectedAttributes(variant.attributes as Record<string, string>);
    reset({
      productId: variantProductId || selectedProductId,
      sku: variant.sku,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice || 0,
      costPrice: variant.costPrice || 0,
      stock: variant.stock,
      image: variant.image || '',
      supplierId: variant.supplierId || '',
    });
    // Load existing color images
    const colorImgs: Record<string, string> = {};
    const existingImgs = variant.variantImages || [];
    if (variant.attributes && typeof variant.attributes === 'object') {
      const attrs = variant.attributes as Record<string, string>;
      const colorVal = attrs.Color;
      if (colorVal) {
        const colors = Array.isArray(colorVal) ? colorVal : [colorVal];
        colors.forEach((c: string) => {
          const found = existingImgs.find((img) => img.altText === c || img.color === c);
          colorImgs[c] = found ? found.url : '';
        });
      }
    }
    setColorImageUrls(colorImgs);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('variants.deleteConfirm'))) return;
    try {
      await api.delete(`/variants/${id}`);
      showToast.success(t('variants.deleted'));
      fetchVariants();
    } catch {
      showToast.error(t('common.error'));
    }
  };

  const handleAdjustStock = async (id: string) => {
    const quantity = prompt(t('variants.adjustStockPrompt'));
    if (!quantity) return;
    try {
      await api.post(`/variants/${id}/adjust-stock`, { quantity: Number(quantity), reason: 'manual_adjustment' });
      showToast.success(t('variants.stockAdjusted'));
      fetchVariants();
    } catch {
      showToast.error(t('common.error'));
    }
  };

  const handleBulkGenerate = () => {
    if (!selectedProductId) { showToast.error(t('variants.selectProductReq') || 'Please select a product first'); return; }
    if (!bulkSkuPrefix.trim()) { showToast.error(t('variants.bulkSkuPrefix') + ' required'); return; }
    if (!bulkBasePrice) { showToast.error(t('variants.bulkBasePrice') + ' required'); return; }
    const attrsMap: Record<string, string[]> = {};
    for (const tpl of attributeTemplates) {
      const selectedOptions = new Set(bulkOptions[tpl.name] || []);
      const opts = (orderedOptions[tpl.name] || tpl.options || []).filter((option) => selectedOptions.has(option));
      if (opts.length > 0) attrsMap[tpl.name] = opts;
    }
    if (Object.keys(attrsMap).length === 0) {
      showToast.error(t('variants.bulkNoAttr'));
      return;
    }
    const combinations = Object.entries(attrsMap).reduce<Record<string, string>[]>(
      (rows, [key, values]) => rows.flatMap((row) => values.map((value) => ({ ...row, [key]: value }))),
      [{}],
    );
    const skuPrefix = bulkSkuPrefix.trim();
    const drafts = combinations.map((attributes) => ({
      attributes,
      sku: `${skuPrefix}-${Object.values(attributes).join('-')}`.replace(/[^a-zA-Z0-9_-]/g, '-'),
      price: bulkBasePrice,
      compareAtPrice: '',
      stock: '0',
      image: colorImageUrls[attributes.Color] || '',
    }));
    if (new Set(drafts.map((draft) => draft.sku.toLowerCase())).size !== drafts.length) {
      showToast.error('Generated SKUs must be unique');
      return;
    }
    setBulkDrafts(drafts);
  };

  const createBulkVariants = async () => {
    if (!selectedProductId || bulkDrafts.length === 0) return;
    setGenerating(true);
    const failed: VariantDraft[] = [];
    let firstFailure = '';
    for (const draft of bulkDrafts) {
      const price = Number(draft.price);
      const stock = Number(draft.stock);
      const compareAtPrice = draft.compareAtPrice ? Number(draft.compareAtPrice) : undefined;
      if (!draft.sku.trim() || !Number.isFinite(price) || price < 0 ||
          !Number.isFinite(stock) || stock < 0 ||
          (compareAtPrice !== undefined && (!Number.isFinite(compareAtPrice) || compareAtPrice < 0))) {
        failed.push(draft);
        firstFailure = 'প্রতিটি সারিতে বৈধ SKU, দাম ও স্টক দিন।';
        continue;
      }
      try {
        await api.post('/variants', {
          productId: selectedProductId,
          sku: draft.sku.trim(),
          price,
          compareAtPrice,
          stock,
          image: draft.image.trim() || undefined,
          attributes: draft.attributes,
        });
      } catch (error: unknown) {
        failed.push(draft);
        const apiError = error as { response?: { data?: { message?: string } } };
        firstFailure ||= apiError.response?.data?.message || 'ভ্যারিয়েন্ট সংরক্ষণ করা যায়নি।';
      }
    }
    const created = bulkDrafts.length - failed.length;
    if (created > 0) {
      showToast.success(`Created ${created} variants`);
      fetchVariants(selectedProductId);
    }
    if (failed.length > 0) showToast.error(`${failed.length}টি ভ্যারিয়েন্ট সংরক্ষণ হয়নি: ${firstFailure}`);
    setBulkDrafts(failed);
    if (failed.length === 0) setBulkShow(false);
    setGenerating(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-sm h-10 w-10 border-2 border-blue-600 border-t-transparent"></div></div>;
  }

  return (
    <div className="max-w-8xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t('variants.title')}</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => setBulkShow(!bulkShow)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm rounded-sm hover:bg-red-700 transition-all">
            <FiRefreshCw className="w-4 h-4" /> {t('variants.bulkGenerate')}
          </button>
          <button onClick={() => { setEditingVariant(null); setSelectedAttributes({}); reset({ sku: '', price: 0, compareAtPrice: 0, costPrice: 0, stock: 0, image: '', supplierId: '' }); setShowForm(true); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-sm hover:bg-blue-700 transition-all">
            <FiPlus className="w-4 h-4" /> {t('variants.add')}
          </button>
        </div>
      </div>

      {/* Product Selector */}
      {products.length > 0 && (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-5 md:p-6 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <label className="text-sm font-medium text-gray-700 mb-1 sm:mb-0">{t('variants.selectProduct') || 'Select Product'}</label>
          <select
            value={selectedProductId}
            onChange={(e) => { setSelectedProductId(e.target.value); setBulkDrafts([]); fetchVariants(e.target.value); }}
            className="w-full sm:w-96 px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
          >
            <option value="">{t('variants.selectProduct') || 'Select a product'}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {!selectedProductId && (
            <span className="text-xs text-red-500">{t('variants.selectProductReq') || 'Please select a product to manage variants'}</span>
          )}
        </div>
      )}

      {/* Bulk Generate */}
      {bulkShow && (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-5 md:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('variants.bulkTitle')}</h2>
          <p className="text-sm text-gray-500 mb-4">অপশন বেছে নিন; নির্বাচিত অপশনগুলোর Cartesian combination তৈরি হবে।</p>
          {attributeTemplates.map((tpl) => {
            const opts = orderedOptions[tpl.name] || tpl.options || [];
            return (
              <div key={tpl.id} className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">{tpl.name} (order: drag items)</p>
                <div className="flex flex-wrap gap-2">
                  {opts.map((opt, idx) => (
                    <label
                      key={opt}
                      draggable
                      onDragStart={() => handleDragStart(tpl.name, idx)}
                      onDragOver={(e) => handleDragOver(e, tpl.name, idx)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-1 bg-blue-50 text-blue-700 rounded-lg px-3 py-1 text-xs border border-blue-200 cursor-grab active:cursor-grabbing ${draggedOption?.attrName === tpl.name && draggedOption?.index === idx ? 'opacity-50' : ''}`}
                    >
                      <FiMove className="w-3 h-3" />
                      <input type="checkbox" checked={(bulkOptions[tpl.name] || []).includes(opt)}
                        onChange={(event) => setBulkOptions((current) => ({
                          ...current,
                          [tpl.name]: event.target.checked
                            ? [...(current[tpl.name] || []), opt]
                            : (current[tpl.name] || []).filter((value) => value !== opt),
                        }))} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('variants.bulkSkuPrefix')} *</label>
              <input type="text" value={bulkSkuPrefix} onChange={(e) => setBulkSkuPrefix(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="TSHIRT" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('variants.bulkBasePrice')} *</label>
              <input type="number" step="0.01" value={bulkBasePrice} onChange={(e) => setBulkBasePrice(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="0.00" />
            </div>
          </div>
          {bulkDrafts.length > 0 && (
            <div className="mb-4 overflow-x-auto">
              <p className="mb-2 text-sm font-semibold text-gray-700">প্রতিটি কম্বিনেশনের দাম, স্টক, SKU ও ছবি সম্পাদনা করুন</p>
              <table className="w-full min-w-[760px] text-sm">
                <thead><tr className="border-b text-left text-xs text-gray-500">
                  <th className="p-2">কম্বিনেশন</th><th className="p-2">SKU</th><th className="p-2">দাম</th><th className="p-2">তুলনামূল্য</th><th className="p-2">স্টক</th><th className="p-2">ছবির URL</th>
                </tr></thead>
                <tbody>
                  {bulkDrafts.map((draft, index) => (
                    <tr key={`${JSON.stringify(draft.attributes)}-${index}`} className="border-b">
                      <td className="p-2 whitespace-nowrap">{Object.values(draft.attributes).join(' / ')}</td>
                      {(['sku', 'price', 'compareAtPrice', 'stock', 'image'] as const).map((field) => (
                        <td key={field} className="p-2">
                          <input type={field === 'price' || field === 'stock' || field === 'compareAtPrice' ? 'number' : 'text'}
                            min={field === 'stock' ? 0 : undefined}
                            step={field === 'price' || field === 'compareAtPrice' ? '0.01' : undefined}
                            value={draft[field]}
                            onChange={(event) => setBulkDrafts((rows) => rows.map((row, rowIndex) =>
                              rowIndex === index ? { ...row, [field]: event.target.value } : row))}
                            className="w-full min-w-24 rounded-sm border border-gray-200 px-2 py-1.5" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={handleBulkGenerate} disabled={generating}
              className="px-6 py-2.5 bg-red-600 text-white rounded-sm hover:bg-red-700 disabled:opacity-50 transition-all text-sm font-semibold">
              কম্বিনেশন তৈরি করুন
            </button>
            {bulkDrafts.length > 0 && (
              <button onClick={createBulkVariants} disabled={generating || !selectedProductId}
                className="px-6 py-2.5 bg-orange-600 text-white rounded-sm hover:bg-orange-700 disabled:opacity-50 transition-all text-sm font-semibold">
                {generating ? 'সংরক্ষণ হচ্ছে...' : `${bulkDrafts.length}টি ভ্যারিয়েন্ট সংরক্ষণ করুন`}
              </button>
            )}
            <button onClick={() => setBulkShow(false)}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 transition-all text-sm font-semibold">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-5 md:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingVariant ? t('variants.editTitle') : t('variants.createTitle')}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('variants.sku')} *</label>
                <input {...register('sku', { required: t('variants.skuReq') })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="PROD-001" />
                {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('variants.price')} *</label>
                <input {...register('price', { required: t('variants.priceReq') })} type="number" step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="0.00" />
                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cost Price</label>
                <input {...register('costPrice')} type="number" step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('variants.comparePrice')}</label>
                <input {...register('compareAtPrice')} type="number" step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('variants.stock')} *</label>
                <input {...register('stock', { required: t('variants.stockReq') })} type="number"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="0" />
                {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Supplier</label>
                <select {...register('supplierId')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  <option value="">No supplier</option>
                  {suppliers.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('variants.image')}</label>
                <input {...register('image')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="https://example.com/image.jpg" />
              </div>
            </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">{t('variants.selectAttr')}</label>
               {attributeTemplates.length === 0 ? (
                 <div className="bg-red-50 border border-red-200 rounded-sm p-3">
                   <p className="text-red-800 text-sm">Create attribute templates first</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                   {attributeTemplates.map((tpl) => {
                     const isColor = tpl.type === 'color' || tpl.name.toLowerCase() === 'color';
                     return (
                       <div key={tpl.id}>
                         <label className="block text-xs font-medium text-gray-600 mb-1">{tpl.name}</label>
                         {isColor ? (
                           <select value={selectedAttributes[tpl.name] || ''}
                             onChange={(e) => {
                               const newAttrs = { ...selectedAttributes, [tpl.name]: e.target.value };
                               setSelectedAttributes(newAttrs);
                             }}
                             className="w-full px-3 py-2.5 border border-gray-200 rounded-sm outline-none text-sm">
                             <option value="">-- Select Color --</option>
                             {orderedOptions[tpl.name]?.map((opt) => (
                               <option key={opt} value={opt}>{opt}</option>
                             ))}
                           </select>
                         ) : (
                           <select value={selectedAttributes[tpl.name] || ''}
                             onChange={(e) => setSelectedAttributes({ ...selectedAttributes, [tpl.name]: e.target.value })}
                             className="w-full px-3 py-2.5 border border-gray-200 rounded-sm outline-none text-sm">
                             <option value="">-- Select --</option>
                             {orderedOptions[tpl.name]?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                         )}
                       </div>
                     );
                   })}
                 </div>
               )}
             </div>

             {/* Color-wise image URL */}
             {selectedAttributes.Color && (
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1.5">🖼️ Image URL for Color: {selectedAttributes.Color}</label>
                 <input
                   type="text"
                   value={colorImageUrls[selectedAttributes.Color] || ''}
                   onChange={(e) => setColorImageUrls({ ...colorImageUrls, [selectedAttributes.Color]: e.target.value })}
                   className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm"
                   placeholder="https://example.com/color-image.jpg"
                 />
                 <p className="text-xs text-gray-400 mt-1">Upload a color-specific image. This image will show when this color variant is selected on the frontend.</p>
               </div>
             )}
             <div className="flex flex-col sm:flex-row gap-3 pt-2">
               <button type="submit"
                 className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-all text-sm font-semibold">
                 {editingVariant ? 'Update' : 'Create'}
               </button>
               <button type="button" onClick={() => { setShowForm(false); setEditingVariant(null); reset({ productId: selectedProductId }); setSelectedAttributes({}); setColorImageUrls({}); }}
                 className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 transition-all text-sm font-semibold">
                 {t('common.cancel')}
               </button>
             </div>
          </form>
        </div>
      )}

      {/* Variants List */}
      {variants.length === 0 ? (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-8 md:p-12 text-center">
          <p className="text-gray-500">{t('variants.noVariants')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Attributes</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {variants.map((variant) => {
                  const v = variant as VariantWithExtra;
                  const attrs = v.attributes as Record<string, string>;
                  return (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{v.sku}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {Object.entries(attrs).map(([key, value]) => (
                          <span key={key} className="inline-block bg-gray-100 rounded px-2 py-0.5 text-xs mr-1 mb-1">{key}: {value}</span>
                        ))}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">৳{v.price.toFixed(2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{v.costPrice ? `৳${v.costPrice.toFixed(2)}` : '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={variant.stock <= 5 ? 'text-red-600 font-semibold' : 'text-gray-900'}>{variant.stock}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(variant)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(variant.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleAdjustStock(variant.id)} className="px-2 py-1 text-red-600 bg-red-50 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">Stock</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}