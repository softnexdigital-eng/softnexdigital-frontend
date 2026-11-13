'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { FiX, FiPlus, FiSave, FiArrowRight, FiImage, FiChevronDown, FiTrash2, FiFolder } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
}

export default function CreateProductPage() {
  const { t } = useLanguage();
  const router = useRouter();

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [brandId, setBrandId] = useState('');
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');

  // SEO fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  // UI
  const [saving, setSaving] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandRes, catRes] = await Promise.all([
          api.get('/brands'),
          api.get('/categories'),
        ]);
        if (brandRes.data.success) setBrands(brandRes.data.data || []);
        if (catRes.data.success) setAllCategories(catRes.data.data || []);
      } catch {}
    };
    fetchData();
  }, []);

  const toggleCategory = (catId: string) => {
    setSelectedCatIds(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const addImage = () => {
    const url = imageInput.trim();
    if (!url) return;
    if (imageUrls.includes(url)) {
      showToast.error('Image already added');
      return;
    }
    setImageUrls(prev => [...prev, url]);
    setImageInput('');
  };

  const removeImage = (url: string) => {
    setImageUrls(prev => prev.filter(u => u !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast.error('Product name is required');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        name: name.trim(),
        description: description.trim(),
        brandId: brandId || null,
        categoryIds: selectedCatIds.length > 0 ? selectedCatIds : undefined,
        images: imageUrls.length > 0 ? imageUrls : [],
      };

      if (basePrice) payload.basePrice = parseFloat(basePrice);

      if (metaTitle.trim()) payload.metaTitle = metaTitle.trim();
      if (metaDescription.trim()) payload.metaDescription = metaDescription.trim();
      if (metaKeywords.trim()) payload.metaKeywords = metaKeywords.trim();

      const response = await api.post('/product', payload);
      if (response.data.success) {
        showToast.success('Product created successfully!');
        router.push(`/dashboard/product/${response.data.data.id}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create product';
      showToast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Product</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in product details, add images, and create variants in one place.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            <FiFolder className="w-4 h-4 inline mr-2" /> Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-base"
                placeholder="e.g. Premium Cotton T-Shirt"
                required
                autoFocus
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-5 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-base resize-none"
                placeholder="Describe your product..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base Price</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg">৳</span>
                <input
                  type="number"
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full pl-12 pr-5 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-base"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">You can set individual variant prices later</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full px-5 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-base bg-white"
              >
                <option value="">No Brand</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div className="border border-gray-200 rounded-sm p-3 max-h-48 overflow-y-auto">
              {allCategories.length === 0 ? (
                <p className="text-xs text-gray-400 p-2">No categories yet. Create categories first.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {allCategories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCatIds.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                      {cat.parent && <span className="text-xs text-gray-400">({cat.parent.name})</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedCatIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedCatIds.map(id => {
                  const cat = allCategories.find(c => c.id === id);
                  return cat ? (
                    <span key={id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-lg">
                      {cat.name}
                      <button onClick={() => toggleCategory(id)} className="text-blue-600 hover:text-blue-800">
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Images */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
            <p className="text-xs text-gray-400 mb-3">Add image URLs (first one will be the primary/cover image)</p>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                className="flex-1 px-5 py-3 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-base"
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-5 py-3 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-all text-sm font-medium"
              >
                <FiPlus className="w-5 h-5" /> Add Image
              </button>
            </div>
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-sm overflow-hidden border border-gray-200">
                    <img src={url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                    {idx === 0 && <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[8px] px-1 rounded">Primary</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Advanced / SEO Section */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 md:p-8">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full px-6 py-4 text-left text-lg font-semibold text-gray-900"
          >
            <span>Advanced Options</span>
            <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="SEO title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                    placeholder="Brief description for search engines"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="keyword1, keyword2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4 pt-8 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push('/dashboard/product')}
            className="px-8 py-3.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 transition-all text-base font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-10 py-3.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:opacity-50 transition-all text-base font-semibold shadow-sm"
          >
            <FiSave className="w-5 h-5" />
            {saving ? 'Creating Product...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}