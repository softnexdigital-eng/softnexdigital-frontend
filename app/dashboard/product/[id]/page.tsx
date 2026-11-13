'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { showToast } from '@/lib/toast';
import { FiSave, FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX, FiRefreshCw, FiDollarSign, FiGrid, FiCheck, FiMinus, FiPlus as FiPlusIcon, FiCopy, FiChevronDown } from 'react-icons/fi';
import { Product, Variant } from '@/types';

interface AttributeTemplate {
  id: string;
  name: string;
  type: string;
  options: string[];
}

// MultiSelectDropdown component for attribute selection
function MultiSelectDropdown({ label, options, selected, onChange }: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value];
    onChange(newSelected);
  };

  const isAllSelected = selected.length > 0 && selected.length === options.length;

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-sm bg-white cursor-pointer flex items-center justify-between hover:border-gray-300 transition-colors"
      >
        <span className="text-sm text-gray-700 truncate">
          {selected.length === 0 ? `Select ${label}` : `${selected.length} of ${options.length} selected`}
        </span>
        <FiChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-sm shadow-lg max-h-60 overflow-y-auto p-2">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 mb-2">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={() => onChange(isAllSelected ? [] : [...options])}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700 cursor-pointer">Select All</label>
          </div>
          {options.map((opt) => (
            <div key={opt} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={(e) => { e.stopPropagation(); toggleOption(opt); }}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0"
              />
              <span className="text-sm text-gray-700 flex-shrink-0">{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingInfo, setEditingInfo] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const [attributeTemplates, setAttributeTemplates] = useState<AttributeTemplate[]>([]);

  // Variant form
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [vSku, setVSku] = useState('');
  const [vPrice, setVPrice] = useState('');
  const [vCompare, setVCompare] = useState('');
  const [vCost, setVCost] = useState('');
  const [vStock, setVStock] = useState('');
  const [vImage, setVImage] = useState('');
  const [vAttributes, setVAttributes] = useState<Record<string, string[]>>({});

  const fetchProduct = useCallback(async () => {
    try {
      const res = await api.get(`/product/${productId}`);
      if (res.data.success) {
        setProduct(res.data.data);
        setEditName(res.data.data.name || '');
        setEditDesc(res.data.data.description || '');
        setEditPrice(res.data.data.basePrice ? String(res.data.data.basePrice) : '');
      }
    } catch {
      showToast.error('Failed to load product');
      router.push('/dashboard/product');
    }
  }, [productId, router]);

  const fetchVariants = useCallback(async () => {
    try {
      const res = await api.get(`/variants?productId=${productId}`);
      if (res.data.success) {
        setVariants(res.data.data as Variant[]);
      }
    } catch {}
  }, [productId]);

  const fetchAttributeTemplates = useCallback(async () => {
    try {
      const res = await api.get('/attribute-templates');
      if (res.data.success) setAttributeTemplates(res.data.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProduct(), fetchVariants(), fetchAttributeTemplates()])
      .finally(() => setLoading(false));
  }, [fetchProduct, fetchVariants, fetchAttributeTemplates]);

  const handleSaveInfo = async () => {
    setSaving(true);
    try {
      await api.put(`/product/${productId}`, {
        name: editName,
        description: editDesc,
        basePrice: editPrice ? parseFloat(editPrice) : null,
      });
      showToast.success('Product info updated');
      setEditingInfo(false);
      await fetchProduct();
    } catch {
      showToast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setVSku('');
    setVPrice('');
    setVCompare('');
    setVCost('');
    setVStock('');
    setVImage('');
    setVAttributes({});
    setEditingVariant(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (variant: Variant) => {
    setEditingVariant(variant);
    setVSku(variant.sku);
    setVPrice(String(variant.price));
    setVCompare(variant.compareAtPrice ? String(variant.compareAtPrice) : '');
    setVCost(String((variant as any).costPrice || ''));
    setVStock(String(variant.stock));
    setVImage(variant.image || '');
    
    // Parse attributes from stored format (could be JSON string or comma-separated string)
    const rawAttrs = typeof variant.attributes === 'object' ? variant.attributes : {};
    const parsedAttrs: Record<string, string[]> = {};
    Object.entries(rawAttrs).forEach(([key, value]) => {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          parsedAttrs[key] = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          parsedAttrs[key] = value ? [value] : [];
        }
      } else if (Array.isArray(value)) {
        parsedAttrs[key] = value;
      } else {
        parsedAttrs[key] = [];
      }
    });
    setVAttributes(parsedAttrs);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!vSku.trim()) { showToast.error('SKU is required'); return; }
    if (!vPrice) { showToast.error('Price is required'); return; }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        productId,
        sku: vSku.trim(),
        price: Number(vPrice),
        compareAtPrice: vCompare ? Number(vCompare) : undefined,
        costPrice: vCost ? Number(vCost) : 0,
        stock: Number(vStock) || 0,
        image: vImage || undefined,
        attributes: vAttributes,
      };

      if (editingVariant) {
        await api.put(`/variants/${editingVariant.id}`, payload);
        showToast.success('Variant updated');
      } else {
        await api.post('/variants', payload);
        showToast.success('Variant created');
      }

      fetchVariants();
      setShowForm(false);
      resetForm();
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to save variant');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async (id: string) => {
    if (!confirm('Delete this variant?')) return;
    try {
      await api.delete(`/variants/${id}`);
      showToast.success('Variant deleted');
      fetchVariants();
    } catch {
      showToast.error('Failed to delete variant');
    }
  };

  const handleAdjustStock = async (id: string) => {
    const qty = prompt('Enter quantity to add (negative to deduct):');
    if (qty === null) return;
    try {
      await api.post(`/variants/${id}/adjust-stock`, { quantity: Number(qty), reason: 'manual_adjustment' });
      showToast.success('Stock adjusted');
      fetchVariants();
    } catch {
      showToast.error('Failed to adjust stock');
    }
  };

  const duplicateVariant = async (variant: Variant) => {
    const newSku = variant.sku + '-copy';
    try {
      await api.post('/variants', {
        productId,
        sku: newSku,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice || undefined,
        costPrice: (variant as any).costPrice || 0,
        stock: 0,
        attributes: typeof variant.attributes === 'object' ? variant.attributes : {},
        image: variant.image || undefined,
      });
      showToast.success('Duplicated as ' + newSku);
      fetchVariants();
    } catch (error: any) {
      showToast.error(error.response?.data?.message || 'Failed to duplicate');
    }
  };

  const formatCurrency = (amount: number) => `৳${amount.toFixed(2)}`;

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-sm h-10 w-10 border-2 border-blue-600 border-t-transparent" /></div>;
  if (!product) return <div className="text-center py-16"><p className="text-gray-500">Product not found</p></div>;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/product')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-sm">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500">{variants.length} variant(s)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditingInfo(!editingInfo)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-sm text-sm hover:bg-gray-200">
            <FiEdit2 className="w-4 h-4 inline mr-1.5" /> Edit Info
          </button>
          <button onClick={() => router.push('/dashboard/product')} className="px-4 py-2 bg-blue-600 text-white rounded-sm text-sm hover:bg-blue-700">
            <FiCheck className="w-4 h-4 inline mr-1.5" /> Done
          </button>
        </div>
      </div>

      {/* Product Info */}
      {editingInfo && (
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Product Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Price</label>
              <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSaveInfo} disabled={saving} className="px-5 py-2.5 bg-blue-600 text-white rounded-sm text-sm hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Info'}
            </button>
            <button onClick={() => setEditingInfo(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-sm text-sm hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Product images summary */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
            <p className="text-sm text-gray-500">Manage cover images shown on catalog page</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(product as any).imagesRel?.map((img: any, idx: number) => (
            <div key={img.id} className="relative rounded-sm overflow-hidden border border-gray-200 bg-gray-50">
              <img src={img.url} alt={`Product ${idx + 1}`} className="w-full h-32 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="absolute top-1 left-1 bg-blue-600 text-white text-[8px] px-1 rounded">{idx === 0 ? 'Primary' : `Image ${idx + 1}`}</span>
            </div>
          ))}
          {(product as any).imagesRel?.length === 0 && (
            <p className="text-sm text-gray-400 col-span-full">No product images yet. Add images in product details or create variants with images.</p>
          )}
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Variants</h3>
            <p className="text-sm text-gray-500">SKU, price, stock, attributes</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openCreateForm} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-sm hover:bg-blue-700">
              <FiPlus className="w-4 h-4" /> Add Variant
            </button>
            {variants.length > 0 && (
              <button onClick={() => variants.forEach(v => handleDeleteVariant(v.id))} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-sm hover:bg-red-700">
                <FiTrash2 className="w-4 h-4" /> Delete All
              </button>
            )}
          </div>
        </div>

        {variants.length === 0 ? (
          <div className="p-12 text-center">
            <FiGrid className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">No variants yet</p>
            <button onClick={openCreateForm} className="px-6 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 text-sm font-semibold">
              Add First Variant
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Attributes</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {variants.map((variant) => {
                  const attrs = typeof variant.attributes === 'object' ? variant.attributes : {};
                  const attrStr = Object.entries(attrs)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                    .join(', ');
                  return (
                    <tr key={variant.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono font-medium text-gray-900">{variant.sku}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-[250px] truncate">{attrStr}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(variant.price)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-medium text-red-700 bg-red-100">{variant.stock}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => duplicateVariant(variant)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" title="Duplicate">
                            <FiCopy className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleAdjustStock(variant.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Adjust Stock">
                            <FiPlusIcon className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openEditForm(variant)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteVariant(variant.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Variant Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-sm shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingVariant ? 'Edit Variant' : 'Add Variant'}
              </h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product ID</label>
                  <input type="text" value={productId} readOnly className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm bg-gray-50" placeholder="Auto from product" />
                  <p className="mt-1 text-xs text-gray-400">Product ID is taken from the current product page URL.</p>
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU <span className="text-red-500">*</span></label>
                  <input type="text" value={vSku} onChange={(e) => setVSku(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="e.g. TSHIRT-RED-M" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price <span className="text-red-500">*</span></label>
                  <input type="number" step="0.01" value={vPrice} onChange={(e) => setVPrice(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Compare At Price</label>
                  <input type="number" step="0.01" value={vCompare} onChange={(e) => setVCompare(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cost Price</label>
                  <input type="number" step="0.01" value={vCost} onChange={(e) => setVCost(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock <span className="text-red-500">*</span></label>
                  <input type="number" value={vStock} onChange={(e) => setVStock(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Variant Image URL</label>
                  <input type="text" value={vImage} onChange={(e) => setVImage(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-sm outline-none text-sm" placeholder="https://example.com/image.jpg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attributes</label>
                <p className="text-xs text-gray-400 mb-3">Select attribute values for this variant</p>
                {attributeTemplates.length === 0 ? (
                  <div className="bg-red-50 border border-red-200 rounded-sm p-3">
                    <p className="text-red-800 text-sm">No attribute templates found. Create them first in Settings → Attribute Templates.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attributeTemplates.map((tpl) => {
                      const currentSelected = vAttributes[tpl.name] || [];
                      return (
                        <MultiSelectDropdown
                          key={tpl.id}
                          label={tpl.name}
                          options={tpl.options}
                          selected={currentSelected}
                          onChange={(values) => setVAttributes({ ...vAttributes, [tpl.name]: values })}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold">
                  {saving ? 'Saving...' : editingVariant ? 'Update Variant' : 'Create Variant'}
                </button>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 text-sm font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


